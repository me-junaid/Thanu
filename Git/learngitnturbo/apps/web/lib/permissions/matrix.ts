import {
  type StaffRole,
  type PermissionKey,
  type RolePermissions,
  type RolePermissionMap,
  ALL_PERMISSION_KEYS,
} from "./types";

/**
 * Fallback empty permissions map where all capabilities evaluate to false.
 * Used when an unrecognized role or unauthenticated state is passed.
 */
const EMPTY_PERMISSIONS: RolePermissions = Object.freeze(
  ALL_PERMISSION_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as RolePermissions)
);

/**
 * CANONICAL ROLE PERMISSION MATRIX
 *
 * Single source of truth for role-based capabilities across the Orgetise platform.
 * Defines access across Showroom Administration, Staff Management, Fleet Inventory,
 * Leads & CRM, Test Drives, Sales/Purchases, and Accounting.
 */
export const ROLE_PERMISSIONS: RolePermissionMap = {
  // ── 1. Showroom Principal (Owner) ──────────────────────────────────────────
  // Ultimate authority: Universal access across all platform capabilities.
  owner: {
    "showroom:manage_settings": true,
    "showroom:view_details": true,
    "staff:manage_roster": true,
    "staff:invite": true,
    "staff:change_role": true,
    "staff:suspend": true,
    "staff:remove": true,
    "inventory:view": true,
    "inventory:create": true,
    "inventory:edit": true,
    "inventory:delete": true,
    "inventory:view_financials": true,
    "leads:view_all": true,
    "leads:view_assigned_only": true,
    "leads:create": true,
    "leads:update": true,
    "leads:delete": true,
    "leads:reassign": true,
    "test_drives:view_all": true,
    "test_drives:view_assigned": true,
    "test_drives:schedule": true,
    "test_drives:complete": true,
    "sales:view_all": true,
    "sales:create": true,
    "purchases:view": true,
    "purchases:create": true,
    "accounting:view_pnl": true,
    "accounting:record_transactions": true,
    "accounting:view_bank_accounts": true,
    "accounting:export_reports": true,
  },

  // ── 2. General Manager (Admin) ─────────────────────────────────────────────
  // Operational leadership: Full access to staff, inventory, CRM, and accounting,
  // but strictly CANNOT modify showroom legal identity, root domain, or settings.
  admin: {
    "showroom:manage_settings": false, // Showroom Owner exclusive
    "showroom:view_details": true,
    "staff:manage_roster": true,
    "staff:invite": true,
    "staff:change_role": true,
    "staff:suspend": true,
    "staff:remove": true,
    "inventory:view": true,
    "inventory:create": true,
    "inventory:edit": true,
    "inventory:delete": true,
    "inventory:view_financials": true,
    "leads:view_all": true,
    "leads:view_assigned_only": true,
    "leads:create": true,
    "leads:update": true,
    "leads:delete": true,
    "leads:reassign": true,
    "test_drives:view_all": true,
    "test_drives:view_assigned": true,
    "test_drives:schedule": true,
    "test_drives:complete": true,
    "sales:view_all": true,
    "sales:create": true,
    "purchases:view": true,
    "purchases:create": true,
    "accounting:view_pnl": true,
    "accounting:record_transactions": true,
    "accounting:view_bank_accounts": true,
    "accounting:export_reports": true,
  },

  // ── 3. Sales Manager ───────────────────────────────────────────────────────
  // Leads pipeline & deal supervision: Full leads visibility, reassignment, and
  // sales creation. Cannot inspect vehicle purchase costs, accounting, or staff.
  sales_manager: {
    "showroom:manage_settings": false,
    "showroom:view_details": true,
    "staff:manage_roster": false,
    "staff:invite": false,
    "staff:change_role": false,
    "staff:suspend": false,
    "staff:remove": false,
    "inventory:view": true,
    "inventory:create": false,
    "inventory:edit": false,
    "inventory:delete": false,
    "inventory:view_financials": false, // No purchase cost or profit margin access
    "leads:view_all": true,
    "leads:view_assigned_only": true,
    "leads:create": true,
    "leads:update": true,
    "leads:delete": false,
    "leads:reassign": true,
    "test_drives:view_all": true,
    "test_drives:view_assigned": true,
    "test_drives:schedule": true,
    "test_drives:complete": true,
    "sales:view_all": true,
    "sales:create": true,
    "purchases:view": false,
    "purchases:create": false,
    "accounting:view_pnl": false,
    "accounting:record_transactions": false,
    "accounting:view_bank_accounts": false,
    "accounting:export_reports": false,
  },

  // ── 4. Sales Executive ─────────────────────────────────────────────────────
  // Sales floor staff: Strictly isolated to assigned customer leads and deals.
  // Cannot view unassigned leads, cannot view purchase costs, cannot touch accounting.
  sales_executive: {
    "showroom:manage_settings": false,
    "showroom:view_details": true,
    "staff:manage_roster": false,
    "staff:invite": false,
    "staff:change_role": false,
    "staff:suspend": false,
    "staff:remove": false,
    "inventory:view": true,
    "inventory:create": false,
    "inventory:edit": false,
    "inventory:delete": false,
    "inventory:view_financials": false,
    "leads:view_all": false,
    "leads:view_assigned_only": true, // Strictly assigned leads
    "leads:create": true,
    "leads:update": true,
    "leads:delete": false,
    "leads:reassign": false,
    "test_drives:view_all": false,
    "test_drives:view_assigned": true,
    "test_drives:schedule": true,
    "test_drives:complete": true,
    "sales:view_all": false,
    "sales:create": true,
    "purchases:view": false,
    "purchases:create": false,
    "accounting:view_pnl": false,
    "accounting:record_transactions": false,
    "accounting:view_bank_accounts": false,
    "accounting:export_reports": false,
  },

  // ── 5. Inventory Manager ───────────────────────────────────────────────────
  // Fleet acquisition & lot maintenance: Full fleet management including purchase
  // costs and refurbishment expenses. Cannot delete vehicles or access CRM.
  inventory_manager: {
    "showroom:manage_settings": false,
    "showroom:view_details": true,
    "staff:manage_roster": false,
    "staff:invite": false,
    "staff:change_role": false,
    "staff:suspend": false,
    "staff:remove": false,
    "inventory:view": true,
    "inventory:create": true,
    "inventory:edit": true,
    "inventory:delete": false, // Deleting vehicles requires Owner/Admin authorization
    "inventory:view_financials": true, // Allowed for recording purchase/inspection costs
    "leads:view_all": false,
    "leads:view_assigned_only": false,
    "leads:create": false,
    "leads:update": false,
    "leads:delete": false,
    "leads:reassign": false,
    "test_drives:view_all": false,
    "test_drives:view_assigned": false,
    "test_drives:schedule": false,
    "test_drives:complete": false,
    "sales:view_all": false,
    "sales:create": false,
    "purchases:view": true,
    "purchases:create": true,
    "accounting:view_pnl": false,
    "accounting:record_transactions": false,
    "accounting:view_bank_accounts": false,
    "accounting:export_reports": false,
  },

  // ── 6. Accountant ──────────────────────────────────────────────────────────
  // Showroom Financials: Full access to deal sheets, P&L, bank accounts, and
  // transaction logs. Has zero access to leads CRM, test drives, or staff management.
  accountant: {
    "showroom:manage_settings": false,
    "showroom:view_details": true,
    "staff:manage_roster": false,
    "staff:invite": false,
    "staff:change_role": false,
    "staff:suspend": false,
    "staff:remove": false,
    "inventory:view": true,
    "inventory:create": false,
    "inventory:edit": false,
    "inventory:delete": false,
    "inventory:view_financials": true,
    "leads:view_all": false,
    "leads:view_assigned_only": false,
    "leads:create": false,
    "leads:update": false,
    "leads:delete": false,
    "leads:reassign": false,
    "test_drives:view_all": false,
    "test_drives:view_assigned": false,
    "test_drives:schedule": false,
    "test_drives:complete": false,
    "sales:view_all": true,
    "sales:create": false,
    "purchases:view": true,
    "purchases:create": false,
    "accounting:view_pnl": true,
    "accounting:record_transactions": true,
    "accounting:view_bank_accounts": true,
    "accounting:export_reports": true,
  },

  // ── 7. Viewer ──────────────────────────────────────────────────────────────
  // Read-only auditor: Strictly read-only access to showroom overview and fleet.
  // Zero mutation rights and zero access to customer PII or private financials.
  viewer: {
    "showroom:manage_settings": false,
    "showroom:view_details": true,
    "staff:manage_roster": false,
    "staff:invite": false,
    "staff:change_role": false,
    "staff:suspend": false,
    "staff:remove": false,
    "inventory:view": true,
    "inventory:create": false,
    "inventory:edit": false,
    "inventory:delete": false,
    "inventory:view_financials": false,
    "leads:view_all": false,
    "leads:view_assigned_only": false,
    "leads:create": false,
    "leads:update": false,
    "leads:delete": false,
    "leads:reassign": false,
    "test_drives:view_all": false,
    "test_drives:view_assigned": false,
    "test_drives:schedule": false,
    "test_drives:complete": false,
    "sales:view_all": false,
    "sales:create": false,
    "purchases:view": false,
    "purchases:create": false,
    "accounting:view_pnl": false,
    "accounting:record_transactions": false,
    "accounting:view_bank_accounts": false,
    "accounting:export_reports": false,
  },
};

