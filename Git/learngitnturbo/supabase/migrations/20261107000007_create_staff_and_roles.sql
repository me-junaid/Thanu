-- ====================================================================
-- MIGRATION: 20261107000007_create_staff_and_roles
-- Phase 1 of Staff & Roles module implementation.
--
-- This migration:
--   Step 1 — Extends public.profiles with staff management columns
--   Step 2 — Creates public.staff_invites table with indexes
--   Step 3 — Updates public.profiles RLS to allow owner/admin management
--   Step 4 — Creates public.staff_invites RLS policies
--   Step 5 — Adds can_manage_staff() helper function
--             (get_my_role() already exists from migration 000006)
-- ====================================================================


-- ════════════════════════════════════════════════════════════════════
-- STEP 1: Extend public.profiles for Staff & Roles module
-- ════════════════════════════════════════════════════════════════════
-- Note: id, dealership_id, full_name, role, onboarding_completed,
--       created_at, updated_at already exist from schema_full.sql.
--       We ADD only the new staff-management columns below.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone          text,
  ADD COLUMN IF NOT EXISTS avatar_url     text,
  ADD COLUMN IF NOT EXISTS department     text,
  ADD COLUMN IF NOT EXISTS joining_date   date,
  ADD COLUMN IF NOT EXISTS status         text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- Constrain status to known values via a check constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'suspended', 'pending_invite'));

-- Ensure role column covers all 7 Orgetise roles via check constraint.
-- (role column is text; we validate values here rather than creating
--  a new enum to avoid migration complexity on existing rows.)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'owner',
    'admin',
    'sales_manager',
    'sales_executive',
    'inventory_manager',
    'accountant',
    'viewer'
  ));

-- Index: fast lookup of suspended staff members per dealership
CREATE INDEX IF NOT EXISTS profiles_dealership_status_idx
  ON public.profiles(dealership_id, status);

-- Index: fast lookup by role per dealership (permission checks)
CREATE INDEX IF NOT EXISTS profiles_dealership_role_idx
  ON public.profiles(dealership_id, role);


-- ════════════════════════════════════════════════════════════════════
-- STEP 2: Create public.staff_invites table
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.staff_invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant isolation: every invite belongs to exactly one showroom
  dealership_id   uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,

  -- Who sent the invite (must be owner or admin — enforced at application layer & RLS)
  invited_by      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Who is being invited
  email           text NOT NULL,
  full_name       text,                        -- Pre-filled name shown in the invite email
  intended_role   text NOT NULL,               -- Role to be assigned on successful acceptance

  -- Invite lifecycle token
  token           text NOT NULL UNIQUE,        -- crypto.randomBytes(32).toString('hex') — 256-bit entropy
  status          text NOT NULL DEFAULT 'pending',
  -- status values: 'pending' | 'accepted' | 'revoked' | 'expired'

  -- Timing
  expires_at      timestamptz NOT NULL,        -- Set to now() + interval '72 hours' at insert time
  accepted_at     timestamptz,                 -- Populated when the invitee accepts
  accepted_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Validate intended_role to the same 6 non-owner roles that can be invited
-- (the owner role is established at dealership creation, never via invite)
ALTER TABLE public.staff_invites
  DROP CONSTRAINT IF EXISTS staff_invites_intended_role_check;

ALTER TABLE public.staff_invites
  ADD CONSTRAINT staff_invites_intended_role_check
  CHECK (intended_role IN (
    'admin',
    'sales_manager',
    'sales_executive',
    'inventory_manager',
    'accountant',
    'viewer'
  ));

-- Validate status values
ALTER TABLE public.staff_invites
  DROP CONSTRAINT IF EXISTS staff_invites_status_check;

ALTER TABLE public.staff_invites
  ADD CONSTRAINT staff_invites_status_check
  CHECK (status IN ('pending', 'accepted', 'revoked', 'expired'));

-- ── Indexes ──────────────────────────────────────────────────────────

-- Fast token lookup during invite acceptance (only on pending invites)
CREATE UNIQUE INDEX IF NOT EXISTS staff_invites_token_idx
  ON public.staff_invites(token)
  WHERE status = 'pending';

-- Dealership invite management view (list all invites for a showroom)
CREATE INDEX IF NOT EXISTS staff_invites_dealership_idx
  ON public.staff_invites(dealership_id, status);

