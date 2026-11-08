"use client";

import React, { useState, useEffect } from "react";
import type { StaffMemberItem } from "../actions";
import { removeStaffMemberAction } from "../actions";
import {
  X,
  UserMinus,
  Loader2,
  AlertCircle,
  Users2,
  AlertTriangle,
} from "lucide-react";

interface RemoveStaffDialogProps {
  staff: StaffMemberItem | null;
  allStaff: StaffMemberItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RemoveStaffDialog({
  staff,
  allStaff,
  isOpen,
  onClose,
  onSuccess,
}: RemoveStaffDialogProps) {
  const [reassignTo, setReassignTo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available staff members to receive reassigned leads
  const otherActiveStaff = allStaff.filter(
    (s) => s.id !== staff?.id && s.status === "active"
  );

  useEffect(() => {
    if (isOpen) {
      setReassignTo(otherActiveStaff[0]?.id || "");
      setErrorMessage(null);
    }
  }, [isOpen, staff]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !staff) return null;

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await removeStaffMemberAction({
        staffId: staff.id,
        reassignTo: reassignTo ? reassignTo : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to remove staff member.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      console.error("Staff removal error:", err);
      setErrorMessage("An unexpected error occurred while removing staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <form onSubmit={handleRemove} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 border border-red-100 text-red-600">
              <UserMinus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-neutral-950">
                Remove Team Member
              </h2>
              <p className="text-xs text-neutral-500">
                Permanently revoke showroom access
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-red-200/80 bg-red-50/70 p-3.5 text-xs text-red-800 space-y-1">
            <p className="font-semibold">Irrevocable Access Revocation</p>
            <p className="text-[11px] leading-relaxed text-red-700">
              You are about to remove{" "}
              <span className="font-bold underline">{staff.fullName}</span> (
              {staff.roleLabel}) from this dealership workspace. Their active login sessions
              will be detached immediately.
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

          {/* Lead Reassignment Selector */}
          {otherActiveStaff.length > 0 && (
            <div>
              <label
                htmlFor="reassign-select"
                className="block text-xs font-semibold text-neutral-800"
              >
                Reassign Customer Leads & Inquiries
              </label>
              <p className="text-[11px] text-neutral-500 mb-1.5">
                Transfer any open customer leads assigned to this salesperson:
              </p>
              <select
                id="reassign-select"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 shadow-2xs hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {otherActiveStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.roleLabel})
                  </option>
                ))}
              </select>
            </div>
          )}

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
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <span>Permanently Remove Access</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

