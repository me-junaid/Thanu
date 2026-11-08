"use client";

import React, { useState, useEffect } from "react";
import { inviteStaffMemberAction } from "../actions";
import {
  INVITABLE_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type InvitableRole,
} from "../../../../lib/schemas/team";
import {
  X,
  Mail,
  User,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteStaffModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteStaffModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableRole>("sales_executive");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [successData, setSuccessData] = useState<{
    email: string;
    role: string;
    inviteUrl?: string;
    emailDelivered?: boolean;
  } | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setEmail("");
      setRole("sales_executive");
      setErrorMessage(null);
      setIsCopied(false);
      setSuccessData(null);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Please enter the staff member's full name (at least 2 characters).");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await inviteStaffMemberAction({
        fullName: fullName.trim(),
        email: email.trim(),
        role,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to create invitation. Please try again.");
      } else {
        setSuccessData({
          email: email.trim(),
          role: ROLE_LABELS[role] || role,
          inviteUrl: res.inviteUrl,
          emailDelivered: res.emailDelivered,
        });
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Invite dispatch error:", err);
      setErrorMessage("An unexpected error occurred while sending the invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!successData?.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(successData.inviteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback for older browsers or restricted iframe environments
      const textArea = document.createElement("textarea");
      textArea.value = successData.inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch (err) {
        console.error("Clipboard copy failed", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {successData ? (
          /* ── Success Confirmation Screen ── */
          <div className="text-center py-2 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-950">
                Staff Invitation Created
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto mt-1.5">
                An onboarding invitation for{" "}
                <span className="font-semibold text-neutral-900">{successData.email}</span> has
                been created with role{" "}
                <span className="font-semibold text-neutral-900">{successData.role}</span>.
              </p>
            </div>

            {/* Email delivery status indicator */}
            {successData.emailDelivered ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 px-3 py-2 text-xs text-emerald-800">
                <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>Branded invite email dispatched via Resend</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/80 border border-amber-200/80 px-3 py-2 text-xs text-amber-800">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>Automated email skipped (dev mode / API key pending). Share direct link below:</span>
              </div>
            )}

            {/* Direct Link Copy Box */}
            {successData.inviteUrl && (
              <div className="text-left rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                  <span>Direct Invitation Link</span>
                  <span className="text-amber-600 font-medium lowercase">valid 72h</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={successData.inviteUrl}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 font-mono select-all focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-2xs ${
                      isCopied
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-neutral-950 text-white hover:bg-neutral-800"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Invitation Form ── */
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-lg sm:text-xl">
                <Mail className="h-5 w-5 text-neutral-700" />
                <h2>Invite Team Member</h2>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Dispatch an invitation to a new staff member. The invite link expires in 72 hours.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Recipient Full Name */}
            <div>
              <label
                htmlFor="invite-fullName"
                className="block text-xs font-medium text-neutral-700"
              >
                Full Name
              </label>
              <div className="relative mt-1.5">
                <input
                  id="invite-fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 shadow-2xs hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* Recipient Email Address */}
            <div>
              <label
                htmlFor="invite-email"
                className="block text-xs font-medium text-neutral-700"
              >
                Work Email Address
              </label>
              <div className="relative mt-1.5">
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun@apexmotors.in"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 shadow-2xs hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="invite-role"
                className="block text-xs font-medium text-neutral-700"
              >
                Assigned Role
              </label>
              <div className="mt-1.5">
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as InvitableRole)}
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 shadow-2xs hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  {INVITABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r] || r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Role Description Box */}
              <div className="mt-2 rounded-xl border border-neutral-100 bg-neutral-50 p-2.5 text-[11px] text-neutral-600">
                <span className="font-semibold text-neutral-900 block mb-0.5">
                  Scope for {ROLE_LABELS[role]}:
                </span>
                {ROLE_DESCRIPTIONS[role]}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Creating invite...</span>
                  </>
                ) : (
                  <>
                    <span>Dispatch Invite</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