-- Prevent duplicate pending invites for the same email at the same dealership.
-- A new invite can only be sent after the old one is revoked/accepted/expired.
CREATE UNIQUE INDEX IF NOT EXISTS staff_invites_unique_pending_email
  ON public.staff_invites(dealership_id, email)
  WHERE status = 'pending';

-- ── Auto-updated timestamp trigger ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_staff_invites_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS staff_invites_updated_at_trigger ON public.staff_invites;
CREATE TRIGGER staff_invites_updated_at_trigger
  BEFORE UPDATE ON public.staff_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_staff_invites_updated_at();


-- ════════════════════════════════════════════════════════════════════
-- STEP 3: Update public.profiles RLS policies
-- ════════════════════════════════════════════════════════════════════
-- The original "Users can update own profile" policy (from schema_full.sql)
-- only allows a user to update their own row. We need to also allow:
--   - Owners to update ANY profile in their dealership
--   - Admins to update non-owner profiles in their dealership
-- We drop the old policy and replace it with two focused policies.

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Policy A: Any authenticated user can update their own profile row
-- (personal info: full_name, phone, avatar_url, department)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy B: Owners can update ANY staff member's profile in their dealership
-- (role changes, suspensions, reactivations, removals of dealership_id)
-- Guard: cannot modify another owner's profile (enforced by application layer too)
CREATE POLICY "Owners can manage dealership staff profiles"
  ON public.profiles FOR UPDATE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
    AND id != auth.uid()
  )
  WITH CHECK (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
  );

-- Policy C: Admins can update non-owner staff profiles in their dealership
-- Guards:
--   - Calling user must have role = 'admin'
--   - Target profile must NOT have role = 'owner' (admins cannot touch owner rows)
--   - Admins cannot modify themselves via this policy (they use Policy A)
CREATE POLICY "Admins can manage non-owner staff profiles"
  ON public.profiles FOR UPDATE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.get_my_role() = 'admin'
    AND role != 'owner'
    AND id != auth.uid()
  )
  WITH CHECK (
    dealership_id = public.get_my_dealership_id()
    AND public.get_my_role() = 'admin'
    AND role != 'owner'
  );


-- ════════════════════════════════════════════════════════════════════
-- STEP 4: Row Level Security for public.staff_invites
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;

-- SELECT: Only owners and admins of the same dealership can read invite records
CREATE POLICY "Owners and admins can view their invites"
  ON public.staff_invites FOR SELECT
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.get_my_role() IN ('owner', 'admin')
  );

-- INSERT: Only owners and admins can create invites for their dealership
CREATE POLICY "Owners and admins can create invites"
  ON public.staff_invites FOR INSERT
  WITH CHECK (
    dealership_id = public.get_my_dealership_id()
    AND public.get_my_role() IN ('owner', 'admin')
  );

-- UPDATE: Only owners and admins can update (revoke) invites for their dealership
CREATE POLICY "Owners and admins can revoke invites"
  ON public.staff_invites FOR UPDATE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.get_my_role() IN ('owner', 'admin')
  )
  WITH CHECK (
    dealership_id = public.get_my_dealership_id()
    AND public.get_my_role() IN ('owner', 'admin')
  );

-- DELETE: No one can hard-delete invite records (soft-delete via status = 'revoked')
-- (No DELETE policy = DELETE is blocked for all users by default under RLS)


-- ════════════════════════════════════════════════════════════════════
-- STEP 5: Helper function — can_manage_staff()
-- ════════════════════════════════════════════════════════════════════
-- Note: get_my_role() already exists from migration 20261105000006.
-- We add can_manage_staff() as a convenience boolean used in Server Actions
-- and additional RLS policies across the platform.

CREATE OR REPLACE FUNCTION public.can_manage_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
  );
$$;

-- ── Verification queries (run manually in Supabase SQL editor to confirm) ──
-- SELECT column_name, data_type, column_default, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'profiles'
--   ORDER BY ordinal_position;
--
-- SELECT tablename, policyname, cmd, qual
--   FROM pg_policies
--   WHERE tablename IN ('profiles', 'staff_invites')
--   ORDER BY tablename, policyname;
--
-- SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public'
--   AND routine_name IN ('get_my_role', 'can_manage_staff', 'get_my_dealership_id', 'is_dealership_owner');

