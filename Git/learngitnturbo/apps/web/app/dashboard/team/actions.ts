"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sendStaffInviteEmail } from "../../../lib/email/resend";
import {
  getAuthenticatedContext,
  type StaffRole,
  type StaffStatus,
} from "../../../lib/auth";
import {
  inviteStaffSchema,
  changeRoleSchema,
  removeStaffSchema,
  staffIdSchema,
  revokeInviteSchema,
  acceptInviteSchema,
  ROLE_LABELS,
  INVITABLE_ROLES,
  type InviteStaffInput,
  type ChangeRoleInput,
  type RemoveStaffInput,
  type StaffIdInput,
  type RevokeInviteInput,
  type AcceptInviteInput,
  type InvitableRole,
} from "../../../lib/schemas/team";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & RESPONSE SHAPES
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffMemberItem {
  id: string;
  fullName: string;
  email: string; // from auth.users via profiles.id join
  phone: string | null;
  role: StaffRole;
  roleLabel: string;
  status: StaffStatus;
  avatarUrl: string | null;
  avatarInitials: string;
  avatarBgColor: string; // e.g. "bg-blue-100 text-blue-700"
  department: string | null;
  joiningDate: string | null;
  formattedJoiningDate: string | null;
  lastActiveAt: string | null;
  formattedLastActive: string | null;
  isCurrentUser: boolean;
  canBeModifiedByCurrentUser: boolean;
}

export interface PendingInviteItem {
  id: string;
  email: string;
  fullName: string | null;
  intendedRole: string;
  intendedRoleLabel: string;
  invitedByName: string;
  sentAt: string;
  formattedSentAt: string; // relative time
  expiresAt: string;
  isExpired: boolean;
  status: "pending" | "expired";
}

export interface TeamOverviewStats {
  totalActive: number;
  pendingInvites: number;
  suspendedCount: number;
  rolesInUse: number;
}

export interface TeamRosterResponse {
  success: boolean;
  staff: StaffMemberItem[];
  invites: PendingInviteItem[];
  stats: TeamOverviewStats;
  currentUserRole: StaffRole;
  canManageStaff: boolean;
  canInvite: boolean;
  canRemove: boolean;
  error?: string;
}

export interface StaffActivityStats {
  assignedLeadsCount: number;
  closedDealsCount: number;
  testDrivesConducted: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESENTATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_BG_PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-neutral-100 text-neutral-700",
];

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "U";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1];
  const firstChar = first[0] || "U";
  const lastChar = last?.[0] || "";
  return (firstChar + lastChar).toUpperCase();
}

function getAvatarBgColor(name: string, role: StaffRole): string {
  if (role === "owner") {
    return "bg-neutral-950 text-white";
  }
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const index = Math.abs(sum) % AVATAR_BG_PALETTE.length;
  return AVATAR_BG_PALETTE[index] || "bg-blue-100 text-blue-700";
}

