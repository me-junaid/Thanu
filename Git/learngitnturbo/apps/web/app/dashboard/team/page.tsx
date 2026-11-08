import type { Metadata } from "next";
import { getAuthenticatedContext } from "../../../lib/auth";
import { getTeamRosterAction } from "./actions";
import { TeamShell } from "../../../components/team/team-shell";
import { AccessRestricted } from "../../../components/dashboard/access-restricted";

export const metadata: Metadata = {
  title: "Staff & Role Management | Orgetise Showroom OS",
  description:
    "Manage dealership team roster, role-based access control, lead assignment permissions, and staff invitations.",
};

export default async function TeamPage() {
  const auth = await getAuthenticatedContext();

  // ── Access Control Guard (Capability Driven) ──
  if (!auth || !auth.can("staff:manage_roster")) {
    return (
      <AccessRestricted
        title="Staff & Role Management Restricted"
        description="Staff and access role governance is restricted to Showroom Principals and General Managers. Your current account tier does not have permission to view or manage showroom team members."
        requiredPermission="staff:manage_roster"
      />
    );
  }

  const rosterResponse = await getTeamRosterAction();

  return <TeamShell initialData={rosterResponse} />;
}

