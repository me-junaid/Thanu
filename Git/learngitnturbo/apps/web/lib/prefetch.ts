import { preload, mutate } from "swr";
import { getInventoryAction } from "../app/dashboard/inventory/actions";
import { getLeadsDashboardBundleAction } from "../app/dashboard/leads/actions";
import { getTestDrivesAction } from "../app/dashboard/test-drives/actions";
import { getAccountingOverviewAction } from "../app/dashboard/accounting/actions";
import { getTeamRosterAction } from "../app/dashboard/team/actions";

// ─────────────────────────────────────────────────────────────────────────────
// SWR CACHE KEY CONSTANTS
// Exact keys consumed by each dashboard shell component
// ─────────────────────────────────────────────────────────────────────────────

export const ROUTE_CACHE_KEYS = {
  "/dashboard/inventory":   "dashboard-inventory-data",
  "/dashboard/leads":       "dashboard-leads-data",
  "/dashboard/test-drives":  "dashboard-test-drives-data",
  "/dashboard/accounting":  "dashboard-accounting-data",
  "/dashboard/team":         "dashboard-team-roster-data",
} as const;

export type PrefetchableRoute = keyof typeof ROUTE_CACHE_KEYS;

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE FETCHERS
// Reuses server actions to populate destination SWR cache ahead of click
// ─────────────────────────────────────────────────────────────────────────────

export const ROUTE_FETCHERS: Record<PrefetchableRoute, () => Promise<unknown>> = {
  "/dashboard/inventory": async () => {
    return await getInventoryAction();
  },
  "/dashboard/leads": async () => {
    return await getLeadsDashboardBundleAction();
  },
  "/dashboard/test-drives": async () => {
    return await getTestDrivesAction();
  },
  "/dashboard/accounting": async () => {
    const res = await getAccountingOverviewAction();
    return res.data;
  },
  "/dashboard/team": async () => {
    return await getTeamRosterAction();
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY REGISTRY & DEDUPLICATION (30-second throttle)
// ─────────────────────────────────────────────────────────────────────────────

const prefetchTimestamps = new Map<string, number>();
const inFlightPrefetches = new Set<string>();

const PREFETCH_THROTTLE_MS = 30_000; // 30 seconds

/**
 * Resets prefetch throttle history (used during tests or tenant switching)
 */
export function clearPrefetchThrottle(): void {
  prefetchTimestamps.clear();
  inFlightPrefetches.clear();
}

/**
 * Completely purges SWR in-memory cache to guarantee zero cross-tenant data leakage
 */
export function clearDashboardCache(): void {
  clearPrefetchThrottle();
  // SWR: clears all cached keys and suppresses revalidation
  mutate(() => true, undefined, { revalidate: false });
}

/**
 * Returns true if the route is a valid dashboard prefetch destination
 */
export function isPrefetchableRoute(route: string): route is PrefetchableRoute {
  return Object.prototype.hasOwnProperty.call(ROUTE_CACHE_KEYS, route);
}

/**
 * Centralized predictive prefetch dispatcher.
 * Pre-warms the SWR in-memory cache when a user hovers over or touches a navigation link.
 */
export function prefetchRouteData(route: string): void {
  // 1. Guard against unsupported or invalid routes
  if (!isPrefetchableRoute(route)) {
    return;
  }

  // 2. Prevent concurrent duplicate fetches
  if (inFlightPrefetches.has(route)) {
    return;
  }

  // 3. Enforce 30-second deduplication throttle
  const now = Date.now();
  const lastPrefetch = prefetchTimestamps.get(route);
  if (lastPrefetch && now - lastPrefetch < PREFETCH_THROTTLE_MS) {
    return;
  }

  const cacheKey = ROUTE_CACHE_KEYS[route];
  const fetcher = ROUTE_FETCHERS[route];

  inFlightPrefetches.add(route);

  try {
    const prefetchPromise = preload(cacheKey, fetcher);

    if (prefetchPromise && typeof prefetchPromise.then === "function") {
      prefetchPromise
        .then(() => {
          prefetchTimestamps.set(route, Date.now());
        })
        .catch((err: unknown) => {
          // Log without throwing unhandled promise rejection; allows future retries
          console.warn(`[Prefetch] Background pre-warm failed for ${route}:`, err);
        })
        .finally(() => {
          inFlightPrefetches.delete(route);
        });
    } else {
      prefetchTimestamps.set(route, Date.now());
      inFlightPrefetches.delete(route);
    }
  } catch (err) {
    inFlightPrefetches.delete(route);
    console.warn(`[Prefetch] Synchronous error initiating preload for ${route}:`, err);
  }
}
