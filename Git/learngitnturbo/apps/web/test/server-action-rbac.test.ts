import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  assertPermission,
  checkPermission,
  ForbiddenError,
  UnauthorizedError,
} from "../lib/permissions/guard";
import { ROLE_PERMISSIONS, hasPermission } from "../lib/permissions/matrix";
import type { StaffRole, AuthenticatedContext } from "../lib/auth";

/**
 * Mock factory to generate AuthenticatedContext for a given role
 */
function createMockAuthContext(role: StaffRole, isSuspended = false): AuthenticatedContext {
  const permissions = {
    isOwner: role === "owner",
    canManageStaff: hasPermission(role, "staff:manage_roster"),
    canManageInventory: hasPermission(role, "inventory:create"),
    canViewFinancials: hasPermission(role, "accounting:view_pnl"),
    canManageLeads: hasPermission(role, "leads:create"),
    can: (p: any) => hasPermission(role, p),
    canMap: ROLE_PERMISSIONS[role],
  };

  return {
    supabase: {} as any,
    user: {
      id: "usr_mock_12345",
      email: `${role}@apexmotors.in`,
    },
    profile: {
      id: "usr_mock_12345",
      fullName: `Mock ${role}`,
      role,
      status: isSuspended ? "suspended" : "active",
      dealershipId: "dlr_apex_98765",
      onboardingCompleted: true,
    },
    dealership: {
      id: "dlr_apex_98765",
      name: "Apex Motors",
      slug: "apex-motors",
      address: "100 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
    },
    permissions,
    can: (p: any) => hasPermission(role, p),
  };
}

describe("1. Server-Side Guard Helpers (assertPermission & checkPermission)", () => {
  test("assertPermission permits authorized roles without throwing", () => {
    const ownerContext = createMockAuthContext("owner");
    const adminContext = createMockAuthContext("admin");

    assert.doesNotThrow(() => assertPermission(ownerContext, "staff:invite"));
    assert.doesNotThrow(() => assertPermission(adminContext, "inventory:delete"));
  });

  test("assertPermission throws structured ForbiddenError for unauthorized roles", () => {
    const salesExecContext = createMockAuthContext("sales_executive");

    assert.throws(
      () => assertPermission(salesExecContext, "accounting:view_pnl"),
      (err: any) => {
        assert.ok(err instanceof ForbiddenError);
        assert.equal(err.code, "FORBIDDEN");
        assert.equal(err.status, 403);
        assert.equal(err.requiredPermission, "accounting:view_pnl");
        return true;
      }
    );
  });

  test("assertPermission throws UnauthorizedError if context is missing or null", () => {
    assert.throws(
      () => assertPermission(null as any, "inventory:view"),
      (err: any) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.equal(err.code, "UNAUTHORIZED");
        assert.equal(err.status, 401);
        return true;
      }
    );
  });

  test("checkPermission returns non-throwing status objects", () => {
    const accContext = createMockAuthContext("accountant");
    const viewerContext = createMockAuthContext("viewer");

    const allowed = checkPermission(accContext, "accounting:view_pnl");
    assert.equal(allowed.allowed, true);

    const forbidden = checkPermission(viewerContext, "inventory:delete");
    assert.equal(forbidden.allowed, false);
    if (!forbidden.allowed) {
      assert.ok(forbidden.error.includes("Forbidden"));
    }

    const unauth = checkPermission(null, "inventory:view");
    assert.equal(unauth.allowed, false);
    if (!unauth.allowed) {
      assert.ok(unauth.error.includes("Unauthorized"));
    }
  });
});

describe("2. Fleet Inventory Financials Masking & Action Authorization", () => {
  test("vehicle acquisition costs are redacted when inventory:view_financials is false", () => {
    const salesExec = createMockAuthContext("sales_executive");
    const viewer = createMockAuthContext("viewer");

    assert.equal(salesExec.can("inventory:view_financials"), false);
    assert.equal(viewer.can("inventory:view_financials"), false);

    // Mock vehicle record
    const rawVehicle = {
      asking_price: 1500000,
      purchase_price: 1200000,
      refurbishment_cost: 50000,
    };

    // Masking simulation matching getInventoryAction
    const getMaskedVehicle = (ctx: AuthenticatedContext) => {
      const canViewFinancials = ctx.can("inventory:view_financials");
      return {
        askingPrice: rawVehicle.asking_price,
        purchasePrice: canViewFinancials ? rawVehicle.purchase_price : null,
        refurbishmentCost: canViewFinancials ? rawVehicle.refurbishment_cost : null,
        estimatedMargin: canViewFinancials
          ? rawVehicle.asking_price - (rawVehicle.purchase_price + rawVehicle.refurbishment_cost)
          : null,
      };
    };

    const execVehicle = getMaskedVehicle(salesExec);
    assert.equal(execVehicle.askingPrice, 1500000);
    assert.equal(execVehicle.purchasePrice, null);
    assert.equal(execVehicle.refurbishmentCost, null);
    assert.equal(execVehicle.estimatedMargin, null);

    const viewerVehicle = getMaskedVehicle(viewer);
    assert.equal(viewerVehicle.purchasePrice, null);
  });

  test("vehicle acquisition costs are preserved for authorized roles (owner, admin, accountant)", () => {
    const owner = createMockAuthContext("owner");
    const admin = createMockAuthContext("admin");
    const accountant = createMockAuthContext("accountant");
    const inventoryManager = createMockAuthContext("inventory_manager");

    assert.equal(owner.can("inventory:view_financials"), true);
    assert.equal(admin.can("inventory:view_financials"), true);
    assert.equal(accountant.can("inventory:view_financials"), true);
    assert.equal(inventoryManager.can("inventory:view_financials"), true);
  });

  test("vehicle permanent deletion is restricted to owner and admin only", () => {
    const owner = createMockAuthContext("owner");
    const admin = createMockAuthContext("admin");
    const invMgr = createMockAuthContext("inventory_manager");
    const salesExec = createMockAuthContext("sales_executive");

    assert.equal(owner.can("inventory:delete"), true);
    assert.equal(admin.can("inventory:delete"), true);
    assert.equal(invMgr.can("inventory:delete"), false, "Inventory Manager must not have vehicle delete capability");
    assert.equal(salesExec.can("inventory:delete"), false);
  });
});

