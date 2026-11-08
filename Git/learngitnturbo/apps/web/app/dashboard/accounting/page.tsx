import type { Metadata } from "next";
import { getAuthenticatedContext } from "../../../lib/auth";
import { AccountingShell } from "../../../components/accounting/accounting-shell";
import { AccessRestricted } from "../../../components/dashboard/access-restricted";

export const metadata: Metadata = {
  title: "Sales & Accounting | Orgetise Showroom OS",
  description:
    "Pre-owned deal financing, vehicle landed costing, GST margin scheme, delivery gate passes, and RTO ownership transfers.",
};

export default async function AccountingPage() {
  const auth = await getAuthenticatedContext();

  if (!auth || !auth.can("accounting:view_pnl")) {
    return (
      <AccessRestricted
        title="Accounting & P&L Restricted"
        description="Access to showroom financial books, unit margin schemes, workshop expenditure ledgers, and bank delivery orders is restricted to Showroom Principals and Finance Controllers."
        requiredPermission="accounting:view_pnl"
      />
    );
  }

  return (
    <div className="space-y-6">
      <AccountingShell />
    </div>
  );
}