function formatRelativeTime(isoString: string | null): string | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Just now";

  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 365) return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatJoiningDate(dateString: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

const ROLE_PRIORITY: Record<StaffRole, number> = {
  owner: 1,
  admin: 2,
  sales_manager: 3,
  sales_executive: 4,
  inventory_manager: 5,
  accountant: 6,
  viewer: 7,
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 1: getTeamRosterAction
// Fetches all profiles & active/expired invites for the caller's showroom
// ─────────────────────────────────────────────────────────────────────────────

export async function getTeamRosterAction(): Promise<TeamRosterResponse> {
  try {
    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!authContext || !dealershipId || !authContext.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    const supabase = authContext.supabase;
    const callerId = authContext.user.id;
    const callerRole = authContext.profile.role;
    const callerEmail = authContext.user.email || "";

    // 1. Fetch all profiles belonging to this showroom
    const { data: dbProfiles, error: profilesError } = await (supabase.from("profiles") as any)
      .select("id, full_name, role, status, phone, avatar_url, department, joining_date, last_active_at, created_at")
      .eq("dealership_id", dealershipId);

    if (profilesError) {
      console.error("Error fetching staff profiles:", profilesError);
      throw new Error("Could not retrieve team roster.");
    }

    const profilesList = (dbProfiles || []) as Array<{
      id: string;
      full_name: string | null;
      role: string;
      status: string;
      phone: string | null;
      avatar_url: string | null;
      department: string | null;
      joining_date: string | null;
      last_active_at: string | null;
      created_at: string;
    }>;

    // Create a fast map for inviter lookup
    const profileMap = new Map<string, string>();
    for (const p of profilesList) {
      profileMap.set(p.id, p.full_name || "Showroom Staff");
    }

    // 2. Fetch staff invites (pending or expired)
    const { data: dbInvites, error: invitesError } = await (supabase.from("staff_invites") as any)
      .select("id, email, full_name, intended_role, status, expires_at, created_at, invited_by")
      .eq("dealership_id", dealershipId)
      .in("status", ["pending", "expired"])
      .order("created_at", { ascending: false });

    if (invitesError) {
      console.error("Error fetching staff invites:", invitesError);
    }

    const invitesList = (dbInvites || []) as Array<{
      id: string;
      email: string;
      full_name: string | null;
      intended_role: string;
      status: string;
      expires_at: string;
      created_at: string;
      invited_by: string;
    }>;

    const now = new Date();

    // 3. Map invites to presentation structure
    const invites: PendingInviteItem[] = invitesList.map((inv) => {
      const expiresAtDate = new Date(inv.expires_at);
      const isExpired = expiresAtDate.getTime() < now.getTime() || inv.status === "expired";
      const displayStatus: "pending" | "expired" = isExpired ? "expired" : "pending";
      const intendedRole = inv.intended_role;
      const intendedRoleLabel = ROLE_LABELS[intendedRole] || intendedRole;
      const invitedByName = profileMap.get(inv.invited_by) || "Showroom Principal";

      return {
        id: inv.id,
        email: inv.email,
        fullName: inv.full_name,
        intendedRole,
        intendedRoleLabel,
        invitedByName,
        sentAt: inv.created_at,
        formattedSentAt: formatRelativeTime(inv.created_at) || "Recently",
        expiresAt: inv.expires_at,
        isExpired,
        status: displayStatus,
      };
    });

    // 4. Map profiles to presentation structure
    const staff: StaffMemberItem[] = profilesList.map((p) => {
      const role = (p.role || "viewer") as StaffRole;
      const status = (p.status || "active") as StaffStatus;
      const fullName = p.full_name || "Showroom Staff";
      const isCurrentUser = p.id === callerId;

      // TODO: The profiles table does NOT store email directly; email is stored in auth.users.
      // For Phase 3, we populate email for the current user and empty string for peers.
      // This will be enhanced in Phase 5 / future migration by syncing email into profiles.
      const email = isCurrentUser ? callerEmail : "";

      let canBeModifiedByCurrentUser = false;
      if (callerRole === "owner" && !isCurrentUser) {
        canBeModifiedByCurrentUser = true;
      } else if (callerRole === "admin" && role !== "owner" && !isCurrentUser) {
        canBeModifiedByCurrentUser = true;
      }

      return {
        id: p.id,
        fullName,
        email,
        phone: p.phone,
        role,
        roleLabel: ROLE_LABELS[role] || "Staff Member",
        status,
        avatarUrl: p.avatar_url,
        avatarInitials: getAvatarInitials(fullName),
        avatarBgColor: getAvatarBgColor(fullName, role),
        department: p.department,
        joiningDate: p.joining_date,
        formattedJoiningDate: formatJoiningDate(p.joining_date),
        lastActiveAt: p.last_active_at,
        formattedLastActive: formatRelativeTime(p.last_active_at),
        isCurrentUser,
        canBeModifiedByCurrentUser,
      };
    });

    // 5. Sort staff: owner first, then admin, then alphabetical by full_name
    staff.sort((a, b) => {
      const priorityA = ROLE_PRIORITY[a.role] ?? 99;
      const priorityB = ROLE_PRIORITY[b.role] ?? 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.fullName.localeCompare(b.fullName);
    });

    // 6. Compute overview stats
    const totalActive = staff.filter((s) => s.status === "active").length;
    const suspendedCount = staff.filter((s) => s.status === "suspended").length;
    const pendingInvites = invites.filter((inv) => inv.status === "pending" && !inv.isExpired).length;
    const activeRoles = new Set(staff.filter((s) => s.status === "active").map((s) => s.role));
    const rolesInUse = activeRoles.size;

    return {
      success: true,
      staff,
      invites,
      stats: {
        totalActive,
        pendingInvites,
        suspendedCount,
        rolesInUse,
      },
      currentUserRole: callerRole,
      canManageStaff: ["owner", "admin"].includes(callerRole),
      canInvite: ["owner", "admin"].includes(callerRole),
      canRemove: ["owner", "admin"].includes(callerRole),
    };
  } catch (err: any) {
    console.error("Failed to load team roster workspace:", err);
    return {
      success: false,
      staff: [],
      invites: [],
      stats: {
        totalActive: 0,
        pendingInvites: 0,
        suspendedCount: 0,
        rolesInUse: 0,
      },
      currentUserRole: "viewer",
      canManageStaff: false,
      canInvite: false,
      canRemove: false,
      error: err?.message || "An unexpected error occurred while loading team roster.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 2: getStaffActivityStatsAction
// On-demand stats for the staff detail slide-over drawer
// ─────────────────────────────────────────────────────────────────────────────

export async function getStaffActivityStatsAction(staffId: string): Promise<{
  success: boolean;
  data?: StaffActivityStats;
  error?: string;
}> {
  try {
    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!authContext || !dealershipId || !authContext.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    if (!authContext.permissions.canManageStaff) {
      throw new Error("Only showroom owners and administrators can view staff performance metrics.");
    }

    const supabase = authContext.supabase;

    // 1. Assigned leads count
    const { count: leadsCount, error: leadsErr } = await (supabase.from("leads") as any)
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", staffId)
      .eq("dealership_id", dealershipId);

    if (leadsErr) {
      console.error("Error counting assigned leads:", leadsErr);
    }

    // 2. Closed deals count
    const { count: dealsCount, error: dealsErr } = await (supabase.from("sales_deals") as any)
      .select("id", { count: "exact", head: true })
      .eq("sales_rep_id", staffId)
      .eq("dealership_id", dealershipId)
      .eq("status", "completed");

    if (dealsErr) {
      console.error("Error counting completed deals:", dealsErr);
    }

    // 3. Test drives conducted
    const { count: testDrivesCount, error: tdErr } = await (supabase.from("test_drives") as any)
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", staffId)
      .eq("dealership_id", dealershipId);

    if (tdErr) {
      console.error("Error counting test drives:", tdErr);
    }

    return {
      success: true,
      data: {
        assignedLeadsCount: leadsCount || 0,
        closedDealsCount: dealsCount || 0,
        testDrivesConducted: testDrivesCount || 0,
      },
    };
  } catch (err: any) {
    console.error("Failed to load staff activity stats:", err);
    return {
      success: false,
      error: err?.message || "Could not retrieve staff performance statistics.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 3: inviteStaffMemberAction
// Owner/Admin dispatches invite link for a new showroom member
// ─────────────────────────────────────────────────────────────────────────────

export async function inviteStaffMemberAction(rawInput: InviteStaffInput): Promise<{
  success: boolean;
  inviteId?: string;
  inviteUrl?: string;
  emailDelivered?: boolean;
  emailError?: string;
  error?: string;
}> {
  try {
    const parsed = inviteStaffSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid invitation details.",
      };
    }

    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!authContext || !dealershipId || !authContext.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    if (!authContext.can("staff:invite")) {
      throw new Error("Only showroom owners and administrators can invite team members.");
    }

    const supabase = authContext.supabase;
    const { fullName, email, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify no active pending invite exists for this email at this dealership
    const { data: existingInvite, error: existingErr } = await (supabase.from("staff_invites") as any)
      .select("id, expires_at, status")
      .eq("dealership_id", dealershipId)
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existingErr) {
      console.error("Error checking existing invites:", existingErr);
    }

    if (existingInvite) {
      const isNotExpired = new Date(existingInvite.expires_at).getTime() > Date.now();
      if (isNotExpired) {
        return {
          success: false,
          error: "An active invite already exists for this email address.",
        };
      }
    }

    // 2. Generate cryptographically secure token (64-character hex)
    const token = crypto.randomBytes(32).toString("hex");

    // 3. Set expiration to 72 hours from now
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    // 4. Insert staff invite record
    const { data: inserted, error: insertError } = await (supabase.from("staff_invites") as any)
      .insert({
        dealership_id: dealershipId,
        invited_by: authContext.user.id,
        email: normalizedEmail,
        full_name: fullName,
        intended_role: role,
        token,
        status: "pending",
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("Failed to insert staff invite:", insertError);
      return {
        success: false,
        error: "Failed to create staff invitation in the database.",
      };
    }

    // 5. Construct direct invitation URL
    let siteOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    if (!siteOrigin) {
      try {
        const headerList = await headers();
        const host = headerList.get("x-forwarded-host") || headerList.get("host");
        const proto = headerList.get("x-forwarded-proto") || "http";
        if (host) {
          siteOrigin = `${proto}://${host}`;
        }
      } catch {
        // Fallback if headers() is unavailable
      }
    }
    if (!siteOrigin) {
      siteOrigin = "http://localhost:3001";
    }

    const inviteUrl = `${siteOrigin}/accept-invite?token=${token}`;

    // 6. Dispatch branded transactional email via Resend
    const inviterName =
      authContext.profile.fullName ||
      authContext.user.email ||
      "Your Showroom Principal";
    const dealershipName = authContext.dealership.name || "Showroom";

    const emailRes = await sendStaffInviteEmail({
      to: normalizedEmail,
      recipientName: fullName,
      inviterName,
      dealershipName,
      role,
      roleLabel: ROLE_LABELS[role] || role,
      inviteUrl,
      expiresAt,
    });

    revalidatePath("/dashboard/team");
    return {
      success: true,
      inviteId: inserted.id,
      inviteUrl,
      emailDelivered: emailRes.success,
      emailError: emailRes.error,
    };
  } catch (err: any) {
    console.error("Failed to dispatch staff invitation:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while sending invite.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 4: revokeInviteAction
// Owner/Admin revokes a pending invitation
// ─────────────────────────────────────────────────────────────────────────────

export async function revokeInviteAction(rawInput: RevokeInviteInput): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const parsed = revokeInviteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid invite reference.",
      };
    }

    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!authContext || !dealershipId || !authContext.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    if (!authContext.can("staff:invite")) {
      throw new Error("Only showroom owners and administrators can revoke invitations.");
    }

    const supabase = authContext.supabase;

    const { data: updated, error: updateError } = await (supabase.from("staff_invites") as any)
      .update({
        status: "revoked",
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.inviteId)
      .eq("dealership_id", dealershipId)
      .eq("status", "pending")
      .select("id");

    if (updateError || !updated || updated.length === 0) {
      return {
        success: false,
        error: "Invite not found or already processed.",
      };
    }

    revalidatePath("/dashboard/team");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to revoke invitation:", err);
    return {
      success: false,
      error: err?.message || "Could not revoke staff invitation.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 5: changeStaffRoleAction
// Owner/Admin adjusts a staff member's role and permission scope
// ─────────────────────────────────────────────────────────────────────────────

export async function changeStaffRoleAction(rawInput: ChangeRoleInput): Promise<{
  success: boolean;
  staffName?: string;
  newRole?: string;
  error?: string;
}> {
  try {
    const parsed = changeRoleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid role change input.",
      };
    }

    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!authContext || !dealershipId || !authContext.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    if (!authContext.can("staff:change_role")) {
      throw new Error("Only showroom owners and administrators can modify roles.");
    }

    const supabase = authContext.supabase;
    const { staffId, newRole } = parsed.data;

    // Guard a: Caller cannot change their own role
    if (staffId === authContext.user.id) {
      return {
        success: false,
        error: "You cannot change your own role.",
      };
    }

    // 1. Fetch target profile
    const { data: targetProfile, error: fetchErr } = await (supabase.from("profiles") as any)
      .select("id, role, dealership_id, full_name, status")
      .eq("id", staffId)
      .maybeSingle();

    if (fetchErr || !targetProfile) {
      return {
        success: false,
        error: "Staff member profile could not be found.",
      };
    }

    // Guard b: Target must belong to caller's dealership
    if (targetProfile.dealership_id !== dealershipId) {
      return {
        success: false,
        error: "Staff member does not belong to your showroom.",
      };
    }

    // Guard c: If caller is admin, target must not be owner
    if (authContext.profile.role === "admin" && targetProfile.role === "owner") {
      return {
        success: false,
        error: "Administrators cannot modify the showroom owner's profile.",
      };
    }

    // Guard d: Cannot assign owner role
    if ((newRole as string) === "owner") {
      return {
        success: false,
        error: "The showroom principal role cannot be reassigned.",
      };
    }

    // Guard e: Target status must be active or suspended (not removed)
    if (targetProfile.status !== "active" && targetProfile.status !== "suspended") {
      return {
        success: false,
        error: "Cannot change the role of an inactive or removed staff member.",
      };
    }

    // 2. Update role
    const { error: updateErr } = await (supabase.from("profiles") as any)
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", staffId)
      .eq("dealership_id", dealershipId);

    if (updateErr) {
      console.error("Failed to update staff role:", updateErr);
      return {
        success: false,
        error: "Failed to update staff member's role.",
      };
    }

    revalidatePath("/dashboard/team");
    return {
      success: true,
      staffName: targetProfile.full_name || "Staff Member",
      newRole,
    };
  } catch (err: any) {
    console.error("Failed to update staff role:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while changing staff role.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 6: suspendStaffMemberAction
// Owner/Admin suspends an account with immediate effect
// ─────────────────────────────────────────────────────────────────────────────

export async function suspendStaffMemberAction(rawInput: StaffIdInput): Promise<{
  success: boolean;
  staffName?: string;
  error?: string;
}> {
  try {
    const parsed = staffIdSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid staff identifier.",
      };
    }

    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!authContext || !dealershipId || !authContext.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    if (!authContext.can("staff:suspend")) {
      throw new Error("Only showroom owners and administrators can suspend accounts.");
    }

    const supabase = authContext.supabase;
    const { staffId } = parsed.data;

    // Guard a: Cannot suspend self
    if (staffId === authContext.user.id) {
      return {
        success: false,
        error: "You cannot suspend your own account.",
      };
    }

    // 1. Fetch target profile
    const { data: target, error: fetchErr } = await (supabase.from("profiles") as any)
      .select("id, role, status, dealership_id, full_name")
      .eq("id", staffId)
      .maybeSingle();

    if (fetchErr || !target) {
      return {
        success: false,
        error: "Staff member profile could not be found.",
      };
    }

    // Guard d: Target belongs to caller's dealership
    if (target.dealership_id !== dealershipId) {
      return {
        success: false,
        error: "Staff member does not belong to your showroom.",
      };
    }

    // Guard b: Cannot suspend the owner
    if (target.role === "owner") {
      return {
        success: false,
        error: "The showroom principal cannot be suspended.",
      };
    }

    // Guard c: Admin cannot suspend another admin
    if (authContext.profile.role === "admin" && target.role === "admin") {
      return {
        success: false,
        error: "Administrators cannot suspend fellow administrators.",
      };
    }

    // 2. Perform suspension
    const { error: updateErr } = await (supabase.from("profiles") as any)
      .update({
        status: "suspended",
        updated_at: new Date().toISOString(),
      })
      .eq("id", staffId)
      .eq("dealership_id", dealershipId);

    if (updateErr) {
      console.error("Failed to suspend staff member:", updateErr);
      return {
        success: false,
        error: "Failed to suspend staff member.",
      };
    }

    revalidatePath("/dashboard/team");
    return {
      success: true,
      staffName: target.full_name || "Staff Member",
    };
  } catch (err: any) {
    console.error("Failed to suspend staff member:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while suspending account.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 7: reactivateStaffMemberAction
// Owner/Admin reinstates a suspended staff member
// ─────────────────────────────────────────────────────────────────────────────

export async function reactivateStaffMemberAction(rawInput: StaffIdInput): Promise<{
  success: boolean;
  staffName?: string;
  error?: string;
}> {
  try {
    const parsed = staffIdSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid staff identifier.",
      };
    }

    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!authContext || !dealershipId || !authContext.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    if (!authContext.can("staff:suspend")) {
      throw new Error("Only showroom owners and administrators can reactivate accounts.");
    }

    const supabase = authContext.supabase;
    const { staffId } = parsed.data;

    // 1. Fetch target profile
    const { data: target, error: fetchErr } = await (supabase.from("profiles") as any)
      .select("id, status, dealership_id, full_name")
      .eq("id", staffId)
      .maybeSingle();

    if (fetchErr || !target) {
      return {
        success: false,
        error: "Staff member profile could not be found.",
      };
    }

    // Guard a: Target belongs to caller's dealership
    if (target.dealership_id !== dealershipId) {
      return {
        success: false,
        error: "Staff member does not belong to your showroom.",
      };
    }

    // Guard b: Target must currently be suspended
    if (target.status !== "suspended") {
      return {
        success: false,
        error: "Staff member account is not currently suspended.",
      };
    }

    // 2. Perform reactivation
    const { error: updateErr } = await (supabase.from("profiles") as any)
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", staffId)
      .eq("dealership_id", dealershipId);

    if (updateErr) {
      console.error("Failed to reactivate staff member:", updateErr);
      return {
        success: false,
        error: "Failed to reactivate staff member account.",
      };
    }

    revalidatePath("/dashboard/team");
    return {
      success: true,
      staffName: target.full_name || "Staff Member",
    };
  } catch (err: any) {
    console.error("Failed to reactivate staff member:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while reactivating account.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION 8: removeStaffMemberAction
// Owner ONLY removes a member from the showroom with optional lead reassignment
// ─────────────────────────────────────────────────────────────────────────────

export async function removeStaffMemberAction(rawInput: RemoveStaffInput): Promise<{
  success: boolean;
  staffName?: string;
  error?: string;
}> {
  try {
    const parsed = removeStaffSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid removal parameters.",
      };
    }

    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!authContext || !dealershipId || !authContext.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    // Owner or Admin can manage and remove staff
    if (!authContext.can("staff:remove")) {
      return {
        success: false,
        error: "Only showroom owners and administrators can remove staff members.",
      };
    }

    const supabase = authContext.supabase;
    const { staffId, reassignTo } = parsed.data;

    // Guard a: Cannot remove yourself
    if (staffId === authContext.user.id) {
      return {
        success: false,
        error: "You cannot remove yourself from your own dealership.",
      };
    }

    // 1. Fetch target profile
    const { data: target, error: fetchErr } = await (supabase.from("profiles") as any)
      .select("id, role, status, dealership_id, full_name")
      .eq("id", staffId)
      .maybeSingle();

    if (fetchErr || !target) {
      return {
        success: false,
        error: "Staff member profile could not be found.",
      };
    }

    // Guard b: Target belongs to caller's dealership
    if (target.dealership_id !== dealershipId) {
      return {
        success: false,
        error: "Staff member does not belong to your showroom.",
      };
    }

    // Guard c: Cannot remove the owner
    if (target.role === "owner") {
      return {
        success: false,
        error: "The showroom principal cannot be removed.",
      };
    }

    // Guard d: Admin cannot remove another admin
    if (authContext.profile.role === "admin" && target.role === "admin") {
      return {
        success: false,
        error: "Administrators cannot remove fellow administrators.",
      };
    }

    // 2. Attempt atomic database-level RPC execution first
    try {
      const { data: rpcRes, error: rpcErr } = await (supabase.rpc as any)(
        "remove_showroom_staff",
        {
          p_staff_id: staffId,
          p_reassign_to: reassignTo || null,
        }
      );
      if (!rpcErr && rpcRes && typeof rpcRes === "object") {
        if (!rpcRes.success) {
          return {
            success: false,
            error: rpcRes.error || "Failed to remove staff member.",
          };
        }
        revalidatePath("/dashboard/team");
        revalidatePath("/dashboard/leads");
        return {
          success: true,
          staffName: rpcRes.staffName || target.full_name || "Staff Member",
        };
      }
    } catch {
      // Fallback to sequential database updates
    }

    // STEP A: Reassign open leads if reassignTo is provided
    if (reassignTo) {
      if (reassignTo === staffId) {
        return {
          success: false,
          error: "Cannot reassign leads to the staff member being removed.",
        };
      }

      // Verify reassign target belongs to this dealership
      const { data: reassignTarget, error: rTargetErr } = await (supabase.from("profiles") as any)
        .select("id, status")
        .eq("id", reassignTo)
        .eq("dealership_id", dealershipId)
        .maybeSingle();

      if (rTargetErr || !reassignTarget) {
        return {
          success: false,
          error: "Selected reassignment target does not belong to this showroom.",
        };
      }

      const { error: leadsUpdateErr } = await (supabase.from("leads") as any)
        .update({
          assigned_to: reassignTo,
          updated_at: new Date().toISOString(),
        })
        .eq("assigned_to", staffId)
        .eq("dealership_id", dealershipId);

      if (leadsUpdateErr) {
        console.error("Error reassigning leads:", leadsUpdateErr);
        return {
          success: false,
          error: "Failed to reassign customer leads during removal.",
        };
      }
    }

    // STEP B: Null out the profile's dealership link
    const { error: unlinkErr } = await (supabase.from("profiles") as any)
      .update({
        dealership_id: null,
        role: "viewer",
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", staffId)
      .eq("dealership_id", dealershipId);

    if (unlinkErr) {
      console.error("Error unlinking profile from dealership:", unlinkErr);
      return {
        success: false,
        error: "Failed to remove staff member from showroom records.",
      };
    }

    // STEP C: Revoke any still-pending invites created by this person
    const { error: invitesRevokeErr } = await (supabase.from("staff_invites") as any)
      .update({
        status: "revoked",
        updated_at: new Date().toISOString(),
      })
      .eq("invited_by", staffId)
      .eq("dealership_id", dealershipId)
      .eq("status", "pending");

    if (invitesRevokeErr) {
      console.warn("Could not revoke pending invites of removed staff:", invitesRevokeErr);
    }

    revalidatePath("/dashboard/team");
    revalidatePath("/dashboard/leads");

    return {
      success: true,
      staffName: target.full_name || "Staff Member",
    };
  } catch (err: any) {
    console.error("Failed to remove staff member:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while removing staff member.",
    };
  }
}
