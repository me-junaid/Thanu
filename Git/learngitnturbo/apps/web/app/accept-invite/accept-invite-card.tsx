"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  acceptInviteAction,
  signOutAndSwitchAccountAction,
  type InviteValidationDetails,
} from "./actions";
import {
  Building2,
  ShieldCheck,
  Mail,
  ArrowRight,
  LogOut,
  Loader2,
  AlertCircle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

interface AcceptInviteCardProps {
  token: string;
  initialValidation:
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
}

export function AcceptInviteCard({ token, initialValidation }: AcceptInviteCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, startSignOutTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // STATE 1: Error / Invalid / Expired / Revoked
  // ───────────────────────────────────────────────────────────────────────────
  if (!initialValidation.valid) {
    const { reason, error } = initialValidation;

    let Icon = ShieldAlert;
    let iconBg = "bg-red-50 text-red-600 border-red-100";
    let title = "Invitation Unavailable";

    if (reason === "expired") {
      Icon = Clock;
      iconBg = "bg-amber-50 text-amber-600 border-amber-100";
      title = "Invitation Expired";
    } else if (reason === "already_accepted") {
      Icon = CheckCircle2;
      iconBg = "bg-emerald-50 text-emerald-600 border-emerald-100";
      title = "Invitation Already Accepted";
    }

    return (
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-neutral-900/5 text-center">
        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${iconBg}`}
        >
          <Icon className="h-7 w-7" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl">
          {title}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
          {error}
        </p>

        <div className="mt-8 pt-6 border-t border-neutral-100 space-y-3">
          <Link
            href={reason === "already_accepted" ? "/dashboard" : "/login"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-95"
          >
            <span>{reason === "already_accepted" ? "Open Dealership Dashboard" : "Proceed to Sign In"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/"
            className="block text-xs font-medium text-neutral-500 hover:text-neutral-900 transition"
          >
            Back to Orgetise Home
          </Link>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATE 2: Valid Invitation
  // ───────────────────────────────────────────────────────────────────────────
  const { data: invite, currentUser } = initialValidation;

  const handleAcceptInvite = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await acceptInviteAction(token);
      if (!res.success) {
        setActionError(res.error || "Failed to accept invitation. Please try again.");
      } else if (res.redirectUrl) {
        router.push(res.redirectUrl);
      }
    });
  };

  const handleSignOutAndSwitch = () => {
    startSignOutTransition(async () => {
      await signOutAndSwitchAccountAction(token);
    });
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-neutral-200/90 bg-white p-7 sm:p-10 shadow-2xl shadow-neutral-900/5">
      {/* Header */}
      <div className="text-center pb-6 border-b border-neutral-100">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-mono font-semibold text-neutral-700 mb-4">
          <Building2 className="h-3.5 w-3.5 text-neutral-500" />
          <span>{invite.dealershipName}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
          Join the Showroom Team
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500">
          You have been officially invited to join{" "}
          <span className="font-semibold text-neutral-900">{invite.dealershipName}</span>{" "}
          as an authorized team member.
        </p>
      </div>

      {/* Details Box */}
      <div className="my-6 rounded-2xl border border-neutral-200/80 bg-[#FDFBF7] p-5 space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-neutral-500 font-medium">
            <ShieldCheck className="h-4 w-4 text-neutral-400" />
            Assigned Role
          </span>
          <span className="inline-flex items-center rounded-lg bg-neutral-950 px-2.5 py-1 text-xs font-semibold text-white">
            {invite.roleLabel}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-neutral-500 font-medium">
            <Mail className="h-4 w-4 text-neutral-400" />
            Invited Email
          </span>
          <span className="font-mono font-semibold text-neutral-900 truncate max-w-[220px]">
            {invite.email}
          </span>
        </div>

        {invite.fullName && (
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-neutral-500 font-medium">
              <UserCheck className="h-4 w-4 text-neutral-400" />
              Recipient Name
            </span>
            <span className="font-semibold text-neutral-900">
              {invite.fullName}
            </span>
          </div>
        )}
      </div>

      {/* Error alert if acceptance fails */}
      {actionError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Contextual Action Scenarios */}
      {currentUser.isLoggedIn ? (
        currentUser.isEmailMatching ? (
          /* ── Case A: Signed in with MATCHING email ── */
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-xs text-emerald-900">
              <span className="font-medium">Signed in as:</span>
              <span className="font-mono font-bold truncate max-w-[200px]">
                {currentUser.email}
              </span>
            </div>

            <button
              onClick={handleAcceptInvite}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Joining {invite.dealershipName}...</span>
                </>
              ) : (
                <>
                  <span>Accept Invitation & Open Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* ── Case B: Signed in with MISMATCHED email ── */
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Account Mismatch</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                You are currently signed in as <span className="font-mono font-bold">{currentUser.email}</span>,
                but this invitation is addressed specifically to{" "}
                <span className="font-mono font-bold">{invite.email}</span>.
              </p>
            </div>

            <button
              onClick={handleSignOutAndSwitch}
              disabled={isSigningOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-xs font-bold text-neutral-900 shadow-2xs hover:bg-neutral-50 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
                  <span>Switching accounts...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 text-neutral-500" />
                  <span>Sign Out & Switch Account</span>
                </>
              )}
            </button>
          </div>
        )
      ) : (
        /* ── Case C: User is NOT logged in ── */
        <div className="space-y-3">
          <Link
            href={`/signup?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(invite.email)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition active:scale-95"
          >
            <span>Create Account & Join Team</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href={`/login?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(invite.email)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 hover:border-neutral-300 transition active:scale-95"
          >
            <span>Already have an account? Sign In</span>
          </Link>
        </div>
      )}

      {/* Footer reassurance */}
      <div className="mt-8 pt-5 border-t border-neutral-100 text-center">
        <p className="text-[11px] text-neutral-400">
          Secured by Orgetise Dealership OS. Single-showroom tenant isolation active.
        </p>
      </div>
    </div>
  );
}

