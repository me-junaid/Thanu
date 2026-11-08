"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@repo/supabase/server";
import { acceptInviteSchema, ROLE_LABELS } from "../../lib/schemas/team";

export interface InviteValidationDetails {
  inviteId: string;
  email: string;
  fullName: string | null;
  role: string;
  roleLabel: string;
  dealershipName: string;
  dealershipCity: string | null;
}

export type InviteValidationResult =
  | {
      valid: true;
      data: InviteValidationDetails;
      currentUser: {
        isLoggedIn: boolean;
        email?: string;
        isEmailMatching: boolean;
        hasExistingOtherDealership: boolean;
      };
    }
  | {
      valid: false;
      reason: "invalid" | "revoked" | "already_accepted" | "expired";
      error: string;
    };

/**
 * STEP 1: Safely inspect an invite token without modifying database state.
 */
export async function validateAndGetInviteDetailsAction(
  rawToken: string
): Promise<InviteValidationResult> {
  const parsed = acceptInviteSchema.safeParse({ token: rawToken });
  if (!parsed.success) {
    return {
      valid: false,
      reason: "invalid",
      error: "This invitation link is invalid or malformed.",
    };
  }

  const token = parsed.data.token;
  const supabase = await createClient();

  // 1. Fetch invite details (joined with dealership)
  let inviteRecord: {
    id: string;
    email: string;
    full_name: string | null;
    intended_role: string;
    status: string;
    expires_at: string;
    dealership_id?: string;
    dealership?: {
      id: string;
      name: string;
      city: string | null;
    } | null;
  } | null = null;

  // Method A (Primary & Secure): Call the security-definer function get_staff_invite_by_token
  const { data: rpcData, error: rpcErr } = await (supabase.rpc as any)(
    "get_staff_invite_by_token",
    { p_token: token }
  );

  if (!rpcErr && rpcData) {
    inviteRecord = {
      id: rpcData.id,
      email: rpcData.email,
      full_name: rpcData.fullName,
      intended_role: rpcData.intendedRole,
      status: rpcData.status,
      expires_at: rpcData.expiresAt,
      dealership_id: rpcData.dealershipId,
      dealership: {
        id: rpcData.dealershipId,
        name: rpcData.dealershipName,
        city: rpcData.dealershipCity,
      },
    };
  } else {
    // Method B (Fallback for authenticated showroom owner/admin testing their own invite)
    const { data: dbInvite, error: inviteErr } = await (supabase.from("staff_invites") as any)
      .select(`
        id,
        email,
        full_name,
        intended_role,
        status,
        expires_at,
        dealership_id,
        dealership:dealerships(id, name, city)
      `)
      .eq("token", token)
      .maybeSingle();

    if (!inviteErr && dbInvite) {
      inviteRecord = dbInvite;
    } else if (rpcErr) {
      console.warn(
        "[AcceptInvite] get_staff_invite_by_token lookup failed:",
        rpcErr.message || rpcErr
      );
    }
  }

  if (!inviteRecord) {
    return {
      valid: false,
      reason: "invalid",
      error: "This invitation link is invalid or does not exist.",
    };
  }

  // 2. Validate lifecycle status
  if (inviteRecord.status === "revoked") {
    return {
      valid: false,
      reason: "revoked",
      error: "This invitation has been revoked by the showroom manager.",
    };
  }

  if (inviteRecord.status === "accepted") {
    return {
      valid: false,
      reason: "already_accepted",
      error: "This invitation has already been accepted. You can proceed to sign in.",
    };
  }

  const isExpired =
    inviteRecord.status === "expired" ||
    new Date(inviteRecord.expires_at).getTime() < Date.now();

  if (isExpired) {
    return {
      valid: false,
      reason: "expired",
      error: "This invitation link has expired (72-hour window passed).",
    };
  }

  // 3. Inspect currently signed-in user session (if any)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasExistingOtherDealership = false;
  if (user) {
    const { data: currentProfile } = await (supabase.from("profiles") as any)
      .select("dealership_id")
      .eq("id", user.id)
      .maybeSingle();

    if (
      currentProfile?.dealership_id &&
      currentProfile.dealership_id !== inviteRecord.dealership_id
    ) {
      // Check if current showroom is an empty placeholder from accidental onboarding redirect (0 vehicles, 0 leads)
      const { count: vehicleCount } = await (supabase.from("vehicles") as any)
        .select("id", { count: "exact", head: true })
        .eq("dealership_id", currentProfile.dealership_id);

      const { count: leadCount } = await (supabase.from("leads") as any)
        .select("id", { count: "exact", head: true })
        .eq("dealership_id", currentProfile.dealership_id);

      const isPlaceholder = (vehicleCount || 0) === 0 && (leadCount || 0) === 0;
      if (!isPlaceholder) {
        hasExistingOtherDealership = true;
      }
    }
  }

  const role = inviteRecord.intended_role;
  const roleLabel = ROLE_LABELS[role] || role;
  const dealershipName = inviteRecord.dealership?.name || "Apex Motors";
  const dealershipCity = inviteRecord.dealership?.city || null;

  const currentEmailNormalized = user?.email?.toLowerCase().trim();
  const inviteEmailNormalized = inviteRecord.email.toLowerCase().trim();
  const isEmailMatching = Boolean(
    user && currentEmailNormalized === inviteEmailNormalized
  );

  return {
    valid: true,
    data: {
      inviteId: inviteRecord.id,
      email: inviteRecord.email,
      fullName: inviteRecord.full_name,
      role,
      roleLabel,
      dealershipName,
      dealershipCity,
    },
    currentUser: {
      isLoggedIn: Boolean(user),
      email: user?.email,
      isEmailMatching,
      hasExistingOtherDealership,
    },
  };
}

