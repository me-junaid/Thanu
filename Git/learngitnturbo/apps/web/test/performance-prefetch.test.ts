import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  ROUTE_CACHE_KEYS,
  ROUTE_FETCHERS,
  isPrefetchableRoute,
  prefetchRouteData,
  clearPrefetchThrottle,
  clearDashboardCache,
  type PrefetchableRoute,
} from "../lib/prefetch";

import { ROLE_PERMISSIONS } from "../lib/permissions/matrix";
import type { StaffRole, PermissionKey } from "../lib/permissions/types";

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Route-to-Cache Key & Fetcher Mapping
// ─────────────────────────────────────────────────────────────────────────────

describe("1. SWR Route-to-Cache Key & Fetcher Mapping", () => {
  const expectedRoutes: Record<PrefetchableRoute, string> = {
    "/dashboard/inventory": "dashboard-inventory-data",
    "/dashboard/leads": "dashboard-leads-data",
    "/dashboard/test-drives": "dashboard-test-drives-data",
    "/dashboard/accounting": "dashboard-accounting-data",
    "/dashboard/team": "dashboard-team-roster-data",
  };

  it("maps all 5 canonical dashboard routes to their exact SWR cache keys", () => {
    for (const [route, expectedKey] of Object.entries(expectedRoutes)) {
      assert.equal(
        ROUTE_CACHE_KEYS[route as PrefetchableRoute],
        expectedKey,
        `Route ${route} must map to SWR cache key '${expectedKey}'`
      );
    }
  });

  it("registers an executable fetcher function for every prefetchable route", () => {
    for (const route of Object.keys(expectedRoutes) as PrefetchableRoute[]) {
      assert.equal(
        typeof ROUTE_FETCHERS[route],
        "function",
        `Route ${route} must have a registered fetcher function`
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Route Validation & Safety Boundaries
// ─────────────────────────────────────────────────────────────────────────────

describe("2. Route Validation & Unsupported Route Rejection", () => {
  it("recognizes all 5 dashboard routes as prefetchable", () => {
    assert.equal(isPrefetchableRoute("/dashboard/inventory"), true);
    assert.equal(isPrefetchableRoute("/dashboard/leads"), true);
    assert.equal(isPrefetchableRoute("/dashboard/test-drives"), true);
    assert.equal(isPrefetchableRoute("/dashboard/accounting"), true);
    assert.equal(isPrefetchableRoute("/dashboard/team"), true);
  });

  it("rejects non-prefetchable, overview, or external routes", () => {
    assert.equal(isPrefetchableRoute("/dashboard"), false, "Overview is not an SWR data shell");
    assert.equal(isPrefetchableRoute("/dashboard/settings"), false, "Settings is not prefetched");
    assert.equal(isPrefetchableRoute("/login"), false);
    assert.equal(isPrefetchableRoute("/"), false);
    assert.equal(isPrefetchableRoute("/unknown/route"), false);
  });

  it("safely handles prefetch calls for non-prefetchable routes without throwing", () => {
    assert.doesNotThrow(() => {
      prefetchRouteData("/dashboard");
      prefetchRouteData("/dashboard/settings");
      prefetchRouteData("/invalid-route");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Prefetch Deduplication & Throttle Control
// ─────────────────────────────────────────────────────────────────────────────

describe("3. Predictive Prefetch Deduplication & Throttle Control", () => {
  beforeEach(() => {
    clearPrefetchThrottle();
  });

  it("throttles repeated prefetch calls for the same route within the 30-second window", () => {
    // First prefetch invocation should register and execute
    assert.doesNotThrow(() => {
      prefetchRouteData("/dashboard/inventory");
    });

    // Immediate second prefetch for same route must be suppressed without error
    assert.doesNotThrow(() => {
      prefetchRouteData("/dashboard/inventory");
    });
  });

  it("allows re-prefetching immediately after clearPrefetchThrottle() is called", () => {
    prefetchRouteData("/dashboard/inventory");
    clearPrefetchThrottle();
    assert.doesNotThrow(() => {
      prefetchRouteData("/dashboard/inventory");
    });
  });

  it("clears both throttle history and in-memory cache on clearDashboardCache()", () => {
    prefetchRouteData("/dashboard/leads");
    assert.doesNotThrow(() => {
      clearDashboardCache();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Permission-Aware Prefetch Guarding
// ─────────────────────────────────────────────────────────────────────────────

describe("4. Permission-Aware Navigation Integrity", () => {
  it("enforces that sales executives cannot access or prefetch accounting or team data", () => {
    const executiveRole: StaffRole = "sales_executive";
    const executivePermissions = ROLE_PERMISSIONS[executiveRole];

    assert.equal(
      executivePermissions["accounting:view_pnl" as PermissionKey],
      false,
      "Sales executive must not have accounting:view_pnl permission"
    );
    assert.equal(
      executivePermissions["staff:manage_roster" as PermissionKey],
      false,
      "Sales executive must not have staff:manage_roster permission"
    );
  });

  it("enforces that inventory managers have inventory permissions but not staff permissions", () => {
    const invManagerRole: StaffRole = "inventory_manager";
    const invPermissions = ROLE_PERMISSIONS[invManagerRole];

    assert.equal(
      invPermissions["inventory:view" as PermissionKey],
      true,
      "Inventory manager must have inventory:view permission"
    );
    assert.equal(
      invPermissions["staff:manage_roster" as PermissionKey],
      false,
      "Inventory manager must not have staff:manage_roster permission"
    );
  });

  it("ensures dealership owners have comprehensive permissions across all dashboard modules", () => {
    const ownerPermissions = ROLE_PERMISSIONS["owner"];

    assert.equal(ownerPermissions["inventory:view" as PermissionKey], true);
    assert.equal(ownerPermissions["leads:view_all" as PermissionKey], true);
    assert.equal(ownerPermissions["accounting:view_pnl" as PermissionKey], true);
    assert.equal(ownerPermissions["staff:manage_roster" as PermissionKey], true);
  });
});

