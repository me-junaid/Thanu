import type { AuthenticatedContext } from "../auth";
import type { PermissionKey } from "./types";

/**
 * Standard structured error thrown when an authenticated caller lacks a required capability.
 */
export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN" as const;
  readonly status = 403 as const;
  readonly requiredPermission?: PermissionKey;

  constructor(
    message = "Forbidden: Insufficient permissions for this action.",
    requiredPermission?: PermissionKey
  ) {
    super(message);
    this.name = "ForbiddenError";
    this.requiredPermission = requiredPermission;
  }
}

/**
 * Standard structured error thrown when an unauthenticated caller attempts a protected action.
 */
export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED" as const;
  readonly status = 401 as const;

  constructor(message = "Unauthorized: Please log in to your showroom workspace.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Asserts that the authenticated context caller possesses the required capability.
 * Throws a ForbiddenError if unauthorized.
 */
export function assertPermission(
  context: AuthenticatedContext,
  permission: PermissionKey,
  customErrorMsg?: string
): void {
  if (!context || typeof context.can !== "function") {
    throw new UnauthorizedError();
  }

  if (!context.can(permission)) {
    throw new ForbiddenError(
      customErrorMsg ||
        `Forbidden: Your account does not have permission to perform this action (${permission}).`,
      permission
    );
  }
}

/**
 * Inspects capability and returns a standardized result object instead of throwing.
 * Convenient for Server Actions that return `{ success: false, error: string }`.
 */
export function checkPermission(
  context: AuthenticatedContext | null | undefined,
  permission: PermissionKey,
  customErrorMsg?: string
): { allowed: true } | { allowed: false; error: string } {
  if (!context || !context.dealership?.id) {
    return {
      allowed: false,
      error: "Unauthorized: Please log in to your showroom workspace.",
    };
  }

  if (!context.can(permission)) {
    return {
      allowed: false,
      error:
        customErrorMsg ||
        `Forbidden: Your account does not have permission to perform this action (${permission}).`,
    };
  }

  return { allowed: true };
}

/**
 * Retrieves the request-scoped authenticated context and verifies an optional capability.
 * Throws UnauthorizedError or ForbiddenError if requirements are not met.
 */
export async function requireAuthContext(
  permission?: PermissionKey,
  customErrorMsg?: string
): Promise<AuthenticatedContext> {
  const { getAuthenticatedContext } = await import("../auth");
  const context = await getAuthenticatedContext();

  if (!context || !context.dealership?.id || !context.supabase) {
    throw new UnauthorizedError();
  }

  if (permission) {
    assertPermission(context, permission, customErrorMsg);
  }

  return context;
}