describe("3. Leads & CRM Scoping & Action Protection", () => {
  test("sales executive is restricted to assigned leads query scoping", () => {
    const salesExec = createMockAuthContext("sales_executive");

    assert.equal(salesExec.can("leads:view_all"), false);
    assert.equal(salesExec.can("leads:view_assigned_only"), true);

    const isAssignedOnly = !salesExec.can("leads:view_all") && salesExec.can("leads:view_assigned_only");
    assert.equal(isAssignedOnly, true, "Sales executive must trigger assigned-only isolation query");
  });

  test("sales manager and admin have showroom-wide lead view access", () => {
    const salesMgr = createMockAuthContext("sales_manager");
    const admin = createMockAuthContext("admin");

    assert.equal(salesMgr.can("leads:view_all"), true);
    assert.equal(admin.can("leads:view_all"), true);

    const isSalesMgrAssignedOnly = !salesMgr.can("leads:view_all") && salesMgr.can("leads:view_assigned_only");
    assert.equal(isSalesMgrAssignedOnly, false, "Sales manager must have unrestricted showroom lead visibility");
  });

  test("lead reassignment and deletion are blocked for sales executives", () => {
    const salesExec = createMockAuthContext("sales_executive");

    assert.equal(salesExec.can("leads:reassign"), false);
    assert.equal(salesExec.can("leads:delete"), false);

    // Sales manager can reassign but not delete
    const salesMgr = createMockAuthContext("sales_manager");
    assert.equal(salesMgr.can("leads:reassign"), true);
    assert.equal(salesMgr.can("leads:delete"), false);

    // Owner and admin can both reassign and delete
    const admin = createMockAuthContext("admin");
    assert.equal(admin.can("leads:reassign"), true);
    assert.equal(admin.can("leads:delete"), true);
  });
});

describe("4. Accounting, Deals & Transaction Capabilities", () => {
  test("accounting workspace overview is blocked for sales executives and managers", () => {
    const salesExec = createMockAuthContext("sales_executive");
    const salesMgr = createMockAuthContext("sales_manager");
    const viewer = createMockAuthContext("viewer");

    assert.equal(salesExec.can("accounting:view_pnl"), false);
    assert.equal(salesMgr.can("accounting:view_pnl"), false);
    assert.equal(viewer.can("accounting:view_pnl"), false);

    const accountant = createMockAuthContext("accountant");
    const admin = createMockAuthContext("admin");
    const owner = createMockAuthContext("owner");

    assert.equal(accountant.can("accounting:view_pnl"), true);
    assert.equal(admin.can("accounting:view_pnl"), true);
    assert.equal(owner.can("accounting:view_pnl"), true);
  });

  test("recording financial expenses and payments requires accounting:record_transactions", () => {
    const accountant = createMockAuthContext("accountant");
    const salesExec = createMockAuthContext("sales_executive");

    assert.equal(accountant.can("accounting:record_transactions"), true);
    assert.equal(salesExec.can("accounting:record_transactions"), false);
  });

  test("sales deal contraction is granted to sales team and leadership", () => {
    const salesExec = createMockAuthContext("sales_executive");
    const salesMgr = createMockAuthContext("sales_manager");
    const viewer = createMockAuthContext("viewer");

    assert.equal(salesExec.can("sales:create"), true);
    assert.equal(salesMgr.can("sales:create"), true);
    assert.equal(viewer.can("sales:create"), false);
  });
});

describe("5. Team & Staff Management Capabilities", () => {
  test("staff invitation, suspension, and role change require granular capabilities", () => {
    const admin = createMockAuthContext("admin");
    const owner = createMockAuthContext("owner");
    const salesMgr = createMockAuthContext("sales_manager");

    assert.equal(owner.can("staff:invite"), true);
    assert.equal(admin.can("staff:invite"), true);
    assert.equal(salesMgr.can("staff:invite"), false);

    assert.equal(owner.can("staff:change_role"), true);
    assert.equal(admin.can("staff:change_role"), true);
    assert.equal(salesMgr.can("staff:change_role"), false);

    assert.equal(owner.can("staff:suspend"), true);
    assert.equal(admin.can("staff:suspend"), true);
    assert.equal(salesMgr.can("staff:suspend"), false);

    assert.equal(owner.can("staff:remove"), true);
    assert.equal(admin.can("staff:remove"), true);
    assert.equal(salesMgr.can("staff:remove"), false);
  });
});

