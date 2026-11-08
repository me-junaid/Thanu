import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CONSTANTS
// The 6 invitable roles (excludes 'owner' — owner is set at dealership creation,
// never assignable via invite or role-change action).
// ─────────────────────────────────────────────────────────────────────────────

export const INVITABLE_ROLES = [
  "admin",
  "sales_manager",
  "sales_executive",
  "inventory_manager",
  "accountant",
  "viewer",
] as const;

export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  owner:             "Showroom Principal",
  admin:             "General Manager",
  sales_manager:     "Sales Manager",
  sales_executive:   "Sales Executive",
  inventory_manager: "Inventory Manager",
  accountant:        "Accountant",
  viewer:            "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner:
    "Full access to all showroom data, billing, and team management. Cannot be invited — set at registration.",
  admin:
    "Manages daily operations, staff, inventory, and leads. Cannot access billing or modify the owner.",
  sales_manager:
    "Oversees the full leads pipeline, deal sheets, and test drive scheduling. Cannot view purchase costs.",
  sales_executive:
    "Creates and manages their own assigned leads, deal quotations, and test drives.",
  inventory_manager:
    "Full access to fleet inventory including purchase costs, media, and refurbishment logs.",
  accountant:
    "Full access to payments, deal financials, P&L, and RTO tracking. No sales pipeline access.",
  viewer:
    "Read-only access to overview metrics and P&L. Cannot create or modify any records.",
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA 1: Invite Staff Member
// Used by: inviteStaffMemberAction
// ─────────────────────────────────────────────────────────────────────────────

export const inviteStaffSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or fewer."),

  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),

  role: z
    .enum([
      "admin",
      "sales_manager",
      "sales_executive",
      "inventory_manager",
      "accountant",
      "viewer",
    ])
    .refine((v) => INVITABLE_ROLES.includes(v as InvitableRole), {
      message: "Please select a valid role for this staff member.",
    }),
});

export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA 2: Change Staff Role
// Used by: changeStaffRoleAction
// ─────────────────────────────────────────────────────────────────────────────

export const changeRoleSchema = z.object({
  staffId: z
    .string()
    .uuid("Invalid staff member ID."),

  newRole: z
    .enum([
      "admin",
      "sales_manager",
      "sales_executive",
      "inventory_manager",
      "accountant",
      "viewer",
    ])
    .refine((v) => INVITABLE_ROLES.includes(v as InvitableRole), {
      message: "Please select a valid role.",
    }),
});

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA 3: Remove Staff Member
// Used by: removeStaffMemberAction
// Optional: reassignTo allows open leads to be transferred before removal.
// ─────────────────────────────────────────────────────────────────────────────

export const removeStaffSchema = z.object({
  staffId: z
    .string()
    .uuid("Invalid staff member ID."),

  reassignTo: z
    .string()
    .uuid("Invalid reassignment target ID.")
    .optional(),
});

export type RemoveStaffInput = z.infer<typeof removeStaffSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA 4: Suspend / Reactivate Staff Member
// Used by: suspendStaffMemberAction, reactivateStaffMemberAction
// ─────────────────────────────────────────────────────────────────────────────

export const staffIdSchema = z.object({
  staffId: z
    .string()
    .uuid("Invalid staff member ID."),
});

export type StaffIdInput = z.infer<typeof staffIdSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA 5: Accept Invite
// Used by: acceptInviteAction (called from /accept-invite page)
// ─────────────────────────────────────────────────────────────────────────────

export const acceptInviteSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Invite token is required.")
    .max(128, "Invalid invite token format."),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA 6: Revoke Invite
// Used by: revokeInviteAction
// ─────────────────────────────────────────────────────────────────────────────

export const revokeInviteSchema = z.object({
  inviteId: z
    .string()
    .uuid("Invalid invite ID."),
});

export type RevokeInviteInput = z.infer<typeof revokeInviteSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA 7: Update Staff Profile (self-update)
// Used by: updateOwnProfileAction (Phase 5 — staff detail drawer)
// ─────────────────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or fewer.")
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(
      /^(\+91[\s-]?)?[6-9]\d{9}$/,
      "Please enter a valid Indian mobile number (e.g. +91 98765 43210)."
    )
    .optional()
    .or(z.literal("")),

  department: z
    .string()
    .trim()
    .max(80, "Department name must be 80 characters or fewer.")
    .optional(),

  avatarUrl: z
    .string()
    .url("Invalid avatar URL.")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
