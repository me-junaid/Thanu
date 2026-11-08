"use client";

import React, { useState, useRef, useEffect } from "react";
import type { StaffMemberItem } from "../actions";
import type { StaffRole } from "../../../../lib/auth";
import {
  ROLE_LABELS,
  INVITABLE_ROLES,
} from "../../../../lib/schemas/team";
import {
  Search,
  X,
  MoreVertical,
  Shield,
  Eye,
  Edit,
  UserX,
  UserCheck,
  UserMinus,
  Mail,
  Phone,
  Clock,
  Users,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface TeamRosterTableProps {
  staff: StaffMemberItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: string;
  onRoleChange: (r: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  canManageStaff: boolean;
  canRemove: boolean;
  onViewDetails: (staff: StaffMemberItem) => void;
  onRoleChangeRequest: (staff: StaffMemberItem) => void;
  onToggleSuspend: (staff: StaffMemberItem) => Promise<void>;
  isTogglingSuspendId: string | null;
  onRemoveRequest: (staff: StaffMemberItem) => void;
  onOpenInviteModal: () => void;
}

export function TeamRosterTable({
  staff,
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  canManageStaff,
  canRemove,
  onViewDetails,
  onRoleChangeRequest,
  onToggleSuspend,
  isTogglingSuspendId,
  onRemoveRequest,
  onOpenInviteModal,
}: TeamRosterTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter staff members based on search and selected filters
  const filteredStaff = staff.filter((member) => {
    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = member.fullName.toLowerCase().includes(q);
      const matchEmail = member.email.toLowerCase().includes(q);
      const matchPhone = member.phone ? member.phone.toLowerCase().includes(q) : false;
      const matchRole = member.roleLabel.toLowerCase().includes(q);
      const matchDept = member.department ? member.department.toLowerCase().includes(q) : false;

      if (!matchName && !matchEmail && !matchPhone && !matchRole && !matchDept) {
        return false;
      }
    }

    // 2. Role Filter
    if (selectedRole !== "all" && member.role !== selectedRole) {
      return false;
    }

    // 3. Status Filter
    if (selectedStatus !== "all" && member.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    onSearchChange("");
    onRoleChange("all");
    onStatusChange("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || selectedRole !== "all" || selectedStatus !== "all";

  return (
    <div className="space-y-4">
      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 bg-white shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, or role..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-9 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 shadow-2xs hover:border-neutral-300 focus:bg-white focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns & Clear */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:border-neutral-300 focus:border-neutral-900 focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="owner">Showroom Principal</option>
            {INVITABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r] || r}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:border-neutral-300 focus:border-neutral-900 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
            >
              Clear
            </button>
          )}

          {/* Count Badge */}
          <span className="text-[11px] font-mono text-neutral-400 ml-auto md:ml-2">
            Showing {filteredStaff.length} of {staff.length}
          </span>
        </div>
      </div>

      {/* ── Main Roster Table ── */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-2xs overflow-visible">
        {filteredStaff.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              {staff.length === 1
                ? "Your showroom team has just 1 member"
                : "No matching staff members"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {staff.length === 1
                ? "Invite your sales managers, advisors, and accountants to delegate inquiries and deal flow."
                : "No team members matched your current filters. Try resetting the search or filter pills."}
            </p>

            <div className="pt-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition"
                >
                  Clear search filters
                </button>
              ) : canManageStaff ? (
                <button
                  type="button"
                  onClick={onOpenInviteModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
                >
                  Invite First Staff Member
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 pl-5 pr-4 font-semibold">Team Member</th>
                  <th className="py-3.5 px-4 font-semibold">Role & Access Tier</th>
                  <th className="py-3.5 px-4 font-semibold">Account Status</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Contact</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Last Active</th>
                  <th className="py-3.5 pl-4 pr-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredStaff.map((member) => {
                  const isMenuOpen = activeMenuId === member.id;
                  const isToggling = isTogglingSuspendId === member.id;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-neutral-50/60 transition group"
                    >
                      {/* 1. Member Column */}
                      <td className="py-4 pl-5 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold shadow-2xs ${member.avatarBgColor}`}
                          >
                            {member.avatarInitials}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => onViewDetails(member)}
                                className="font-bold text-neutral-950 hover:underline text-left truncate cursor-pointer"
                              >
                                {member.fullName}
                              </button>
                              {member.isCurrentUser && (
                                <span className="rounded-full bg-neutral-950 text-white px-2 py-0.5 text-[9px] font-mono font-bold shrink-0">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                              {member.department || "Showroom Team"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role & Hierarchy */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-2xs ${
                            member.role === "owner"
                              ? "bg-neutral-950 text-white"
                              : member.role === "admin"
                              ? "bg-neutral-800 text-white"
                              : member.role === "sales_manager"
                              ? "bg-blue-50 text-blue-800 border border-blue-200/80"
                              : member.role === "sales_executive"
                              ? "bg-indigo-50 text-indigo-800 border border-indigo-200/80"
                              : member.role === "accountant"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                              : member.role === "inventory_manager"
                              ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          <Shield className="h-3 w-3 shrink-0 opacity-80" />
                          <span>{member.roleLabel}</span>
                        </span>
                      </td>

                      {/* 3. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {member.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      {/* 4. Contact Info */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="space-y-0.5 text-[11px] text-neutral-500">
                          {member.email ? (
                            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                              <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
                              <span className="truncate font-mono">{member.email}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Member session</span>
                          )}

                          {member.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-neutral-400 shrink-0" />
                              <span className="font-mono">{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 5. Last Active */}
                      <td className="py-4 px-4 hidden lg:table-cell whitespace-nowrap text-neutral-500 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-neutral-400 shrink-0" />
                          <span>{member.formattedLastActive || "Never active"}</span>
                        </div>
                      </td>

                      {/* 6. Actions Menu */}
                      <td className="py-4 pl-4 pr-5 text-right relative">
                        <div className="inline-block text-left" ref={isMenuOpen ? menuRef : undefined}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : member.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                            aria-label={`Actions for ${member.fullName}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* Dropdown Menu Popup */}
                          {isMenuOpen && (
                            <div className="absolute right-4 top-11 z-30 w-48 rounded-2xl border border-neutral-200/90 bg-white p-1.5 shadow-xl text-xs animate-in fade-in zoom-in-95">
                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onViewDetails(member);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition text-left cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-neutral-400" />
                                <span>View Performance</span>
                              </button>

                              {/* Modifications (only if canBeModifiedByCurrentUser) */}
                              {member.canBeModifiedByCurrentUser && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onRoleChangeRequest(member);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition text-left cursor-pointer"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-neutral-400" />
                                    <span>Change Role</span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isToggling}
                                    onClick={async () => {
                                      setActiveMenuId(null);
                                      await onToggleSuspend(member);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition text-left cursor-pointer"
                                  >
                                    {member.status === "active" ? (
                                      <>
                                        <UserX className="h-3.5 w-3.5 text-amber-600" />
                                        <span>Suspend Account</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Reactivate Account</span>
                                      </>
                                    )}
                                  </button>

                                  {canRemove && (
                                    <div className="pt-1 mt-1 border-t border-neutral-100">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          onRemoveRequest(member);
                                        }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-medium text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                                      >
                                        <UserMinus className="h-3.5 w-3.5 text-red-600" />
                                        <span>Remove from Team</span>
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
