import React from "react";
import type { TeamOverviewStats } from "../actions";
import { Users, MailQuestion, UserX, ShieldCheck } from "lucide-react";

interface TeamOverviewCardsProps {
  stats: TeamOverviewStats;
}

export function TeamOverviewCards({ stats }: TeamOverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* ── 01. Active Staff ── */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:border-neutral-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 font-mono">
            Active Team
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950">
            {stats.totalActive}
          </span>
          <span className="text-xs font-medium text-emerald-700">Active</span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-400">Authorized showroom accounts</p>
      </div>

      {/* ── 02. Pending Invites ── */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:border-neutral-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 font-mono">
            Pending Invites
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <MailQuestion className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950">
            {stats.pendingInvites}
          </span>
          <span className="text-xs font-medium text-amber-700">Awaiting</span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-400">Within 72h expiry window</p>
      </div>

      {/* ── 03. Suspended Accounts ── */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:border-neutral-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 font-mono">
            Suspended
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
            <UserX className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950">
            {stats.suspendedCount}
          </span>
          <span className="text-xs font-medium text-neutral-500">Locked</span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-400">Temporarily revoked access</p>
      </div>

      {/* ── 04. Roles In Use ── */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:border-neutral-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 font-mono">
            Roles In Use
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950">
            {stats.rolesInUse}
          </span>
          <span className="text-xs font-mono text-neutral-400">/ 7 Tiers</span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-400">Role-based permission scopes</p>
      </div>
    </div>
  );
}

