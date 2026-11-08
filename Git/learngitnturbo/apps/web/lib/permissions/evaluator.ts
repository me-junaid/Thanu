import type { StaffRole, PermissionKey } from "./types";

export interface CanEvaluationProps {
  /** Single permission key to assert */
  permission?: PermissionKey;
  /** Set of permissions where ALL must be true */
  all?: PermissionKey[];
  /** Set of permissions where AT LEAST ONE must be true */
  any?: PermissionKey[];
  /** Allowed staff role or array of roles */
  role?: StaffRole | StaffRole[];
  /** Invert the permission check (e.g. show only if permission is NOT possessed) */
  not?: boolean;
}

/**
 * Pure evaluation function for declarative permission assertions against a context contract.
 */
export function evaluateCanProps(
  props: CanEvaluationProps,
  context: {
    role: StaffRole;
    can: (p: PermissionKey) => boolean;
    canAll: (...keys: PermissionKey[]) => boolean;
    canAny: (...keys: PermissionKey[]) => boolean;
  }
): boolean {
  const { permission, all, any, role, not = false } = props;

  let granted = true;

  // 1. Single permission check
  if (permission) {
    granted = granted && context.can(permission);
  }

  // 2. All permissions check (conjunction)
  if (all && all.length > 0) {
    granted = granted && context.canAll(...all);
  }

  // 3. Any permissions check (disjunction)
  if (any && any.length > 0) {
    granted = granted && context.canAny(...any);
  }

  // 4. Role check
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    granted = granted && allowedRoles.includes(context.role);
  }

  return not ? !granted : granted;
}

