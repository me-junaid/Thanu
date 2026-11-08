"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { StaffMemberItem, StaffActivityStats } from "../actions";
import { getStaffActivityStatsAction } from "../actions";
import {
  X,
  Shield,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  Users2,
  ReceiptText,
  CalendarCheck2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  UserMinus,
  Edit,
} from "lucide-react";

interface StaffDetailDrawerProps {
  staff: StaffMemberItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRoleChange: (staff: StaffMemberItem) => void;
  onOpenRemove: (staff: StaffMemberItem) => void;
  onToggleSuspend: (staff: StaffMemberItem) => Promise<void>;
  isTogglingSuspend: boolean;
  canManageStaff: boolean;
  canRemove: boolean;
}

export function StaffDetailDrawer({
  staff,
  isOpen,
  onClose,
  onOpenRoleChange,
  onOpenRemove,
  onToggleSuspend,
  isTogglingSuspend,
  canManageStaff,
  canRemove,
}: StaffDetailDrawerProps) {
  const [stats, setStats] = useState<StaffActivityStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (isOpen && staff) {
      setIsLoadingStats(true);
      getStaffActivityStatsAction(staff.id)
        .then((res) => {
          if (res.success && res.data) {
            setStats(res.data);
          } else {
            setStats({ assignedLeadsCount: 0, closedDealsCount: 0, testDrivesConducted: 0 });
          }
        })
        .catch(() => {
          setStats({ assignedLeadsCount: 0, closedDealsCount: 0, testDrivesConducted: 0 });
        })
        .finally(() => {
          setIsLoadingStats(false);
        });
    }
  }, [isOpen, staff]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !staff) return null;

  const permissionsList = getRolePermissions(staff.role);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-2xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-neutral-200/90">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200/80 bg-[#FDFBF7] relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-mono text-base font-bold shadow-2xs ${staff.avatarBgColor}`}
              >
                {staff.avatarInitials}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950">
                    {staff.fullName}
                  </h2>
                  {staff.isCurrentUser && (
                    <span className="rounded-full bg-neutral-900 text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                      You
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-lg bg-neutral-950 px-2 py-0.5 text-xs font-semibold text-white">
                    {staff.roleLabel}
                  </span>

                  {staff.status === "active" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Contact Details Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs pt-4 border-t border-neutral-200/60">
              <div className="flex items-center gap-2 text-neutral-600 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{staff.email || "No email visible"}</span>
              </div>

              <div className="flex items-center gap-2 text-neutral-600 truncate">
                <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{staff.phone || "No phone added"}</span>
              </div>

              <div className="flex items-center gap-2 text-neutral-600 truncate">
                <Building className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{staff.department || "General Team"}</span>
              </div>

              <div className="flex items-center gap-2 text-neutral-600 truncate">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">Joined {staff.formattedJoiningDate || "Recent"}</span>
              </div>
            </div>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ── 01. Activity & Performance Metrics ── */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono mb-3">
                Operational Track Record
              </h3>

              {isLoadingStats ? (
                <div className="grid grid-cols-3 gap-2.5 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-neutral-100" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Leads */}
                  <Link
                    href={`/dashboard/leads?search=${encodeURIComponent(staff.fullName)}`}
                    className="rounded-2xl border border-neutral-200/80 bg-white p-3 text-center shadow-2xs hover:border-neutral-300 transition block group"
                  >
                    <div className="flex justify-center text-neutral-400 group-hover:text-amber-600 transition">
                      <Users2 className="h-4 w-4" />
                    </div>
                    <div className="font-serif text-xl font-bold text-neutral-900 mt-1">
                      {stats?.assignedLeadsCount ?? 0}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium truncate mt-0.5">
                      Assigned Leads
                    </div>
                  </Link>

                  {/* Deals */}
                  <Link
                    href="/dashboard/accounting"
                    className="rounded-2xl border border-neutral-200/80 bg-white p-3 text-center shadow-2xs hover:border-neutral-300 transition block group"
                  >
                    <div className="flex justify-center text-neutral-400 group-hover:text-emerald-600 transition">
                      <ReceiptText className="h-4 w-4" />
                    </div>
                    <div className="font-serif text-xl font-bold text-neutral-900 mt-1">
                      {stats?.closedDealsCount ?? 0}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium truncate mt-0.5">
                      Deals Closed
                    </div>
                  </Link>

                  {/* Test Drives */}
                  <Link
                    href="/dashboard/test-drives"
                    className="rounded-2xl border border-neutral-200/80 bg-white p-3 text-center shadow-2xs hover:border-neutral-300 transition block group"
                  >
                    <div className="flex justify-center text-neutral-400 group-hover:text-blue-600 transition">
                      <CalendarCheck2 className="h-4 w-4" />
                    </div>
                    <div className="font-serif text-xl font-bold text-neutral-900 mt-1">
                      {stats?.testDrivesConducted ?? 0}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium truncate mt-0.5">
                      Drives Held
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* ── 02. Role Permission Scope ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Role Permission Matrix
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">
                  {staff.roleLabel}
                </span>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 divide-y divide-neutral-200/50">
                {permissionsList.map((perm, idx) => (
                  <div key={idx} className="flex items-start justify-between py-2.5 first:pt-0 last:pb-0 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-neutral-900 block">
                        {perm.title}
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {perm.desc}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        perm.allowed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {perm.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last active status */}
            <div className="flex items-center justify-between text-xs text-neutral-500 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                Last active session
              </span>
              <span className="font-mono text-neutral-800 font-medium">
                {staff.formattedLastActive || "No recorded activity"}
              </span>
            </div>
          </div>

          {/* Quick Action Footer */}
          {staff.canBeModifiedByCurrentUser && (
            <div className="p-5 border-t border-neutral-200/80 bg-neutral-50 flex items-center justify-end gap-2.5 flex-wrap">
              {/* Change Role Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRoleChange(staff);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition active:scale-95 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 text-neutral-500" />
                <span>Change Role</span>
              </button>

              {/* Suspend / Reactivate Button */}
              <button
                type="button"
                disabled={isTogglingSuspend}
                onClick={() => onToggleSuspend(staff)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                  staff.status === "active"
                    ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                }`}
              >
                {isTogglingSuspend ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : staff.status === "active" ? (
                  <>
                    <UserX className="h-3.5 w-3.5 text-amber-700" />
                    <span>Suspend</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Reactivate</span>
                  </>
                )}
              </button>

              {/* Remove Staff Member (Owner Only) */}
              {canRemove && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRemove(staff);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition active:scale-95 cursor-pointer"
                >
                  <UserMinus className="h-3.5 w-3.5 text-red-600" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getRolePermissions(role: string): Array<{
  title: string;
  desc: string;
  level: string;
  allowed: boolean;
}> {
  switch (role) {
    case "owner":
      return [
        { title: "Fleet Inventory", desc: "Manage stock, procurement costs, & media", level: "Full", allowed: true },
        { title: "Leads & CRM Pipeline", desc: "View & assign all showroom inquiries", level: "Full", allowed: true },
        { title: "Sales & Accounting", desc: "View gross margins, landed cost, & P&L", level: "Full", allowed: true },
        { title: "Team & Access Control", desc: "Invite, suspend, and remove staff", level: "Full", allowed: true },
        { title: "Subscription & Billing", desc: "Manage Orgetise plan & payment methods", level: "Full", allowed: true },
      ];
    case "admin":
      return [
        { title: "Fleet Inventory", desc: "Manage stock, procurement costs, & media", level: "Full", allowed: true },
        { title: "Leads & CRM Pipeline", desc: "View & assign all showroom inquiries", level: "Full", allowed: true },
        { title: "Sales & Accounting", desc: "Manage deals, gate passes, & workshop bills", level: "Full", allowed: true },
        { title: "Team Management", desc: "Invite & modify non-owner staff members", level: "Limited", allowed: true },
        { title: "Subscription & Billing", desc: "Cannot view or modify billing plan", level: "Blocked", allowed: false },
      ];
    case "sales_manager":
      return [
        { title: "Fleet Inventory", desc: "View vehicle specs & floor availability", level: "Read Only", allowed: true },
        { title: "Leads & CRM Pipeline", desc: "Full pipeline control & rep assignment", level: "Full", allowed: true },
        { title: "Test Drive Operations", desc: "Schedule drives & issue digital gate passes", level: "Full", allowed: true },
        { title: "Sales Deals", desc: "Draft quotations & track token bookings", level: "Deals Only", allowed: true },
        { title: "Procurement Margins", desc: "Purchase price & gross margins hidden", level: "Blocked", allowed: false },
      ];
    case "sales_executive":
      return [
        { title: "Leads Pipeline", desc: "Manage assigned prospects and inquiries", level: "Own Records", allowed: true },
        { title: "Test Drive Operations", desc: "Conduct drives with customer gate passes", level: "Assigned", allowed: true },
        { title: "Deal Quotations", desc: "Prepare deal sheets at standard asking prices", level: "Limited", allowed: true },
        { title: "Procurement Costs", desc: "Vehicle purchase cost and margins hidden", level: "Blocked", allowed: false },
        { title: "Team Management", desc: "Cannot view other staff performance", level: "Blocked", allowed: false },
      ];
    case "inventory_manager":
      return [
        { title: "Fleet Inventory", desc: "Create listings, manage media & specs", level: "Full", allowed: true },
        { title: "Reconditioning & Invoices", desc: "Log workshop repairs & reconditioning bills", level: "Full", allowed: true },
        { title: "Procurement Costs", desc: "View landed cost & refurbishment totals", level: "Full", allowed: true },
        { title: "Customer Leads & Deals", desc: "No access to customer deals or financing", level: "Blocked", allowed: false },
      ];
    case "accountant":
      return [
        { title: "Payment Ledger", desc: "Record tokens, bank transfers, & loans", level: "Full", allowed: true },
        { title: "GST Margin Scheme", desc: "Statutory tax calculations & P&L statements", level: "Full", allowed: true },
        { title: "RTO Ownership Transfers", desc: "Track transfer charges & RC updates", level: "Full", allowed: true },
        { title: "Sales Operations", desc: "Cannot assign leads or manage inventory", level: "Blocked", allowed: false },
      ];
    default:
      return [
        { title: "Showroom Overview", desc: "View top-level KPI metrics", level: "Read Only", allowed: true },
        { title: "Showroom Inventory", desc: "Browse vehicle floor listings", level: "Read Only", allowed: true },
        { title: "Operations & Modifications", desc: "Cannot modify any records or data", level: "Blocked", allowed: false },
      ];
  }
}

