import type { Metadata } from "next";
import { getAuthenticatedContext } from "../../../lib/auth";
import { TestDrivesShell } from "../../../components/test-drives/test-drives-shell";
import { AccessRestricted } from "../../../components/dashboard/access-restricted";

export const metadata: Metadata = {
  title: "Test Drive Operations | Orgetise",
  description:
    "Manage certified vehicle test drive appointments, digital gate passes, and post-drive customer evaluation.",
};

export default async function TestDrivesPage() {
  const auth = await getAuthenticatedContext();

  if (
    !auth ||
    (!auth.can("test_drives:view_all") && !auth.can("test_drives:view_assigned"))
  ) {
    return (
      <AccessRestricted
        title="Test Drives Workspace Restricted"
        description="Access to customer test drive schedules, vehicle checkout status, and gate passes is restricted to authorized sales representatives."
        requiredPermission="test_drives:view_all"
      />
    );
  }

  return <TestDrivesShell />;
}

