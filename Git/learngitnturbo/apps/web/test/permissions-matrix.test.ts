import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ROLE_PERMISSIONS,
  ALL_PERMISSION_KEYS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  getPermissionsList,
  type PermissionKey,
} from "../lib/permissions/index";
import type { StaffRole } from "../lib/auth";

const ALL_ROLES: StaffRole[] = [
  "owner",
  "admin",
  "sales_manager",
  "sales_executive",
  "inventory_manager",
  "accountant",
  "viewer",
];

describe("1. Permissions Matrix Completeness & Schema Integrity", () => {
  test("all 7 platform roles are explicitly defined in the matrix", () => {
    for (const role of ALL_ROLES) {
      assert.ok(ROLE_PERMISSIONS[role], `Role '${role}' must be defined in ROLE_PERMISSIONS`);
    }
    assert.equal(Object.keys(ROLE_PERMISSIONS).length, 7);
  });

  test("every permission key is mapped to an explicit boolean for every role", () => {
    assert.equal(ALL_PERMISSION_KEYS.length, 30, "Expected exactly 30 granular permission keys");

    for (const role of ALL_ROLES) {
      const roleMap = ROLE_PERMISSIONS[role];
      for (const key of ALL_PERMISSION_KEYS) {
        assert.equal(
          typeof roleMap[key],
          "boolean",
          `Role '${role}' must map permission '${key}' to an explicit boolean (got ${roleMap[key]})`
        );
      }
    }
  });

  test("no unexpected or undefined keys exist in role mappings", () => {
    for (const role of ALL_ROLES) {
      const keysInRole = Object.keys(ROLE_PERMISSIONS[role]);
      assert.equal(
        keysInRole.length,
        ALL_PERMISSION_KEYS.length,
        `Role '${role}' has extraneous or missing keys`
      );
    }
  });
});

