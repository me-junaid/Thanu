"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSWRConfig } from "swr";
import type {
  TeamRosterResponse,
  StaffMemberItem,
  PendingInviteItem,
  TeamOverviewStats,
} from "./actions";
import {
  getTeamRosterAction,
  suspendStaffMemberAction,
  reactivateStaffMemberAction,
  revokeInviteAction,
} from "./actions";
import { TeamOverviewCards } from "./components/team-overview-cards";
import { TeamRosterTable } from "./components/team-roster-table";
import { PendingInvitesList } from "./components/pending-invites-list";
import { InviteStaffModal } from "./components/invite-staff-modal";
import { StaffDetailDrawer } from "./components/staff-detail-drawer";
import { RoleChangeDialog } from "./components/role-change-dialog";
import { RemoveStaffDialog } from "./components/remove-staff-dialog";
import { UserPlus, RefreshCw, Users } from "lucide-react";

interface TeamManagementClientProps {
  initialData: TeamRosterResponse;
}

export function TeamManagementClient({ initialData }: TeamManagementClientProps) {
  const { mutate } = useSWRConfig();

  // Master state
  const [staff, setStaff] = useState<StaffMemberItem[]>(initialData.staff);
  const [invites, setInvites] = useState<PendingInviteItem[]>(initialData.invites);
  const [stats, setStats] = useState<TeamOverviewStats>(initialData.stats);

  // Sync state with incoming SWR data
  useEffect(() => {
    if (initialData?.staff) {
      setStaff(initialData.staff);
      setInvites(initialData.invites);
      setStats(initialData.stats);
    }
  }, [initialData]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Dialog & Drawer state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedStaffForDrawer, setSelectedStaffForDrawer] = useState<StaffMemberItem | null>(null);
  const [staffForRoleChange, setStaffForRoleChange] = useState<StaffMemberItem | null>(null);
  const [staffForRemoval, setStaffForRemoval] = useState<StaffMemberItem | null>(null);

  // Processing indicators
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isRevokingInviteId, setIsRevokingInviteId] = useState<string | null>(null);
  const [isTogglingSuspendId, setIsTogglingSuspendId] = useState<string | null>(null);

  // Synchronize with server state
  const refreshData = () => {
    startRefreshTransition(async () => {
      try {
        const res = await getTeamRosterAction();
        if (res.success) {
          setStaff(res.staff);
          setInvites(res.invites);
          setStats(res.stats);
          mutate("dashboard-team-roster-data", res, false);

          // If a staff member is currently open in drawer, update reference
          if (selectedStaffForDrawer) {
            const updated = res.staff.find((s) => s.id === selectedStaffForDrawer.id);
            if (updated) setSelectedStaffForDrawer(updated);
          }
        }
      } catch (err) {
        console.error("Failed to refresh team roster:", err);
      }
    });
  };

  // Toggle account suspension
  const handleToggleSuspend = async (member: StaffMemberItem) => {
    setIsTogglingSuspendId(member.id);
    try {
      if (member.status === "active") {
        await suspendStaffMemberAction({ staffId: member.id });
      } else {
        await reactivateStaffMemberAction({ staffId: member.id });
      }
      refreshData();
    } catch (err) {
      console.error("Error toggling account suspension:", err);
    } finally {
      setIsTogglingSuspendId(null);
    }
  };

  // Revoke an invitation
  const handleRevokeInvite = async (inviteId: string) => {
    setIsRevokingInviteId(inviteId);
    try {
      const res = await revokeInviteAction({ inviteId });
      if (res.success) {
        refreshData();
      }
    } catch (err) {
      console.error("Error revoking invite:", err);
    } finally {
      setIsRevokingInviteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-neutral-950">
              Staff & Role Management
            </h1>
            <button
              type="button"
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              title="Refresh roster"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-neutral-700" : ""}`} />
            </button>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Control showroom personnel access tiers, lead routing permissions, and team invitations.
          </p>
        </div>

        {/* Header Action: Invite Team Member */}
        {initialData.canInvite && (
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* ── 01. Overview Metrics Tiles ── */}
      <TeamOverviewCards stats={stats} />

      {/* ── 02. Main Roster Table ── */}
      <TeamRosterTable
        staff={staff}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        canManageStaff={initialData.canManageStaff}
        canRemove={initialData.canRemove}
        onViewDetails={(m) => setSelectedStaffForDrawer(m)}
        onRoleChangeRequest={(m) => setStaffForRoleChange(m)}
        onToggleSuspend={handleToggleSuspend}
        isTogglingSuspendId={isTogglingSuspendId}
        onRemoveRequest={(m) => setStaffForRemoval(m)}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
      />

      {/* ── 03. Pending Invitations Section ── */}
      <PendingInvitesList
        invites={invites}
        canManageStaff={initialData.canManageStaff}
        onRevoke={handleRevokeInvite}
        isRevokingId={isRevokingInviteId}
      />

      {/* ── 04. Modal Dialogs & Slide-over Drawer ── */}
      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={refreshData}
      />

      <RoleChangeDialog
        staff={staffForRoleChange}
        isOpen={Boolean(staffForRoleChange)}
        onClose={() => setStaffForRoleChange(null)}
        onSuccess={refreshData}
      />

      <RemoveStaffDialog
        staff={staffForRemoval}
        allStaff={staff}
        isOpen={Boolean(staffForRemoval)}
        onClose={() => setStaffForRemoval(null)}
        onSuccess={refreshData}
      />

      <StaffDetailDrawer
        staff={selectedStaffForDrawer}
        isOpen={Boolean(selectedStaffForDrawer)}
        onClose={() => setSelectedStaffForDrawer(null)}
        onOpenRoleChange={(m) => setStaffForRoleChange(m)}
        onOpenRemove={(m) => setStaffForRemoval(m)}
        onToggleSuspend={handleToggleSuspend}
        isTogglingSuspend={Boolean(isTogglingSuspendId)}
        canManageStaff={initialData.canManageStaff}
        canRemove={initialData.canRemove}
      />
    </div>
  );
}

