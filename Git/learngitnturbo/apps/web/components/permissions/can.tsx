"use client";

import React from "react";
import type { StaffRole, PermissionKey } from "../../lib/permissions/types";
import { usePermissions } from "../../lib/permissions/context";
import {
  evaluateCanProps,
  type CanEvaluationProps,
} from "../../lib/permissions/evaluator";

export interface CanProps extends CanEvaluationProps {
  /** Fallback content to render when access is denied (defaults to null) */
  fallback?: React.ReactNode;
  /** Child content or render-prop function receiving the authorization boolean */
  children: React.ReactNode | ((granted: boolean) => React.ReactNode);
}

export { evaluateCanProps };

/**
 * Declarative UI gating component.
 *
 * Renders children when the authenticated user possesses the required capability,
 * or renders fallback content when unauthorized.
 *
 * @example
 * // 1. Gate on single capability
 * <Can permission="inventory:create" fallback={<p>Read only</p>}>
 *   <AddVehicleButton />
 * </Can>
 *
 * @example
 * // 2. Inverse check (hide financial columns from unauthorized staff)
 * <Can not permission="inventory:view_financials">
 *   <LockedFinancialNotice />
 * </Can>
 *
 * @example
 * // 3. Render prop for custom conditional styling or disabled state
 * <Can permission="inventory:delete">
 *   {(canDelete) => (
 *     <button disabled={!canDelete} className={canDelete ? "text-rose-600" : "opacity-40"}>
 *       Delete
 *     </button>
 *   )}
 * </Can>
 */
export function Can({
  permission,
  all,
  any,
  role,
  not = false,
  fallback = null,
  children,
}: CanProps): React.JSX.Element | null {
  const context = usePermissions();

  const isGranted = evaluateCanProps(
    { permission, all, any, role, not },
    context
  );

  if (typeof children === "function") {
    return <>{children(isGranted)}</>;
  }

  if (isGranted) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