describe("2. Role Capabilities & Isolation Boundary Enforcement", () => {
  test("Showroom Principal (owner) has universal access across all 30 capabilities", () => {
    const ownerPerms = ROLE_PERMISSIONS.owner;
    for (const key of ALL_PERMISSION_KEYS) {
      assert.equal(ownerPerms[key], true, `Owner must have '${key}' enabled`);
    }
    assert.equal(getPermissionsList("owner").length, 30);
  });

  test("General Manager (admin) has operational powers but is blocked from showroom settings", () => {
    const adminPerms = ROLE_PERMISSIONS.admin;

    // Showroom core settings: STRICTLY Owner only
    assert.equal(adminPerms["showroom:manage_settings"], false);
    assert.equal(adminPerms["showroom:view_details"], true);

    // Full staff operations
    assert.equal(adminPerms["staff:manage_roster"], true);
    assert.equal(adminPerms["staff:invite"], true);
    assert.equal(adminPerms["staff:change_role"], true);
    assert.equal(adminPerms["staff:suspend"], true);
    assert.equal(adminPerms["staff:remove"], true);

    // Full fleet inventory operations
    assert.equal(adminPerms["inventory:view"], true);
    assert.equal(adminPerms["inventory:create"], true);
    assert.equal(adminPerms["inventory:edit"], true);
    assert.equal(adminPerms["inventory:delete"], true);
    assert.equal(adminPerms["inventory:view_financials"], true);

    // Full leads and deal operations
    assert.equal(adminPerms["leads:view_all"], true);
    assert.equal(adminPerms["leads:create"], true);
    assert.equal(adminPerms["leads:delete"], true);
    assert.equal(adminPerms["accounting:view_pnl"], true);
  });

  test("Sales Manager has pipeline supervision but zero vehicle cost or staff management", () => {
    const smPerms = ROLE_PERMISSIONS.sales_manager;

    // Leads & Deals
    assert.equal(smPerms["leads:view_all"], true);
    assert.equal(smPerms["leads:create"], true);
    assert.equal(smPerms["leads:update"], true);
    assert.equal(smPerms["leads:reassign"], true);
    assert.equal(smPerms["test_drives:view_all"], true);
    assert.equal(smPerms["sales:view_all"], true);
    assert.equal(smPerms["sales:create"], true);

    // Blocked from private financials and staff
    assert.equal(smPerms["inventory:view_financials"], false);
    assert.equal(smPerms["inventory:create"], false);
    assert.equal(smPerms["inventory:delete"], false);
    assert.equal(smPerms["staff:manage_roster"], false);
    assert.equal(smPerms["staff:invite"], false);
    assert.equal(smPerms["staff:remove"], false);
    assert.equal(smPerms["accounting:view_pnl"], false);
    assert.equal(smPerms["accounting:record_transactions"], false);
  });

  test("Sales Executive is strictly isolated to assigned leads with zero back-office access", () => {
    const sePerms = ROLE_PERMISSIONS.sales_executive;

    // Allowed: assigned CRM work only
    assert.equal(sePerms["inventory:view"], true);
    assert.equal(sePerms["leads:view_assigned_only"], true);
    assert.equal(sePerms["leads:create"], true);
    assert.equal(sePerms["leads:update"], true);
    assert.equal(sePerms["test_drives:view_assigned"], true);
    assert.equal(sePerms["test_drives:schedule"], true);
    assert.equal(sePerms["test_drives:complete"], true);
    assert.equal(sePerms["sales:create"], true);

    // Strictly blocked from unassigned leads, margins, accounting, and staff
    assert.equal(sePerms["leads:view_all"], false);
    assert.equal(sePerms["leads:delete"], false);
    assert.equal(sePerms["leads:reassign"], false);
    assert.equal(sePerms["inventory:view_financials"], false);
    assert.equal(sePerms["inventory:create"], false);
    assert.equal(sePerms["inventory:delete"], false);
    assert.equal(sePerms["accounting:view_pnl"], false);
    assert.equal(sePerms["accounting:record_transactions"], false);
    assert.equal(sePerms["staff:manage_roster"], false);
    assert.equal(sePerms["staff:invite"], false);
  });

  test("Inventory Manager has fleet & repair cost access but no lead CRM or vehicle deletion", () => {
    const imPerms = ROLE_PERMISSIONS.inventory_manager;

    // Fleet management
    assert.equal(imPerms["inventory:view"], true);
    assert.equal(imPerms["inventory:create"], true);
    assert.equal(imPerms["inventory:edit"], true);
    assert.equal(imPerms["inventory:view_financials"], true);
    assert.equal(imPerms["purchases:view"], true);
    assert.equal(imPerms["purchases:create"], true);

    // Blocked from vehicle deletion (requires Admin/Owner)
    assert.equal(imPerms["inventory:delete"], false);

    // Blocked from CRM & Accounting
    assert.equal(imPerms["leads:view_all"], false);
    assert.equal(imPerms["leads:create"], false);
    assert.equal(imPerms["accounting:view_pnl"], false);
    assert.equal(imPerms["staff:manage_roster"], false);
  });

  test("Accountant has P&L, bank, and transaction access but no fleet mutation or leads CRM", () => {
    const accPerms = ROLE_PERMISSIONS.accountant;

    // Financial capabilities
    assert.equal(accPerms["accounting:view_pnl"], true);
    assert.equal(accPerms["accounting:record_transactions"], true);
    assert.equal(accPerms["accounting:view_bank_accounts"], true);
    assert.equal(accPerms["accounting:export_reports"], true);
    assert.equal(accPerms["inventory:view_financials"], true);
    assert.equal(accPerms["sales:view_all"], true);
    assert.equal(accPerms["purchases:view"], true);

    // Blocked from inventory editing and leads
    assert.equal(accPerms["inventory:create"], false);
    assert.equal(accPerms["inventory:edit"], false);
    assert.equal(accPerms["inventory:delete"], false);
    assert.equal(accPerms["leads:view_all"], false);
    assert.equal(accPerms["leads:create"], false);
    assert.equal(accPerms["staff:manage_roster"], false);
  });

  test("Viewer is strictly read-only with zero mutation capabilities across all modules", () => {
    const viewerPerms = ROLE_PERMISSIONS.viewer;

    // Read-only basics
    assert.equal(viewerPerms["showroom:view_details"], true);
    assert.equal(viewerPerms["inventory:view"], true);

    // Zero mutations allowed
    const mutationKeys: PermissionKey[] = [
      "showroom:manage_settings",
      "staff:manage_roster",
      "staff:invite",
      "staff:change_role",
      "staff:suspend",
      "staff:remove",
      "inventory:create",
      "inventory:edit",
      "inventory:delete",
      "inventory:view_financials",
      "leads:create",
      "leads:update",
      "leads:delete",
      "leads:reassign",
      "test_drives:schedule",
      "test_drives:complete",
      "sales:create",
      "purchases:create",
      "accounting:view_pnl",
      "accounting:record_transactions",
      "accounting:export_reports",
    ];

    for (const key of mutationKeys) {
      assert.equal(viewerPerms[key], false, `Viewer must not have permission '${key}'`);
    }

    assert.equal(getPermissionsList("viewer").length, 2);
  });
});

