import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ROLE_PERMISSIONS,
  type StaffRole,
  type PermissionKey,
} from "../lib/permissions/index";

/**
 * Route protection helper replicating Server Component & Layout assertions
 */
function isRouteAccessible(
  role: StaffRole,
  route: "/dashboard/accounting" | "/dashboard/team" | "/dashboard/leads" | "/dashboard/test-drives" | "/dashboard/inventory" | "/dashboard/settings"
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  switch (route) {
    case "/dashboard/accounting":
      return perms["accounting:view_pnl"] ?? false;
    case "/dashboard/team":
      return perms["staff:manage_roster"] ?? false;
    case "/dashboard/leads":
      return (perms["leads:view_all"] || perms["leads:view_assigned_only"]) ?? false;
    case "/dashboard/test-drives":
      return (perms["test_drives:view_all"] || perms["test_drives:view_assigned"]) ?? false;
    case "/dashboard/inventory":
      return perms["inventory:view"] ?? false;
    case "/dashboard/settings":
      return perms["showroom:manage_settings"] ?? false;
    default:
      return false;
  }
}

describe("Phase 3: Route-Level Gates & Navigation Protection", () => {
  test("/dashboard/accounting is restricted strictly to Owner, Admin, and Accountant", () => {
    // Authorized leadership and finance
    assert.equal(isRouteAccessible("owner", "/dashboard/accounting"), true);
    assert.equal(isRouteAccessible("admin", "/dashboard/accounting"), true);
    assert.equal(isRouteAccessible("accountant", "/dashboard/accounting"), true);

    // Sales floor and back-office stock managers are strictly blocked
    assert.equal(isRouteAccessible("sales_manager", "/dashboard/accounting"), false);
    assert.equal(isRouteAccessible("sales_executive", "/dashboard/accounting"), false);
    assert.equal(isRouteAccessible("inventory_manager", "/dashboard/accounting"), false);
    assert.equal(isRouteAccessible("viewer", "/dashboard/accounting"), false);
  });

  test("/dashboard/team is restricted strictly to Showroom Principal and General Manager", () => {
    assert.equal(isRouteAccessible("owner", "/dashboard/team"), true);
    assert.equal(isRouteAccessible("admin", "/dashboard/team"), true);

    // Non-admin roles cannot govern team roster or permissions
    assert.equal(isRouteAccessible("sales_manager", "/dashboard/team"), false);
    assert.equal(isRouteAccessible("sales_executive", "/dashboard/team"), false);
    assert.equal(isRouteAccessible("inventory_manager", "/dashboard/team"), false);
    assert.equal(isRouteAccessible("accountant", "/dashboard/team"), false);
    assert.equal(isRouteAccessible("viewer", "/dashboard/team"), false);
  });

  test("/dashboard/leads is accessible to Sales Team & Leadership, blocked for back-office", () => {
    assert.equal(isRouteAccessible("owner", "/dashboard/leads"), true);
    assert.equal(isRouteAccessible("admin", "/dashboard/leads"), true);
    assert.equal(isRouteAccessible("sales_manager", "/dashboard/leads"), true);
    assert.equal(isRouteAccessible("sales_executive", "/dashboard/leads"), true);

    assert.equal(isRouteAccessible("inventory_manager", "/dashboard/leads"), false);
    assert.equal(isRouteAccessible("accountant", "/dashboard/leads"), false);
    assert.equal(isRouteAccessible("viewer", "/dashboard/leads"), false);
  });

  test("/dashboard/test-drives is accessible to Sales Team & Leadership, blocked for back-office", () => {
    assert.equal(isRouteAccessible("owner", "/dashboard/test-drives"), true);
    assert.equal(isRouteAccessible("admin", "/dashboard/test-drives"), true);
    assert.equal(isRouteAccessible("sales_manager", "/dashboard/test-drives"), true);
    assert.equal(isRouteAccessible("sales_executive", "/dashboard/test-drives"), true);

    assert.equal(isRouteAccessible("inventory_manager", "/dashboard/test-drives"), false);
    assert.equal(isRouteAccessible("accountant", "/dashboard/test-drives"), false);
    assert.equal(isRouteAccessible("viewer", "/dashboard/test-drives"), false);
  });

  test("/dashboard/inventory is accessible across all 7 platform roles", () => {
    const ALL_ROLES: StaffRole[] = [
      "owner",
      "admin",
      "sales_manager",
      "sales_executive",
      "inventory_manager",
      "accountant",
      "viewer",
    ];

    for (const role of ALL_ROLES) {
      assert.equal(
        isRouteAccessible(role, "/dashboard/inventory"),
        true,
        `Role ${role} should be able to view fleet inventory`
      );
    }
  });

  test("/dashboard/settings is strictly restricted to Showroom Principal (Owner)", () => {
    assert.equal(isRouteAccessible("owner", "/dashboard/settings"), true);

    // Even General Manager (admin) cannot modify root legal dealership settings
    assert.equal(isRouteAccessible("admin", "/dashboard/settings"), false);
    assert.equal(isRouteAccessible("sales_manager", "/dashboard/settings"), false);
    assert.equal(isRouteAccessible("sales_executive", "/dashboard/settings"), false);
    assert.equal(isRouteAccessible("inventory_manager", "/dashboard/settings"), false);
    assert.equal(isRouteAccessible("accountant", "/dashboard/settings"), false);
    assert.equal(isRouteAccessible("viewer", "/dashboard/settings"), false);
  });
});

