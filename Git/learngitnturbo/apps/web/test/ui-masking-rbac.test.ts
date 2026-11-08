import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateCanProps,
  ROLE_PERMISSIONS,
  type StaffRole,
  type PermissionKey,
} from "../lib/permissions/index";

/**
 * Pure context mock factory for test assertions
 */
function createMockContext(role: StaffRole) {
  const permissions = ROLE_PERMISSIONS[role];
  return {
    role,
    can: (p: PermissionKey) => permissions[p] ?? false,
    canAll: (...keys: PermissionKey[]) => keys.every((k) => permissions[k] ?? false),
    canAny: (...keys: PermissionKey[]) => keys.some((k) => permissions[k] ?? false),
  };
}

describe("1. Fleet Inventory UI Differentiation & Masking", () => {
  test("Add Vehicle button is enabled only for roles with inventory:create", () => {
    assert.equal(evaluateCanProps({ permission: "inventory:create" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "inventory:create" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "inventory:create" }, createMockContext("inventory_manager")), true);

    // Sales floor and financial auditor roles cannot create inventory listings
    assert.equal(evaluateCanProps({ permission: "inventory:create" }, createMockContext("sales_manager")), false);
    assert.equal(evaluateCanProps({ permission: "inventory:create" }, createMockContext("sales_executive")), false);
    assert.equal(evaluateCanProps({ permission: "inventory:create" }, createMockContext("accountant")), false);
    assert.equal(evaluateCanProps({ permission: "inventory:create" }, createMockContext("viewer")), false);
  });

  test("Unit Economics, Invested Capital & Gross Margin are masked for sales & auditor roles", () => {
    // Only management, inventory manager, and accountant can inspect acquisition & margins
    assert.equal(evaluateCanProps({ permission: "inventory:view_financials" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "inventory:view_financials" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "inventory:view_financials" }, createMockContext("inventory_manager")), true);
    assert.equal(evaluateCanProps({ permission: "inventory:view_financials" }, createMockContext("accountant")), true);

    // Strictly masked for sales floor and viewers
    assert.equal(evaluateCanProps({ permission: "inventory:view_financials" }, createMockContext("sales_manager")), false);
    assert.equal(evaluateCanProps({ permission: "inventory:view_financials" }, createMockContext("sales_executive")), false);
    assert.equal(evaluateCanProps({ permission: "inventory:view_financials" }, createMockContext("viewer")), false);
  });

  test("Permanent Vehicle Deletion trigger is restricted to Showroom Owner and General Manager", () => {
    assert.equal(evaluateCanProps({ permission: "inventory:delete" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "inventory:delete" }, createMockContext("admin")), true);

    // Inventory managers and sales executive can never hard delete inventory listings
    assert.equal(evaluateCanProps({ permission: "inventory:delete" }, createMockContext("inventory_manager")), false);
    assert.equal(evaluateCanProps({ permission: "inventory:delete" }, createMockContext("sales_manager")), false);
    assert.equal(evaluateCanProps({ permission: "inventory:delete" }, createMockContext("sales_executive")), false);
  });
});

describe("2. Leads & CRM UI Differentiation & Masking", () => {
  test("Lead Creation is allowed for sales personnel and showroom leadership", () => {
    assert.equal(evaluateCanProps({ permission: "leads:create" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "leads:create" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "leads:create" }, createMockContext("sales_manager")), true);
    assert.equal(evaluateCanProps({ permission: "leads:create" }, createMockContext("sales_executive")), true);

    // Back-office inventory managers and accountants cannot log leads
    assert.equal(evaluateCanProps({ permission: "leads:create" }, createMockContext("inventory_manager")), false);
    assert.equal(evaluateCanProps({ permission: "leads:create" }, createMockContext("accountant")), false);
    assert.equal(evaluateCanProps({ permission: "leads:create" }, createMockContext("viewer")), false);
  });

  test("Lead Reassignment dropdown is restricted to Sales Leadership, masked for Sales Execs", () => {
    assert.equal(evaluateCanProps({ permission: "leads:reassign" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "leads:reassign" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "leads:reassign" }, createMockContext("sales_manager")), true);

    // Sales executives are strictly restricted to their own leads and cannot steal/reassign leads
    assert.equal(evaluateCanProps({ permission: "leads:reassign" }, createMockContext("sales_executive")), false);
  });
});

describe("3. Test Drives UI Differentiation & Masking", () => {
  test("Scheduling appointments is available to sales reps and leadership", () => {
    assert.equal(evaluateCanProps({ permission: "test_drives:schedule" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "test_drives:schedule" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "test_drives:schedule" }, createMockContext("sales_manager")), true);
    assert.equal(evaluateCanProps({ permission: "test_drives:schedule" }, createMockContext("sales_executive")), true);

    assert.equal(evaluateCanProps({ permission: "test_drives:schedule" }, createMockContext("viewer")), false);
    assert.equal(evaluateCanProps({ permission: "test_drives:schedule" }, createMockContext("accountant")), false);
  });

  test("Gate pass issuance and check-in completion require operational execution rights", () => {
    assert.equal(evaluateCanProps({ permission: "test_drives:complete" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "test_drives:complete" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "test_drives:complete" }, createMockContext("sales_executive")), true);
    assert.equal(evaluateCanProps({ permission: "test_drives:complete" }, createMockContext("viewer")), false);
  });
});

describe("4. Sales & Accounting UI Differentiation & Masking", () => {
  test("Deal Contracting is granted to sales executives and leadership", () => {
    assert.equal(evaluateCanProps({ permission: "sales:create" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "sales:create" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "sales:create" }, createMockContext("sales_manager")), true);
    assert.equal(evaluateCanProps({ permission: "sales:create" }, createMockContext("sales_executive")), true);

    assert.equal(evaluateCanProps({ permission: "sales:create" }, createMockContext("accountant")), false);
    assert.equal(evaluateCanProps({ permission: "sales:create" }, createMockContext("viewer")), false);
  });

  test("Payment collection and workshop bill recording require financial transaction rights", () => {
    assert.equal(evaluateCanProps({ permission: "accounting:record_transactions" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "accounting:record_transactions" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "accounting:record_transactions" }, createMockContext("accountant")), true);

    // Sales reps cannot record ledger expenses or post payment vouchers
    assert.equal(evaluateCanProps({ permission: "accounting:record_transactions" }, createMockContext("sales_manager")), false);
    assert.equal(evaluateCanProps({ permission: "accounting:record_transactions" }, createMockContext("sales_executive")), false);
    assert.equal(evaluateCanProps({ permission: "accounting:record_transactions" }, createMockContext("viewer")), false);
  });

  test("Statutory GST margin and Deal P&L telemetry are hidden from sales floor", () => {
    assert.equal(evaluateCanProps({ permission: "accounting:view_pnl" }, createMockContext("owner")), true);
    assert.equal(evaluateCanProps({ permission: "accounting:view_pnl" }, createMockContext("admin")), true);
    assert.equal(evaluateCanProps({ permission: "accounting:view_pnl" }, createMockContext("accountant")), true);

    assert.equal(evaluateCanProps({ permission: "accounting:view_pnl" }, createMockContext("sales_executive")), false);
    assert.equal(evaluateCanProps({ permission: "accounting:view_pnl" }, createMockContext("sales_manager")), false);
  });
});

