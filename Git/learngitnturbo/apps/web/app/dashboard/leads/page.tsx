import type { Metadata } from "next";
import { getAuthenticatedContext } from "../../../lib/auth";
import { LeadsShell } from "../../../components/leads/leads-shell";
import { AccessRestricted } from "../../../components/dashboard/access-restricted";

export const metadata: Metadata = {
  title: "Leads & Customer Pipeline | Orgetise",
  description:
    "Omnichannel automotive inquiry CRM, showroom test drive tracking, and vehicle reservation pipeline.",
};

export default async function LeadsPage() {
  const auth = await getAuthenticatedContext();

  if (
    !auth ||
    (!auth.can("leads:view_all") && !auth.can("leads:view_assigned_only"))
  ) {
    return (
      <AccessRestricted
        title="Leads CRM Restricted"
        description="Access to customer inquiries, prospect contact details, and sales pipelines is restricted to authorized sales executives and floor managers."
        requiredPermission="leads:view_all"
      />
    );
  }

  return <LeadsShell />;
}