describe("3. Helper Function Evaluation & Composition", () => {
  test("hasPermission evaluates single capability lookups accurately", () => {
    assert.equal(hasPermission("owner", "staff:invite"), true);
    assert.equal(hasPermission("admin", "staff:invite"), true);
    assert.equal(hasPermission("sales_manager", "staff:invite"), false);
    assert.equal(hasPermission("sales_executive", "staff:invite"), false);
  });

  test("hasAllPermissions returns true only when every requested permission is granted", () => {
    const keys: PermissionKey[] = ["inventory:view", "inventory:create", "inventory:edit"];
    assert.equal(hasAllPermissions("owner", keys), true);
    assert.equal(hasAllPermissions("admin", keys), true);
    assert.equal(hasAllPermissions("inventory_manager", keys), true);
    assert.equal(hasAllPermissions("sales_executive", keys), false);
    assert.equal(hasAllPermissions("viewer", keys), false);

    // Empty array returns false
    assert.equal(hasAllPermissions("owner", []), false);
  });

  test("hasAnyPermission returns true when at least one permission is granted", () => {
    const keys: PermissionKey[] = ["accounting:view_pnl", "staff:manage_roster"];
    assert.equal(hasAnyPermission("owner", keys), true);
    assert.equal(hasAnyPermission("admin", keys), true);
    assert.equal(hasAnyPermission("accountant", keys), true); // has accounting:view_pnl
    assert.equal(hasAnyPermission("sales_executive", keys), false); // has neither
    assert.equal(hasAnyPermission("viewer", keys), false);

    // Empty array returns false
    assert.equal(hasAnyPermission("owner", []), false);
  });

  test("getRolePermissions returns the exact frozen permissions map", () => {
    const adminMap = getRolePermissions("admin");
    assert.equal(adminMap["inventory:create"], true);
    assert.equal(adminMap["showroom:manage_settings"], false);
  });

  test("getPermissionsList returns correct list of enabled permission keys", () => {
    const seList = getPermissionsList("sales_executive");
    assert.ok(seList.includes("inventory:view"));
    assert.ok(seList.includes("leads:view_assigned_only"));
    assert.ok(seList.includes("sales:create"));
    assert.ok(!seList.includes("accounting:view_pnl"));
    assert.ok(!seList.includes("staff:invite"));
  });
});

describe("4. Invalid & Unauthenticated Role Defense", () => {
  test("unrecognized role strings evaluate all permissions to false", () => {
    const invalidRoles = ["superuser", "hacker", "guest", "", "root"];
    for (const invalid of invalidRoles) {
      assert.equal(hasPermission(invalid as any, "inventory:view"), false);
      assert.equal(hasPermission(invalid as any, "showroom:manage_settings"), false);
      assert.equal(hasAllPermissions(invalid as any, ["inventory:view"]), false);
      assert.equal(hasAnyPermission(invalid as any, ["inventory:view"]), false);
      assert.equal(getPermissionsList(invalid as any).length, 0);

      const perms = getRolePermissions(invalid as any);
      for (const key of ALL_PERMISSION_KEYS) {
        assert.equal(perms[key], false);
      }
    }
  });

  test("null and undefined roles evaluate safely to false without throwing", () => {
    assert.equal(hasPermission(undefined, "inventory:view"), false);
    assert.equal(hasPermission(null, "inventory:view"), false);
    assert.equal(hasAllPermissions(undefined, ["inventory:view"]), false);
    assert.equal(hasAnyPermission(null, ["inventory:view"]), false);
    assert.equal(getPermissionsList(undefined).length, 0);
    assert.equal(getPermissionsList(null).length, 0);
  });
});