/**
 * Evaluates whether a role possesses a specific permission.
 * Safely returns false if role is unrecognized or undefined.
 */
export function hasPermission(
  role: StaffRole | string | undefined | null,
  permission: PermissionKey
): boolean {
  if (!role || !(role in ROLE_PERMISSIONS)) {
    return false;
  }
  return ROLE_PERMISSIONS[role as StaffRole][permission] ?? false;
}

/**
 * Returns true if the role possesses ALL of the provided permissions.
 */
export function hasAllPermissions(
  role: StaffRole | string | undefined | null,
  permissions: PermissionKey[]
): boolean {
  if (!permissions.length) return false;
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Returns true if the role possesses AT LEAST ONE of the provided permissions.
 */
export function hasAnyPermission(
  role: StaffRole | string | undefined | null,
  permissions: PermissionKey[]
): boolean {
  if (!permissions.length) return false;
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Retrieves the complete RolePermissions dictionary for a given role.
 * Returns an all-false dictionary if the role is unrecognized.
 */
export function getRolePermissions(
  role: StaffRole | string | undefined | null
): RolePermissions {
  if (!role || !(role in ROLE_PERMISSIONS)) {
    return EMPTY_PERMISSIONS;
  }
  return ROLE_PERMISSIONS[role as StaffRole];
}

/**
 * Returns a list of all PermissionKey strings enabled for the given role.
 */
export function getPermissionsList(
  role: StaffRole | string | undefined | null
): PermissionKey[] {
  const permissions = getRolePermissions(role);
  return ALL_PERMISSION_KEYS.filter((key) => permissions[key]);
}

