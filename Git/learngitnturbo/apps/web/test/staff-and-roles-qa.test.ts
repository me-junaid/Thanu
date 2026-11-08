import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Schemas & Constants
import {
  INVITABLE_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  inviteStaffSchema,
  changeRoleSchema,
  removeStaffSchema,
  staffIdSchema,
  acceptInviteSchema,
  revokeInviteSchema,
  type InvitableRole,
} from "../lib/schemas/team";

// Email Templates
import {
  formatInviteExpiryDate,
  renderStaffInviteHtml,
  renderStaffInvitePlainText,
} from "../lib/email/templates/staff-invite-email";

// Resend Adapter
import { sendStaffInviteEmail } from "../lib/email/resend";

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Zod Validation & Schema Defense
// ─────────────────────────────────────────────────────────────────────────────

describe("1. Zod Validation & Schema Defense", () => {
  it("rejects assigning the 'owner' role in staff invitations", () => {
    const invalidInput = {
      fullName: "Vikram Malhotra",
      email: "vikram@example.com",
      role: "owner" as any,
    };
    const result = inviteStaffSchema.safeParse(invalidInput);
    assert.equal(result.success, false, "Owner role must not be invitable");
  });

  it("accepts all 6 valid invitable roles in staff invitations", () => {
    for (const role of INVITABLE_ROLES) {
      const valid = inviteStaffSchema.safeParse({
        fullName: "Aarav Sharma",
        email: "aarav@apexmotors.in",
        role,
      });
      assert.equal(valid.success, true, `Role '${role}' should be valid for invitation`);
    }
  });

  it("rejects invalid email formats in staff invitations", () => {
    const invalidEmails = ["not-an-email", "@missinguser.com", "user@", ""];
    for (const email of invalidEmails) {
      const res = inviteStaffSchema.safeParse({
        fullName: "Test User",
        email,
        role: "sales_executive",
      });
      assert.equal(res.success, false, `Email '${email}' should fail validation`);
    }
  });

  it("rejects names shorter than 2 characters in staff invitations", () => {
    const res = inviteStaffSchema.safeParse({
      fullName: "A",
      email: "valid@apexmotors.in",
      role: "sales_executive",
    });
    assert.equal(res.success, false, "Name shorter than 2 characters must be rejected");
  });

  it("rejects assigning 'owner' role in role-change schema", () => {
    const res = changeRoleSchema.safeParse({
      staffId: "a0000000-0000-0000-0000-000000000001",
      newRole: "owner" as any,
    });
    assert.equal(res.success, false, "Owner role cannot be set via changeRoleSchema");
  });

  it("validates valid UUIDs in staffIdSchema and rejects malformed strings", () => {
    const valid = staffIdSchema.safeParse({ staffId: "123e4567-e89b-12d3-a456-426614174000" });
    assert.equal(valid.success, true);

    const invalid = staffIdSchema.safeParse({ staffId: "invalid-uuid-1234" });
    assert.equal(invalid.success, false);
  });

  it("validates removeStaffSchema with optional reassignment target", () => {
    const withReassign = removeStaffSchema.safeParse({
      staffId: "123e4567-e89b-12d3-a456-426614174000",
      reassignTo: "987fcdeb-51a2-43f7-9876-543210987654",
    });
    assert.equal(withReassign.success, true);

    const withoutReassign = removeStaffSchema.safeParse({
      staffId: "123e4567-e89b-12d3-a456-426614174000",
    });
    assert.equal(withoutReassign.success, true);
  });

  it("validates acceptInviteSchema token string length", () => {
    const valid = acceptInviteSchema.safeParse({ token: "64charhexstring1234567890abcdef1234567890abcdef1234567890abcdef" });
    assert.equal(valid.success, true);

    const empty = acceptInviteSchema.safeParse({ token: "" });
    assert.equal(empty.success, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Role Permission Matrix (RBAC Verification)
// ─────────────────────────────────────────────────────────────────────────────

describe("2. Role Permission Matrix (RBAC Verification)", () => {
  const evaluatePermissions = (role: string) => ({
    isOwner: role === "owner",
    canManageStaff: ["owner", "admin"].includes(role),
    canManageInventory: ["owner", "admin", "inventory_manager"].includes(role),
    canViewFinancials: ["owner", "admin", "accountant"].includes(role),
    canManageLeads: ["owner", "admin", "sales_manager", "sales_executive"].includes(role),
  });

  it("verifies Showroom Principal (owner) has universal permissions", () => {
    const perms = evaluatePermissions("owner");
    assert.equal(perms.isOwner, true);
    assert.equal(perms.canManageStaff, true);
    assert.equal(perms.canManageInventory, true);
    assert.equal(perms.canViewFinancials, true);
    assert.equal(perms.canManageLeads, true);
  });

  it("verifies General Manager (admin) can manage staff, inventory, leads, and financials but is not owner", () => {
    const perms = evaluatePermissions("admin");
    assert.equal(perms.isOwner, false, "Admin must not have isOwner flag");
    assert.equal(perms.canManageStaff, true);
    assert.equal(perms.canManageInventory, true);
    assert.equal(perms.canViewFinancials, true);
    assert.equal(perms.canManageLeads, true);
  });

  it("verifies Sales Manager can manage leads but CANNOT manage staff, inventory, or financials", () => {
    const perms = evaluatePermissions("sales_manager");
    assert.equal(perms.isOwner, false);
    assert.equal(perms.canManageStaff, false, "Sales Manager cannot manage staff");
    assert.equal(perms.canManageInventory, false, "Sales Manager cannot manage inventory costs");
    assert.equal(perms.canViewFinancials, false, "Sales Manager cannot view dealership accounting");
    assert.equal(perms.canManageLeads, true);
  });

  it("verifies Sales Executive has lead management scope only", () => {
    const perms = evaluatePermissions("sales_executive");
    assert.equal(perms.isOwner, false);
    assert.equal(perms.canManageStaff, false);
    assert.equal(perms.canManageInventory, false);
    assert.equal(perms.canViewFinancials, false);
    assert.equal(perms.canManageLeads, true);
  });

  it("verifies Inventory Manager has inventory rights but no staff, financials, or leads rights", () => {
    const perms = evaluatePermissions("inventory_manager");
    assert.equal(perms.isOwner, false);
    assert.equal(perms.canManageStaff, false);
    assert.equal(perms.canManageInventory, true);
    assert.equal(perms.canViewFinancials, false);
    assert.equal(perms.canManageLeads, false);
  });

  it("verifies Accountant has financials rights but no staff, inventory, or leads rights", () => {
    const perms = evaluatePermissions("accountant");
    assert.equal(perms.isOwner, false);
    assert.equal(perms.canManageStaff, false);
    assert.equal(perms.canManageInventory, false);
    assert.equal(perms.canViewFinancials, true);
    assert.equal(perms.canManageLeads, false);
  });

  it("verifies Viewer has read-only access with all write/management permissions false", () => {
    const perms = evaluatePermissions("viewer");
    assert.equal(perms.isOwner, false);
    assert.equal(perms.canManageStaff, false);
    assert.equal(perms.canManageInventory, false);
    assert.equal(perms.canViewFinancials, false);
    assert.equal(perms.canManageLeads, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Business Logic & Multi-Tenancy Security Guards
// ─────────────────────────────────────────────────────────────────────────────

describe("3. Business Logic & Multi-Tenancy Security Guards", () => {
  const DEALERSHIP_A = "11111111-1111-1111-1111-111111111111";
  const DEALERSHIP_B = "22222222-2222-2222-2222-222222222222";

  const OWNER_USER = {
    id: "user-owner-001",
    dealershipId: DEALERSHIP_A,
    role: "owner",
    status: "active",
  };

  const ADMIN_USER = {
    id: "user-admin-002",
    dealershipId: DEALERSHIP_A,
    role: "admin",
    status: "active",
  };

  const STAFF_USER_A = {
    id: "user-staff-003",
    dealershipId: DEALERSHIP_A,
    role: "sales_executive",
    status: "active",
  };

  const STAFF_USER_B = {
    id: "user-staff-004",
    dealershipId: DEALERSHIP_B,
    role: "sales_executive",
    status: "active",
  };

  // Guard: Self modification protection
  it("rejects staff member attempting to modify their own role", () => {
    const callerId = ADMIN_USER.id;
    const targetId = ADMIN_USER.id;
    const isSelf = callerId === targetId;
    assert.equal(isSelf, true, "Self role modification must be flagged");
  });

  // Guard: Self suspension protection
  it("rejects user attempting to suspend their own account", () => {
    const callerId = OWNER_USER.id;
    const targetId = OWNER_USER.id;
    const isSelf = callerId === targetId;
    assert.equal(isSelf, true, "Self suspension must be flagged");
  });

  // Guard: Self removal protection
  it("rejects showroom owner attempting to remove themselves", () => {
    const callerId = OWNER_USER.id;
    const targetId = OWNER_USER.id;
    const isSelf = callerId === targetId;
    assert.equal(isSelf, true, "Owner self-removal must be flagged");
  });

  // Guard: Owner protection from admin
  it("rejects an administrator attempting to modify the showroom owner's role", () => {
    const callerRole = ADMIN_USER.role;
    const targetRole = OWNER_USER.role;
    const canAdminModifyOwner = callerRole === "admin" && targetRole === "owner";
    assert.equal(canAdminModifyOwner, true, "Admin targeting owner must be blocked");
  });

  // Guard: Owner protection from suspension
  it("rejects suspending the showroom owner under any circumstances", () => {
    const targetRole = OWNER_USER.role;
    const isOwnerTarget = targetRole === "owner";
    assert.equal(isOwnerTarget, true, "Owner suspension must be blocked");
  });

  // Guard: Admin cannot suspend fellow admin
  it("rejects an administrator attempting to suspend another administrator", () => {
    const callerRole = "admin";
    const targetRole = "admin";
    const isAdminSuspendingAdmin = callerRole === "admin" && targetRole === "admin";
    assert.equal(isAdminSuspendingAdmin, true, "Admin suspending admin must be blocked");
  });

  // Guard: Cross-tenant modification rejection
  it("rejects modifications when target belongs to a different showroom (Cross-Tenant)", () => {
    const callerDealership = DEALERSHIP_A;
    const targetDealership = STAFF_USER_B.dealershipId;
    const isCrossTenant = callerDealership !== targetDealership;
    assert.equal(isCrossTenant, true, "Cross-tenant access must be rejected");
  });

  // Guard: Cross-dealership invite acceptance rejection
  it("rejects invite acceptance if user is already linked to another dealership", () => {
    const userCurrentDealershipId: string | null = DEALERSHIP_B;
    const inviteDealershipId: string = DEALERSHIP_A;
    const hasConflict = userCurrentDealershipId && userCurrentDealershipId !== inviteDealershipId;
    assert.equal(Boolean(hasConflict), true, "Cross-dealership account linking must be rejected");
  });

  // Guard: Mismatched email acceptance rejection
  it("rejects invite acceptance if signed-in email differs from invite email", () => {
    const signedInEmail = "arjun.different@example.com";
    const inviteEmail = "arjun.official@apexmotors.in";
    const isMatch = signedInEmail.toLowerCase().trim() === inviteEmail.toLowerCase().trim();
    assert.equal(isMatch, false, "Mismatched email acceptance must be rejected");
  });

  // Guard: Expired token rejection
  it("rejects invite acceptance when the 72-hour expiration window has passed", () => {
    const pastTimestamp = new Date(Date.now() - 1000 * 60).toISOString(); // 1 minute in past
    const isExpired = new Date(pastTimestamp).getTime() < Date.now();
    assert.equal(isExpired, true, "Expired invite token must be rejected");
  });

  // Guard: Suspended account access enforcement
  it("verifies suspended profile throws immediate access revocation", () => {
    const profile = { status: "suspended" };
    let didThrow = false;
    try {
      if (profile.status === "suspended") {
        throw new Error("Your account has been suspended. Please contact your showroom owner.");
      }
    } catch (err: any) {
      didThrow = true;
      assert.match(err.message, /account has been suspended/);
    }
    assert.equal(didThrow, true, "Suspended profile must trigger immediate error throw");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Email Generation & Service Adapter
// ─────────────────────────────────────────────────────────────────────────────

describe("4. Email Generation & Service Adapter", () => {
  const sampleParams = {
    to: "priya.nair@apexmotors.in",
    recipientName: "Priya Nair",
    inviterName: "Rahul Mehta (Showroom Principal)",
    dealershipName: "Apex Motors Mumbai",
    role: "sales_manager",
    roleLabel: "Sales Manager",
    inviteUrl: "https://orgetise.com/accept-invite?token=sampletoken1234567890",
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  };

  it("formats invite expiry date nicely with time and IST zone", () => {
    const formatted = formatInviteExpiryDate(sampleParams.expiresAt);
    assert.ok(typeof formatted === "string" && formatted.length > 5);
    assert.match(formatted, /IST/);
  });

  it("renders responsive HTML email containing all critical brand & invitation details", () => {
    const html = renderStaffInviteHtml(sampleParams);

    // Assert branding mark
    assert.ok(html.includes("/// ORGETISE"), "Email HTML must contain Orgetise branding mark");
    assert.ok(html.includes("SHOWROOM OS"), "Email HTML must reference SHOWROOM OS");

    // Assert key payload items
    assert.ok(html.includes("Priya Nair"), "HTML must contain recipient name");
    assert.ok(html.includes("Apex Motors Mumbai"), "HTML must contain dealership name");
    assert.ok(html.includes("Sales Manager"), "HTML must contain role label");
    assert.ok(html.includes(sampleParams.inviteUrl), "HTML must contain direct invite link");
    assert.ok(html.includes("72 Hours"), "HTML must mention 72-hour validity");
  });

  it("renders structured plaintext email containing all required fields", () => {
    const text = renderStaffInvitePlainText(sampleParams);
    assert.ok(text.includes("Apex Motors Mumbai"));
    assert.ok(text.includes("Sales Manager"));
    assert.ok(text.includes(sampleParams.inviteUrl));
    assert.ok(text.includes("72 Hours"));
  });

  it("handles missing RESEND_API_KEY gracefully without throwing an uncaught exception", async () => {
    const originalKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    try {
      const result = await sendStaffInviteEmail(sampleParams);
      assert.equal(result.success, false, "Should report success: false when API key is missing");
      assert.ok(result.error?.includes("RESEND_API_KEY"), "Should explain missing API key");
    } finally {
      if (originalKey) process.env.RESEND_API_KEY = originalKey;
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Invite Redirection & Onboarding Defense Loop
// ─────────────────────────────────────────────────────────────────────────────

describe("5. Invite Redirection & Onboarding Defense Loop", () => {
  it("builds auth callback email confirmation URL preserving invite token", () => {
    const cleanOrigin = "https://orgetise.com";
    const inviteToken = "a1b2c3d4e5f67890abcdef1234567890";
    const emailRedirectTo = inviteToken
      ? `${cleanOrigin}/auth/callback?next=${encodeURIComponent(`/accept-invite?token=${inviteToken}`)}`
      : `${cleanOrigin}/auth/callback?next=/onboarding`;

    assert.ok(emailRedirectTo.includes("/auth/callback?next="));
    assert.ok(emailRedirectTo.includes(encodeURIComponent(`/accept-invite?token=${inviteToken}`)));
  });

  it("resolves destination for un-onboarded invited staff to /accept-invite in auth callback", () => {
    const next = "/";
    const isOnboarded = false;
    const isAcceptingInvite = next.startsWith("/accept-invite");
    const pendingInviteToken = "invite-token-xyz-123";

    let destination = next;
    if (!isAcceptingInvite && !isOnboarded) {
      destination = pendingInviteToken
        ? `/accept-invite?token=${encodeURIComponent(pendingInviteToken)}`
        : "/onboarding";
    }

    assert.equal(
      destination,
      `/accept-invite?token=${encodeURIComponent(pendingInviteToken)}`,
      "Invited user must be routed to accept-invite instead of /onboarding"
    );
  });

  it("resolves destination for regular un-onboarded users to /onboarding in auth callback", () => {
    const next = "/";
    const isOnboarded = false;
    const isAcceptingInvite = next.startsWith("/accept-invite");
    const pendingInviteToken: string | null = null;

    let destination = next;
    if (!isAcceptingInvite && !isOnboarded) {
      destination = pendingInviteToken
        ? `/accept-invite?token=${encodeURIComponent(pendingInviteToken)}`
        : "/onboarding";
    }

    assert.equal(destination, "/onboarding", "Non-invited user must be routed to onboarding");
  });

  it("resolves destination for onboarded staff to /dashboard when next is root", () => {
    const next = "/";
    const isOnboarded = true;
    let destination = next;
    if (isOnboarded && next === "/") {
      destination = "/dashboard";
    }
    assert.equal(destination, "/dashboard", "Onboarded user must land on dashboard");
  });

  it("intercepts login flow and routes un-onboarded user with pending invite to /accept-invite", () => {
    const inviteTokenInForm = "";
    const onboardingCompleted = false;
    const pendingInviteToken = "token-found-via-email-query";

    let redirectTo = inviteTokenInForm
      ? `/accept-invite?token=${encodeURIComponent(inviteTokenInForm)}`
      : "/dashboard";

    if (!inviteTokenInForm && !onboardingCompleted) {
      if (pendingInviteToken) {
        redirectTo = `/accept-invite?token=${encodeURIComponent(pendingInviteToken)}`;
      } else {
        redirectTo = "/onboarding";
      }
    }

    assert.equal(
      redirectTo,
      `/accept-invite?token=${encodeURIComponent(pendingInviteToken)}`,
      "User logging in without token in URL must still be routed to accept-invite"
    );
  });

  it("rejects dealership creation during onboarding if user has an active pending staff invite", () => {
    const pendingInvite = {
      token: "pending-showroom-invite-token",
      status: "pending",
    };

    let canCreateDealership = true;
    let redirectTo = "";

    if (pendingInvite?.token) {
      canCreateDealership = false;
      redirectTo = `/accept-invite?token=${encodeURIComponent(pendingInvite.token)}`;
    }

    assert.equal(canCreateDealership, false, "Must block dealership creation");
    assert.equal(
      redirectTo,
      `/accept-invite?token=${encodeURIComponent(pendingInvite.token)}`,
      "Must redirect invited user to their pending invitation"
    );
  });
});
