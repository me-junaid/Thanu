import type { Metadata } from "next";
import { getAuthenticatedContext } from "../../../lib/auth";
import { InventoryShell } from "../../../components/inventory/inventory-shell";
import { AccessRestricted } from "../../../components/dashboard/access-restricted";

export const metadata: Metadata = {
  title: "Fleet Inventory & Showroom Management | Orgetise",
  description:
    "Manage certified pre-owned vehicles, procurement financials, gross margins, and public showroom floor listings.",
};

export default async function InventoryPage() {
  const auth = await getAuthenticatedContext();

  if (!auth || !auth.can("inventory:view")) {
    return (
      <AccessRestricted
        title="Fleet Inventory Restricted"
        description="Access to dealership fleet listings requires authorized showroom credentials."
        requiredPermission="inventory:view"
      />
    );
  }

  return <InventoryShell />;
}

