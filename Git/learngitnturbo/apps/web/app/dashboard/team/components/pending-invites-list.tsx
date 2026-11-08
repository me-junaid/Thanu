"use client";

import React, { useState } from "react";
import type { PendingInviteItem } from "../actions";
import {
  Mail,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  XCircle,
  Loader2,
  Shield,
  User,
} from "lucide-react";

interface PendingInvitesListProps {
  invites: PendingInviteItem[];
  canManageStaff: boolean;
  onRevoke: (inviteId: string) => Promise<void>;
  isRevokingId: string | null;
}

export function PendingInvitesList({
  invites,
  canManageStaff,
  onRevoke,
  isRevokingId,
}: PendingInvitesListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (invites.length === 0) {
    return null;
  }

  const activePendingCount = invites.filter((i) => i.status === "pending").length;

  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-2xs transition">
      {/* ── Section Header (Collapsible Toggle) ── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-[#FDFBF7] hover:bg-neutral-50/80 transition cursor-pointer border-b border-neutral-200/70 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/70 text-amber-900">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-neutral-900">
                Pending Invitations
              </h3>
              <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-mono font-bold">
                {activePendingCount} active
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Outstanding email invites awaiting signup within the 72-hour validity window.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-[11px] font-mono hidden sm:inline">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* ── Invites Table / List ── */}
      {isExpanded && (
        <div className="divide-y divide-neutral-100">
          {invites.map((invite) => {
            const isProcessing = isRevokingId === invite.id;

            return (
              <div
                key={invite.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 hover:bg-neutral-50/50 transition"
              >
                {/* Email & Invitee Info */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 font-mono text-xs font-semibold">
                    {invite.fullName ? invite.fullName[0]?.toUpperCase() : "@"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-neutral-900 truncate">
                        {invite.email}
                      </span>
                      {invite.fullName && (
                        <span className="text-xs text-neutral-500 font-medium">
                          ({invite.fullName})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400 flex-wrap">
                      <span>Invited by {invite.invitedByName}</span>
                      <span>•</span>
                      <span>Sent {invite.formattedSentAt}</span>
                    </div>
                  </div>
                </div>

                {/* Role & Expiry Status */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 shadow-2xs">
                    <Shield className="h-3 w-3 text-neutral-400" />
                    <span>{invite.intendedRoleLabel}</span>
                  </span>

                  {invite.status === "expired" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400">
                      <Clock className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Expired</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Pending acceptance</span>
                    </span>
                  )}

                  {/* Revoke Action */}
                  {canManageStaff && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onRevoke(invite.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100/70 hover:border-red-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Revoke this invitation"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Revoking...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          <span>Revoke</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

