"use client";

import React, { useState, useEffect } from "react";
import type { StaffMemberItem } from "../actions";
import { changeStaffRoleAction } from "../actions";
import {
  INVITABLE_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type InvitableRole,
} from "../../../../lib/schemas/team";
import {
  X,
  ShieldAlert,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
} from "lucide-react";

interface RoleChangeDialogProps {
  staff: StaffMemberItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoleChangeDialog({
  staff,
  isOpen,
  onClose,
  onSuccess,
}: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<InvitableRole>("sales_executive");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (staff && staff.role !== "owner") {
      setSelectedRole(staff.role as InvitableRole);
      setErrorMessage(null);
    }
  }, [staff, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedRole === staff.role) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changeStaffRoleAction({
        staffId: staff.id,
        newRole: selectedRole,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update role.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      console.error("Role update error:", err);
      setErrorMessage("An unexpected error occurred while modifying role.");
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-lg">
              <Shield className="h-5 w-5 text-neutral-700" />
              <h2>Change Team Role</h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Modify the operational role and permissions for{" "}
              <span className="font-semibold text-neutral-900">{staff.fullName}</span>.
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

          {/* Current vs New Role Preview */}
          <div className="rounded-2xl border border-neutral-200/80 bg-[#FDFBF7] p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">
                Current Role
              </span>
              <span className="font-semibold text-neutral-900">
                {staff.roleLabel}
              </span>
            </div>

            <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0" />

            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-1">
                New Role
              </span>
              <span className="font-semibold text-neutral-900">
                {ROLE_LABELS[selectedRole]}
              </span>
            </div>
          </div>

          {/* Role Dropdown */}
          <div>
            <label
              htmlFor="new-role-select"
              className="block text-xs font-medium text-neutral-700"
            >
              Select New Scope
            </label>
            <div className="mt-1.5">
              <select
                id="new-role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as InvitableRole)}
                className="block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 shadow-2xs hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {INVITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] || r}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mt-2 rounded-xl border border-neutral-100 bg-neutral-50 p-2.5 text-[11px] text-neutral-600">
              {ROLE_DESCRIPTIONS[selectedRole]}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-[11px] text-amber-900">
            <span className="font-semibold">Immediate Effect: </span>
            This role change takes effect immediately on their next request.
          </div>

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
              disabled={isSubmitting || selectedRole === staff.role}
              className="flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating role...</span>
                </>
              ) : (
                <span>Confirm Role Change</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

