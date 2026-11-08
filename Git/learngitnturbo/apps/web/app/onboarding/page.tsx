import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@repo/supabase/server";
import { OnboardingWizard } from "../../components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Dealership Onboarding & Storefront Setup | Orgetise",
  description:
    "Set up your branded digital pre-owned automobile dealership storefront, showroom location, WhatsApp inquiry channel, and certified inventory.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check profiles table first (Option A source of truth)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()
    .returns<{ onboarding_completed: boolean } | null>();

  // If already onboarded, skip to dashboard
  if (profile?.onboarding_completed || user.user_metadata?.onboarding_completed) {
    redirect("/dashboard");
  }

  // Intercept invited staff: if user has an active pending staff invite, redirect to acceptance
  let pendingInviteToken: string | null = null;

  try {
    const { data: inviteToken } = await (supabase.rpc as any)(
      "get_my_pending_invite_token"
    );
    if (inviteToken && typeof inviteToken === "string") {
      pendingInviteToken = inviteToken;
    }
  } catch {
    // Non-blocking fallback if RPC is not yet created in remote DB
  }

  // Fallback: direct staff_invites query if RPC failed or was not defined
  if (!pendingInviteToken && user.email) {
    try {
      const { data: directInvite } = await (supabase.from("staff_invites") as any)
        .select("token")
        .ilike("email", user.email.toLowerCase().trim())
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (directInvite?.token) {
        pendingInviteToken = directInvite.token;
      }
    } catch {
      // Non-blocking
    }
  }

  // MUST BE OUTSIDE try/catch so Next.js NEXT_REDIRECT error is not swallowed
  if (pendingInviteToken) {
    redirect(`/accept-invite?token=${encodeURIComponent(pendingInviteToken)}`);
  }

  return <OnboardingWizard />;
}

