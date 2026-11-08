"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ExternalLink,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { signOutAction } from "../../app/dashboard/actions";
import type { StaffRole } from "../../lib/permissions/types";
import { ShowroomRoleBadge } from "../permissions/role-badge";
import { Can } from "../permissions/can";

interface DashboardHeaderProps {
  userEmail: string;
  userName?: string;
  dealershipName?: string;
  role?: StaffRole;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({
  userEmail,
  userName = "Dealership Owner",
  dealershipName = "Apex Motors",
  role = "viewer",
  isSidebarCollapsed = false,
  onToggleSidebar,
}: DashboardHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/90 px-6 backdrop-blur-md transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "lg:left-20" : "lg:left-64"
      }`}
    >
      {/* ── Left: Sidebar Toggle & Showroom Location Badge ── */}
      <div className="flex items-center gap-2.5">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/90 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950 transition shadow-2xs active:scale-95"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 rounded-xl px-2 py-1 text-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-md overflow-hidden p-0.5">
            <Image
              src="/logo.png"
              alt="Logo"
              width={20}
              height={20}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="text-left">
            <p className="font-semibold text-neutral-900 leading-tight">
              {dealershipName} • Showroom
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: Storefront Link & User Dropdown ── */}
      <div className="flex items-center gap-3">
        {/* View Public Storefront Link */}
        <Link
          href="/inventory"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-2xs transition hover:border-neutral-400 hover:text-neutral-950"
        >
          <span>Storefront</span>
          <ExternalLink className="h-3 w-3 text-neutral-400" />
        </Link>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white p-1 pr-2.5 shadow-2xs transition hover:bg-neutral-50 active:scale-98"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline-block text-xs font-medium text-neutral-800">
              {userName}
            </span>
            <ChevronDown className="h-3 w-3 text-neutral-400" />
          </button>

          {isProfileMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <div className="border-b border-neutral-100 px-3 py-2.5 mb-1">
                <p className="text-xs font-semibold text-neutral-900 leading-tight">
                  {userName}
                </p>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                  {userEmail}
                </p>
                <div className="mt-2">
                  <ShowroomRoleBadge role={role} size="sm" />
                </div>
              </div>

              <Can permission="staff:manage_roster">
                <Link
                  href="/dashboard/team"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition"
                >
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Team & Access Control</span>
                </Link>
              </Can>

              <div className="my-1 border-t border-neutral-100" />

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
