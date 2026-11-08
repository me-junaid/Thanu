/**
 * Recognized staff roles in the Orgetise platform.
 */
export type StaffRole =
  | "owner"
  | "admin"
  | "sales_manager"
  | "sales_executive"
  | "inventory_manager"
  | "accountant"
  | "viewer";

/**
 * Domain-scoped atomic permission keys (`domain:action`).
 *
 * Each key represents a granular capability within the Orgetise platform.
 * Components, server actions, and route handlers gate on these capabilities
 * rather than hardcoded role strings.
 */
export type PermissionKey =
  // Showroom & Core Settings (Owner only)
  | "showroom:manage_settings"
  | "showroom:view_details"

  // Staff & Team Management
  | "staff:manage_roster"
  | "staff:invite"
  | "staff:change_role"
  | "staff:suspend"
  | "staff:remove"

  // Inventory & Fleet
  | "inventory:view"
  | "inventory:create"
  | "inventory:edit"
  | "inventory:delete"
  | "inventory:view_financials" // Private acquisition cost, repair expenses, profit margin

  // Leads & CRM
  | "leads:view_all"
  | "leads:view_assigned_only"
  | "leads:create"
  | "leads:update"
  | "leads:delete"
  | "leads:reassign"

  // Test Drives
  | "test_drives:view_all"
  | "test_drives:view_assigned"
  | "test_drives:schedule"
  | "test_drives:complete"

  // Sales & Purchases
  | "sales:view_all"
  | "sales:create"
  | "purchases:view"
  | "purchases:create"

  // Accounting & Financials
  | "accounting:view_pnl"
  | "accounting:record_transactions"
  | "accounting:view_bank_accounts"
  | "accounting:export_reports";

/**
 * Map of every PermissionKey to a boolean indicating authorization.
 */
export type RolePermissions = Record<PermissionKey, boolean>;

/**
 * Full matrix mapping each role to its corresponding RolePermissions object.
 */
export type RolePermissionMap = Record<StaffRole, RolePermissions>;

/**
 * All valid PermissionKey values as an array for exhaustive iteration and audits.
 */
export const ALL_PERMISSION_KEYS: readonly PermissionKey[] = [
  "showroom:manage_settings",
  "showroom:view_details",
  "staff:manage_roster",
  "staff:invite",
  "staff:change_role",
  "staff:suspend",
  "staff:remove",
  "inventory:view",
  "inventory:create",
  "inventory:edit",
  "inventory:delete",
  "inventory:view_financials",
  "leads:view_all",
  "leads:view_assigned_only",
  "leads:create",
  "leads:update",
  "leads:delete",
  "leads:reassign",
  "test_drives:view_all",
  "test_drives:view_assigned",
  "test_drives:schedule",
  "test_drives:complete",
  "sales:view_all",
  "sales:create",
  "purchases:view",
  "purchases:create",
  "accounting:view_pnl",
  "accounting:record_transactions",
  "accounting:view_bank_accounts",
  "accounting:export_reports",
] as const;

/**
 * Human-readable titles for staff roles across the showroom workspace.
 */
export const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Showroom Principal",
  admin: "General Manager",
  sales_manager: "Sales Manager",
  sales_executive: "Sales Executive",
  inventory_manager: "Inventory Manager",
  accountant: "Accountant",
  viewer: "Viewer",
};

/**
 * Professional role responsibility descriptions.
 */
export const ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  owner: "Full showroom administration, ownership, and financial control.",
  admin: "Operational leadership across staff, fleet, CRM, and accounting.",
  sales_manager: "Pipeline oversight, lead distribution, and deals supervision.",
  sales_executive: "Floor sales execution and assigned customer inquiries.",
  inventory_manager: "Fleet acquisition, vehicle refurbishment, and lot management.",
  accountant: "Financial books, P&L statements, and transaction recording.",
  viewer: "Read-only inspection access with zero mutation rights.",
};