/**
 * STEP 2: Finalize membership onboarding and assign caller to dealership
 */
export async function acceptInviteAction(
  rawToken: string
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  try {
    const parsed = acceptInviteSchema.safeParse({ token: rawToken });
    if (!parsed.success) {
      return { success: false, error: "Invalid invitation token." };
    }

    const token = parsed.data.token;
    const supabase = await createClient();

    // Guard 1: Caller must be authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Please sign in or create an account to accept this invitation.",
      };
    }

    // Attempt atomic database-level RPC execution first (ensures single transaction & row locking)
    try {
      const { data: rpcRes, error: rpcErr } = await (supabase.rpc as any)(
        "accept_staff_invite",
        { p_token: token }
      );
      if (!rpcErr && rpcRes && typeof rpcRes === "object") {
        if (!rpcRes.success) {
          return {
            success: false,
            error: rpcRes.error || "Could not accept invitation.",
          };
        }
        revalidatePath("/dashboard/team");
        revalidatePath("/dashboard");
        return {
          success: true,
          redirectUrl: "/dashboard",
        };
      }
    } catch {
      // Fallback to application-layer verification
    }

    // Guard 2: Fetch and validate invite from DB
    const { data: invite, error: fetchErr } = await (supabase.from("staff_invites") as any)
      .select("id, dealership_id, email, full_name, intended_role, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (fetchErr || !invite) {
      return {
        success: false,
        error: "Invitation not found or could not be loaded.",
      };
    }

    if (invite.status !== "pending") {
      return {
        success: false,
        error: `This invitation cannot be accepted because it is marked as '${invite.status}'.`,
      };
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return {
        success: false,
        error: "This invitation link has expired.",
      };
    }

    // Guard 3: Email match check
    const userEmail = user.email?.toLowerCase().trim() || "";
    const inviteEmail = invite.email.toLowerCase().trim();

    if (userEmail !== inviteEmail) {
      return {
        success: false,
        error: `You are signed in as ${user.email}, but this invitation was sent to ${invite.email}. Please sign in with the invited email address.`,
      };
    }

    // Guard 4: Cross-dealership conflict check
    const { data: profile, error: profileErr } = await (supabase.from("profiles") as any)
      .select("id, full_name, dealership_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr) {
      console.error("Error inspecting user profile:", profileErr);
    }

    if (profile?.dealership_id && profile.dealership_id !== invite.dealership_id) {
      // Check if current showroom is an empty placeholder from accidental onboarding redirect (0 vehicles, 0 leads)
      const { count: vehicleCount } = await (supabase.from("vehicles") as any)
        .select("id", { count: "exact", head: true })
        .eq("dealership_id", profile.dealership_id);

      const { count: leadCount } = await (supabase.from("leads") as any)
        .select("id", { count: "exact", head: true })
        .eq("dealership_id", profile.dealership_id);

      const isEmptyPlaceholder = (vehicleCount || 0) === 0 && (leadCount || 0) === 0;

      if (!isEmptyPlaceholder) {
        return {
          success: false,
          error:
            "Your account is already associated with an active showroom. Orgetise staff accounts cannot belong to multiple dealerships simultaneously.",
        };
      }

      // Safe cleanup of orphan placeholder showroom created during onboarding redirect
      const orphanDealershipId = profile.dealership_id;
      try {
        await (supabase.from("dealerships") as any)
          .delete()
          .eq("id", orphanDealershipId);
      } catch {
        // Non-blocking if RLS restricts delete
      }
    }

    // Step 5: Update public.profiles
    const finalFullName = profile?.full_name || invite.full_name || "Showroom Staff";
    const { error: profileUpdateErr } = await (supabase.from("profiles") as any)
      .update({
        dealership_id: invite.dealership_id,
        role: invite.intended_role,
        status: "active",
        full_name: finalFullName,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileUpdateErr) {
      console.error("Failed to update staff profile during invite acceptance:", profileUpdateErr);
      return {
        success: false,
        error: "Could not link your account to this showroom. Please try again.",
      };
    }

    // Step 6: Mark staff_invite as accepted
    const { error: inviteUpdateErr } = await (supabase.from("staff_invites") as any)
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (inviteUpdateErr) {
      console.warn("Could not mark invite status as accepted:", inviteUpdateErr);
    }

    // Revalidate paths
    revalidatePath("/dashboard/team");
    revalidatePath("/dashboard");

    return {
      success: true,
      redirectUrl: "/dashboard",
    };
  } catch (err: any) {
    console.error("Failed to accept invitation:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while accepting invite.",
    };
  }
}

/**
 * Sign out of current account and redirect back to invite URL
 */
export async function signOutAndSwitchAccountAction(token: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/accept-invite?token=${encodeURIComponent(token)}`);
}

