"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { StaffRole, PermissionKey, RolePermissions } from "./types";
import {
  ROLE_PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
} from "./matrix";

/**
 * Client-side permissions context contract.
 */
export interface PermissionsContextValue {
  /** The authenticated staff member's role */
  role: StaffRole;
  /** Unique ID of the authenticated user */
  userId: string | null;
  /** Frozen lookup map of all 30 granular capabilities */
  permissions: RolePermissions;
  /** Evaluate a single capability */
  can: (permission: PermissionKey) => boolean;
  /** Evaluate whether the user has all specified capabilities */
  canAll: (...permissions: PermissionKey[]) => boolean;
  /** Evaluate whether the user has at least one of the specified capabilities */
  canAny: (...permissions: PermissionKey[]) => boolean;
  /** Showroom Principal convenience check */
  isOwner: boolean;
  /** General Manager convenience check */
  isAdmin: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export interface PermissionsProviderProps {
  /** The current staff role (e.g. 'owner', 'sales_executive', etc.) */
  role?: StaffRole | null;
  /** Pre-computed permissions map from the server context */
  permissions?: Partial<RolePermissions> | null;
  /** Authenticated user's unique ID */
  userId?: string | null;
  /** Children elements within the dashboard or UI tree */
  children: React.ReactNode;
}

/**
 * Client Context Provider for granular role capabilities and UI differentiation.
 * Hydrates permissions directly from server context with zero extra network roundtrips.
 */
export function PermissionsProvider({
  role = "viewer",
  permissions: initialPermissions,
  userId = null,
  children,
}: PermissionsProviderProps) {
  const safeRole: StaffRole = (role && ROLE_PERMISSIONS[role] ? role : "viewer") as StaffRole;

  const value = useMemo<PermissionsContextValue>(() => {
    // If server passed a verified canMap, use it; otherwise compute from canonical matrix
    const resolvedPermissions: RolePermissions = initialPermissions
      ? ({ ...getRolePermissions(safeRole), ...initialPermissions } as RolePermissions)
      : getRolePermissions(safeRole);

    return {
      role: safeRole,
      userId: userId ?? null,
      permissions: resolvedPermissions,
      can: (permission: PermissionKey) => resolvedPermissions[permission] ?? false,
      canAll: (...keys: PermissionKey[]) => keys.every((k) => resolvedPermissions[k] ?? false),
      canAny: (...keys: PermissionKey[]) => keys.some((k) => resolvedPermissions[k] ?? false),
      isOwner: safeRole === "owner",
      isAdmin: safeRole === "admin",
    };
  }, [safeRole, initialPermissions, userId]);

  return React.createElement(
    PermissionsContext.Provider,
    { value },
    children
  );
}

/**
 * Access the full permissions context. Throws an informative error if used outside PermissionsProvider.
 */
export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error(
      "usePermissions must be used within a <PermissionsProvider>. Ensure your component is wrapped in DashboardLayout or PermissionsProvider."
    );
  }
  return context;
}

/**
 * Hook to evaluate a single permission capability.
 *
 * @example
 * const canCreateCar = usePermission("inventory:create");
 */
export function usePermission(permission: PermissionKey): boolean {
  const { can } = usePermissions();
  return can(permission);
}

/**
 * Hook to retrieve the authenticated staff member's role.
 *
 * @example
 * const role = useRole(); // 'sales_executive'
 */
export function useRole(): StaffRole {
  const { role } = usePermissions();
  return role;
}

/**
 * Convenience hook providing pure capability evaluators and role helpers.
 */
export function useCan() {
  const { can, canAll, canAny, role, isOwner, isAdmin } = usePermissions();
  return { can, canAll, canAny, role, isOwner, isAdmin };
}
