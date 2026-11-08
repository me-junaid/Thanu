import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedContext } from "../../lib/auth";
import { PermissionsProvider } from "../../lib/permissions";
import { DashboardShell } from "../../components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dealership Dashboard & Command Center | Orgetise",
  description:
    "Manage certified vehicle inventory, customer leads, test drive scheduling, and showroom staff.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthenticatedContext();

  if (!auth) {
    redirect("/login");
  }

  // Guard: First-time users who have not completed onboarding are redirected
  if (!auth.profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  const userEmail = auth.user.email ?? "owner@apexmotors.in";
  const fullName = auth.profile.fullName || "Showroom Manager";
  const dealershipName = auth.dealership.name || "Apex Motors";
  const role = auth.profile.role;

  return (
    <PermissionsProvider
      role={role}
      permissions={auth.permissions.canMap}
      userId={auth.user.id}
    >
      <DashboardShell
        userEmail={userEmail}
        userName={fullName}
        dealershipName={dealershipName}
        role={role}
      >
        {children}
      </DashboardShell>
    </PermissionsProvider>
  );
}
