import { cache } from "react";
import { createClient } from "@repo/supabase/server";
import {
  type PermissionKey,
  type RolePermissions,
  hasPermission,
  getRolePermissions,
} from "./permissions";

export * from "./permissions";

export type StaffRole =
  | "owner"
  | "admin"
  | "sales_manager"
  | "sales_executive"
  | "inventory_manager"
  | "accountant"
  | "viewer";

export type StaffStatus = "active" | "suspended" | "pending_invite";

export interface AuthenticatedContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: {
    id: string;
    email?: string;
  };
  profile: {
    id: string;
    fullName: string;
    role: StaffRole;
    status: StaffStatus;
    dealershipId: string;
    onboardingCompleted: boolean;
  };
  dealership: {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
  };
  /**
   * Evaluated permissions and capabilities for the authenticated caller.
   * Provides granular capability lookup and legacy convenience flags.
   */
  permissions: {
    /** Granular capability evaluator for atomic PermissionKey checks */
    can: (permission: PermissionKey) => boolean;
    /** Complete pre-evaluated capability record for this role */
    canMap: RolePermissions;

    // ── Legacy convenience flags (maintained for 100% backward compatibility) ──
    isOwner: boolean;
    canManageStaff: boolean;     // owner | admin
    canManageInventory: boolean; // owner | admin | inventory_manager
    canViewFinancials: boolean;  // owner | admin | accountant
    canManageLeads: boolean;     // owner | admin | sales_manager | sales_executive
  };
  /** Direct capability evaluator at context root */
  can: (permission: PermissionKey) => boolean;
}

/**
 * Request-scoped authenticated context deduplicator using React.cache().
 *
 * SECURITY & TENANT ISOLATION GUARANTEES:
 * 1. Evaluated strictly server-side with independent Supabase Auth verification.
 * 2. Scoped strictly to the lifetime of a single HTTP request (zero cross-tenant or cross-user memory leakage).
 * 3. Executes exactly ONCE per request. Any subsequent calls within layout, page, or actions
 *    resolve from memory in <0.01ms, eliminating network waterfalls.
 * 4. Suspended accounts are blocked at this layer — every Server Action that calls
 *    getAuthenticatedContext() propagates the suspension check automatically.
 */
export const getAuthenticatedContext = cache(
  async (): Promise<AuthenticatedContext | null> => {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Single combined relational query for profile and dealership.
    // Now also fetches: status (suspension enforcement) added in
    // migration 20261107000007_create_staff_and_roles.
    const { data: profile, error: profileError } = await (supabase.from("profiles") as any)
      .select(`
        id,
        full_name,
        role,
        status,
        dealership_id,
        onboarding_completed,
        dealerships (
          id,
          name,
          slug,
          address,
          city,
          state
        )
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return null;
    }

    // ── Suspension enforcement ────────────────────────────────────────
    // A suspended staff member must be blocked from ALL server-side operations.
    // This check runs once per request (React.cache deduplicates the query),
    // so it adds zero latency overhead for subsequent action calls within the
    // same request lifecycle.
    if (profile.status === "suspended") {
      throw new Error(
        "Your account has been suspended. Please contact your showroom owner or general manager."
      );
    }

    const dealershipData = profile.dealerships;
    const role = (profile.role || "viewer") as StaffRole;

    // ── Evaluate capability matrix for the authenticated caller ───────
    const rolePermissions = getRolePermissions(role);
    const can = (permission: PermissionKey) => hasPermission(role, permission);

    const permissions = {
      // Granular capability lookups
      can,
      canMap: rolePermissions,

      // Legacy convenience flags (maintained for 100% backward compatibility)
      isOwner: role === "owner",
      canManageStaff: (["owner", "admin"] as StaffRole[]).includes(role),
      canManageInventory: (["owner", "admin", "inventory_manager"] as StaffRole[]).includes(role),
      canViewFinancials: (["owner", "admin", "accountant"] as StaffRole[]).includes(role),
      canManageLeads: (["owner", "admin", "sales_manager", "sales_executive"] as StaffRole[]).includes(role),
    };

    return {
      supabase,
      user: {
        id: user.id,
        email: user.email,
      },
      profile: {
        id: profile.id,
        fullName: profile.full_name || "Showroom Staff",
        role,
        status: (profile.status || "active") as StaffStatus,
        dealershipId: profile.dealership_id || "",
        onboardingCompleted: Boolean(profile.onboarding_completed),
      },
      dealership: {
        id: dealershipData?.id || profile.dealership_id || "",
        name: dealershipData?.name || "Apex Motors",
        slug: dealershipData?.slug || "apex-motors",
        address: dealershipData?.address || null,
        city: dealershipData?.city || null,
        state: dealershipData?.state || null,
      },
      permissions,
      can,
    };
  }
);

