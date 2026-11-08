import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateCanProps,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ALL_PERMISSION_KEYS,
  ROLE_PERMISSIONS,
  type StaffRole,
  type PermissionKey,
} from "../lib/permissions/index";

describe("1. Declarative <Can> Evaluation Logic (evaluateCanProps)", () => {
  const createMockContext = (role: StaffRole) => {
    const permissions = ROLE_PERMISSIONS[role];
    return {
      role,
      can: (p: PermissionKey) => permissions[p] ?? false,
      canAll: (...keys: PermissionKey[]) => keys.every((k) => permissions[k] ?? false),
      canAny: (...keys: PermissionKey[]) => keys.some((k) => permissions[k] ?? false),
    };
  };

  test("evaluates single capability accurately for granted and denied roles", () => {
    const ownerContext = createMockContext("owner");
    const salesExecContext = createMockContext("sales_executive");

    // Owner can create inventory
    assert.equal(
      evaluateCanProps({ permission: "inventory:create" }, ownerContext),
      true
    );

    // Sales Executive cannot create inventory
    assert.equal(
      evaluateCanProps({ permission: "inventory:create" }, salesExecContext),
      false
    );
  });

  test("evaluates 'all' capabilities array (conjunction AND)", () => {
    const ownerContext = createMockContext("owner");
    const accountantContext = createMockContext("accountant");

    // Owner has both inventory:view and accounting:view_pnl
    assert.equal(
      evaluateCanProps(
        { all: ["inventory:view", "accounting:view_pnl"] },
        ownerContext
      ),
      true
    );

    // Accountant has accounting:view_pnl but NOT inventory:create
    assert.equal(
      evaluateCanProps(
        { all: ["accounting:view_pnl", "inventory:create"] },
        accountantContext
      ),
      false
    );
  });

  test("evaluates 'any' capabilities array (disjunction OR)", () => {
    const salesExecContext = createMockContext("sales_executive");
    const viewerContext = createMockContext("viewer");

    // Sales Exec has leads:create, but not accounting:view_pnl -> evaluateCanProps returns true
    assert.equal(
      evaluateCanProps(
        { any: ["accounting:view_pnl", "leads:create"] },
        salesExecContext
      ),
      true
    );

    // Viewer has neither
    assert.equal(
      evaluateCanProps(
        { any: ["accounting:view_pnl", "leads:create"] },
        viewerContext
      ),
      false
    );
  });

  test("evaluates role matching for string and array of roles", () => {
    const adminContext = createMockContext("admin");
    const viewerContext = createMockContext("viewer");

    assert.equal(
      evaluateCanProps({ role: "admin" }, adminContext),
      true
    );

    assert.equal(
      evaluateCanProps({ role: ["owner", "admin"] }, adminContext),
      true
    );

    assert.equal(
      evaluateCanProps({ role: ["owner", "admin"] }, viewerContext),
      false
    );
  });

  test("inverts result when 'not' prop is true", () => {
    const salesExecContext = createMockContext("sales_executive");
    const ownerContext = createMockContext("owner");

    // Sales Exec does NOT have inventory:view_financials -> 'not' returns true (e.g. render hidden notice)
    assert.equal(
      evaluateCanProps(
        { permission: "inventory:view_financials", not: true },
        salesExecContext
      ),
      true
    );

    // Owner DOES have inventory:view_financials -> 'not' returns false
    assert.equal(
      evaluateCanProps(
        { permission: "inventory:view_financials", not: true },
        ownerContext
      ),
      false
    );
  });

  test("combines permission and role guards (composite evaluation)", () => {
    const adminContext = createMockContext("admin");
    const ownerContext = createMockContext("owner");

    // Both admin and owner have staff:invite, but role specifies 'owner' only
    assert.equal(
      evaluateCanProps(
        { permission: "staff:invite", role: "owner" },
        ownerContext
      ),
      true
    );

    assert.equal(
      evaluateCanProps(
        { permission: "staff:invite", role: "owner" },
        adminContext
      ),
      false
    );
  });
});

describe("2. UI Role Metadata & Standardization", () => {
  const ALL_ROLES: StaffRole[] = [
    "owner",
    "admin",
    "sales_manager",
    "sales_executive",
    "inventory_manager",
    "accountant",
    "viewer",
  ];

  test("every canonical role has an explicit label and description", () => {
    for (const role of ALL_ROLES) {
      assert.ok(ROLE_LABELS[role], `Missing label for role ${role}`);
      assert.ok(ROLE_DESCRIPTIONS[role], `Missing description for role ${role}`);
      assert.ok(ROLE_LABELS[role].length > 3);
      assert.ok(ROLE_DESCRIPTIONS[role].length > 15);
    }
  });

  test("labels accurately reflect premium automotive dealership titles", () => {
    assert.equal(ROLE_LABELS.owner, "Showroom Principal");
    assert.equal(ROLE_LABELS.admin, "General Manager");
    assert.equal(ROLE_LABELS.sales_manager, "Sales Manager");
    assert.equal(ROLE_LABELS.sales_executive, "Sales Executive");
    assert.equal(ROLE_LABELS.inventory_manager, "Inventory Manager");
    assert.equal(ROLE_LABELS.accountant, "Accountant");
    assert.equal(ROLE_LABELS.viewer, "Viewer");
  });
});
