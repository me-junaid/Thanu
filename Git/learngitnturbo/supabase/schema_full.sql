-- ====================================================================
-- ORGETISE SAAS: FULL DATABASE SETUP (Option A Architecture)
-- Run this entire script in your Supabase SQL Editor
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 1. CLEANUP (Drop in reverse dependency order if any remnants exist)
-- ────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_dealership_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_dealership_owner() CASCADE;

DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.dealerships CASCADE;

-- ────────────────────────────────────────────────────────────────────
-- 2. CREATE TABLE: dealerships (Tenant / Single Showroom)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE public.dealerships (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,                        -- e.g. "Apex Motors"
  slug         text NOT NULL UNIQUE,                 -- e.g. "apexmotors" (subdomain)
  address      text,
  city         text,
  state        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz
);

-- Index for subdomain lookups
CREATE INDEX dealerships_slug_idx ON public.dealerships(slug);

-- ────────────────────────────────────────────────────────────────────
-- 3. CREATE TABLE: profiles (User Profile linked to Dealership)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dealership_id         uuid REFERENCES public.dealerships(id) ON DELETE SET NULL,
  full_name             text,
  role                  text NOT NULL DEFAULT 'owner',  -- owner | sales_manager | sales_executive | accountant | viewer
  onboarding_completed  boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz
);

-- Index for staff queries by dealership
CREATE INDEX profiles_dealership_idx ON public.profiles(dealership_id);

-- ────────────────────────────────────────────────────────────────────
-- 4. HELPER FUNCTIONS (SECURITY DEFINER to avoid RLS recursion)
-- ────────────────────────────────────────────────────────────────────

-- Returns the dealership_id of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_my_dealership_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dealership_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Returns true if the currently authenticated user is an owner
CREATE OR REPLACE FUNCTION public.is_dealership_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'owner'
  );
$$;

-- ────────────────────────────────────────────────────────────────────
-- 5. TRIGGER: Auto-create Profile Row on New Auth Signup
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth.users into profiles
INSERT INTO public.profiles (id, full_name, onboarding_completed)
SELECT
  id,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ),
  COALESCE((raw_user_meta_data->>'onboarding_completed')::boolean, false)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS) POLICIES — public.dealerships
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their new dealership during onboarding
CREATE POLICY "Authenticated users can create a dealership"
  ON public.dealerships FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Members of a dealership can view their showroom
CREATE POLICY "Dealership members can view their dealership"
  ON public.dealerships FOR SELECT
  USING (
    id = public.get_my_dealership_id()
  );

-- Only the owner can update their showroom info
CREATE POLICY "Owner can update their dealership"
  ON public.dealerships FOR UPDATE
  USING (
    id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
  );

-- ────────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS) POLICIES — public.profiles
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile, or peers in the same showroom
CREATE POLICY "Dealership members can view staff profiles"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR (
      dealership_id IS NOT NULL 
      AND dealership_id = public.get_my_dealership_id()
    )
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can update their own profile (personal info only)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Owners can manage any staff profile in their dealership (including removing / unlinking staff)
CREATE POLICY "Owners can manage dealership staff profiles"
  ON public.profiles FOR UPDATE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
    AND id != auth.uid()
  )
  WITH CHECK (
    (dealership_id IS NULL OR dealership_id = public.get_my_dealership_id())
    AND public.is_dealership_owner() = true
  );

-- Admins can update non-owner staff profiles in their dealership (including removing / unlinking staff)
CREATE POLICY "Admins can manage non-owner staff profiles"
  ON public.profiles FOR UPDATE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.get_my_role() = 'admin'
    AND role != 'owner'
    AND id != auth.uid()
  )
  WITH CHECK (
    (dealership_id IS NULL OR dealership_id = public.get_my_dealership_id())
    AND public.get_my_role() = 'admin'
    AND role != 'owner'
  );


-- ────────────────────────────────────────────────────────────────────
-- 8. STAFF & ROLES — profiles column extensions
--    (Applied via migration 20261107000007_create_staff_and_roles)
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone          text,
  ADD COLUMN IF NOT EXISTS avatar_url     text,
  ADD COLUMN IF NOT EXISTS department     text,
  ADD COLUMN IF NOT EXISTS joining_date   date,
  ADD COLUMN IF NOT EXISTS status         text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'suspended', 'pending_invite'));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'owner', 'admin', 'sales_manager', 'sales_executive',
    'inventory_manager', 'accountant', 'viewer'
  ));

CREATE INDEX IF NOT EXISTS profiles_dealership_status_idx
  ON public.profiles(dealership_id, status);

CREATE INDEX IF NOT EXISTS profiles_dealership_role_idx
  ON public.profiles(dealership_id, role);

-- ────────────────────────────────────────────────────────────────────
-- 9. STAFF & ROLES — staff_invites table
--    (Applied via migration 20261107000007_create_staff_and_roles)
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.staff_invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id   uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  invited_by      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email           text NOT NULL,
  full_name       text,
  intended_role   text NOT NULL,
  token           text NOT NULL UNIQUE,
  status          text NOT NULL DEFAULT 'pending',
  expires_at      timestamptz NOT NULL,
  accepted_at     timestamptz,
  accepted_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT staff_invites_intended_role_check
    CHECK (intended_role IN ('admin','sales_manager','sales_executive','inventory_manager','accountant','viewer')),
  CONSTRAINT staff_invites_status_check
    CHECK (status IN ('pending','accepted','revoked','expired'))
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_invites_token_idx
  ON public.staff_invites(token) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS staff_invites_dealership_idx
  ON public.staff_invites(dealership_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS staff_invites_unique_pending_email
  ON public.staff_invites(dealership_id, email) WHERE status = 'pending';

ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins can view their invites"
  ON public.staff_invites FOR SELECT
  USING (dealership_id = public.get_my_dealership_id() AND public.get_my_role() IN ('owner','admin'));

CREATE POLICY "Owners and admins can create invites"
  ON public.staff_invites FOR INSERT
  WITH CHECK (dealership_id = public.get_my_dealership_id() AND public.get_my_role() IN ('owner','admin'));

CREATE POLICY "Owners and admins can revoke invites"
  ON public.staff_invites FOR UPDATE
  USING (dealership_id = public.get_my_dealership_id() AND public.get_my_role() IN ('owner','admin'))
  WITH CHECK (dealership_id = public.get_my_dealership_id() AND public.get_my_role() IN ('owner','admin'));

-- ────────────────────────────────────────────────────────────────────
-- 10. STAFF & ROLES — Helper function: can_manage_staff()
-- ────────────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────────────
-- 11. STAFF & ROLES — Invite RPC functions
-- ────────────────────────────────────────────────────────────────────

-- Safely inspect an invite token without exposing table-wide access
CREATE OR REPLACE FUNCTION public.get_staff_invite_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite record;
BEGIN
  SELECT 
    i.id,
    i.email,
    i.full_name,
    i.intended_role,
    i.status,
    i.expires_at,
    d.id AS dealership_id,
    d.name AS dealership_name,
    d.city AS dealership_city
  INTO v_invite
  FROM public.staff_invites i
  JOIN public.dealerships d ON d.id = i.dealership_id
  WHERE i.token = p_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_invite.id,
    'email', v_invite.email,
    'fullName', v_invite.full_name,
    'intendedRole', v_invite.intended_role,
    'status', v_invite.status,
    'expiresAt', v_invite.expires_at,
    'dealershipId', v_invite.dealership_id,
    'dealershipName', v_invite.dealership_name,
    'dealershipCity', v_invite.dealership_city
  );
END;
$$;

-- Atomic invite acceptance with row locking & multi-tenant isolation
CREATE OR REPLACE FUNCTION public.accept_staff_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_invite record;
  v_current_dealership_id uuid;
  v_final_full_name text;
  v_vehicle_count int := 0;
  v_lead_count int := 0;
  v_staff_count int := 0;
  v_is_empty_placeholder boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required. Please sign in or create an account.'
    );
  END IF;

  v_user_email := lower(trim(COALESCE(auth.jwt()->>'email', '')));

  SELECT 
    id, dealership_id, email, full_name, intended_role, status, expires_at
  INTO v_invite
  FROM public.staff_invites
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invitation not found or invalid token.'
    );
  END IF;

  IF v_invite.status = 'revoked' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This invitation has been revoked by the showroom manager.'
    );
  END IF;

  IF v_invite.status = 'accepted' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This invitation has already been accepted.'
    );
  END IF;

  IF v_invite.status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This invitation is not in a valid pending state.'
    );
  END IF;

  IF v_invite.expires_at < now() THEN
    UPDATE public.staff_invites
    SET status = 'expired', updated_at = now()
    WHERE id = v_invite.id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'This invitation link has expired (72-hour window passed).'
    );
  END IF;

  IF v_user_email <> '' AND lower(trim(v_invite.email)) <> v_user_email THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You are signed in as ' || v_user_email || ', but this invitation was sent to ' || v_invite.email || '. Please switch accounts.'
    );
  END IF;

  SELECT dealership_id, full_name INTO v_current_dealership_id, v_final_full_name
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_current_dealership_id IS NOT NULL AND v_current_dealership_id <> v_invite.dealership_id THEN
    SELECT count(*) INTO v_vehicle_count FROM public.vehicles WHERE dealership_id = v_current_dealership_id;
    SELECT count(*) INTO v_lead_count FROM public.leads WHERE dealership_id = v_current_dealership_id;
    SELECT count(*) INTO v_staff_count FROM public.profiles WHERE dealership_id = v_current_dealership_id;

    IF v_vehicle_count = 0 AND v_lead_count = 0 AND v_staff_count <= 1 THEN
      v_is_empty_placeholder := true;
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Your account is already associated with an active showroom. Orgetise staff accounts cannot belong to multiple dealerships simultaneously.'
      );
    END IF;
  END IF;

  UPDATE public.profiles
  SET
    dealership_id = v_invite.dealership_id,
    role = v_invite.intended_role,
    status = 'active',
    full_name = COALESCE(NULLIF(v_final_full_name, ''), v_invite.full_name, 'Showroom Staff'),
    onboarding_completed = true,
    updated_at = now()
  WHERE id = v_user_id;

  UPDATE public.staff_invites
  SET
    status = 'accepted',
    accepted_at = now(),
    accepted_by = v_user_id,
    updated_at = now()
  WHERE id = v_invite.id;

  IF v_is_empty_placeholder AND v_current_dealership_id IS NOT NULL THEN
    DELETE FROM public.dealerships WHERE id = v_current_dealership_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'dealership_id', v_invite.dealership_id,
    'role', v_invite.intended_role
  );
END;
$$;

-- Helper function for authenticated users on /onboarding
CREATE OR REPLACE FUNCTION public.get_my_pending_invite_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT token FROM public.staff_invites
  WHERE lower(trim(email)) = lower(trim(COALESCE(auth.jwt()->>'email', '')))
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Atomic staff removal RPC (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.remove_showroom_staff(
  p_staff_id uuid,
  p_reassign_to uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid := auth.uid();
  v_caller_dealership_id uuid;
  v_caller_role text;
  v_target_dealership_id uuid;
  v_target_role text;
  v_target_name text;
  v_reassign_dealership_id uuid;
BEGIN
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  SELECT dealership_id, role INTO v_caller_dealership_id, v_caller_role
  FROM public.profiles
  WHERE id = v_caller_id;

  IF v_caller_dealership_id IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only showroom owners and administrators can remove staff members.');
  END IF;

  IF p_staff_id = v_caller_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot remove yourself from your own dealership.');
  END IF;

  SELECT dealership_id, role, full_name INTO v_target_dealership_id, v_target_role, v_target_name
  FROM public.profiles
  WHERE id = p_staff_id;

  IF v_target_dealership_id IS NULL OR v_target_dealership_id <> v_caller_dealership_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Staff member does not belong to your showroom.');
  END IF;

  IF v_target_role = 'owner' THEN
    RETURN jsonb_build_object('success', false, 'error', 'The showroom principal cannot be removed.');
  END IF;

  IF v_caller_role = 'admin' AND v_target_role = 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Administrators cannot remove fellow administrators.');
  END IF;

  IF p_reassign_to IS NOT NULL THEN
    IF p_reassign_to = p_staff_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'Cannot reassign leads to the staff member being removed.');
    END IF;

    SELECT dealership_id INTO v_reassign_dealership_id
    FROM public.profiles
    WHERE id = p_reassign_to;

    IF v_reassign_dealership_id IS NULL OR v_reassign_dealership_id <> v_caller_dealership_id THEN
      RETURN jsonb_build_object('success', false, 'error', 'Selected reassignment target does not belong to this showroom.');
    END IF;

    UPDATE public.leads
    SET assigned_to = p_reassign_to, updated_at = now()
    WHERE assigned_to = p_staff_id AND dealership_id = v_caller_dealership_id;
  END IF;

  UPDATE public.staff_invites
  SET status = 'revoked', updated_at = now()
  WHERE invited_by = p_staff_id AND dealership_id = v_caller_dealership_id AND status = 'pending';

  UPDATE public.profiles
  SET
    dealership_id = NULL,
    role = 'viewer',
    status = 'active',
    updated_at = now()
  WHERE id = p_staff_id;

  RETURN jsonb_build_object(
    'success', true,
    'staffName', COALESCE(v_target_name, 'Staff Member')
  );
END;
$$;

-- ==============================================================================
-- COMPOSITE MULTI-TENANT PERFORMANCE INDEXES (SUB-50MS QUERY OPTIMIZATION)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_dealership_status
  ON public.leads(dealership_id, status);

CREATE INDEX IF NOT EXISTS idx_leads_dealership_created_at
  ON public.leads(dealership_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_dealership_assigned_to
  ON public.leads(dealership_id, assigned_to)
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_dealership_status
  ON public.vehicles(dealership_id, status);

CREATE INDEX IF NOT EXISTS idx_vehicles_dealership_created_at
  ON public.vehicles(dealership_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_test_drives_dealership_status
  ON public.test_drives(dealership_id, status);

CREATE INDEX IF NOT EXISTS idx_test_drives_dealership_scheduled_at
  ON public.test_drives(dealership_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_deals_dealership_status
  ON public.sales_deals(dealership_id, status);

CREATE INDEX IF NOT EXISTS idx_sales_deals_dealership_deal_date
  ON public.sales_deals(dealership_id, deal_date DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_dealership_created_at
  ON public.vehicle_expenses(dealership_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_dealership_status
  ON public.profiles(dealership_id, status);

CREATE INDEX IF NOT EXISTS idx_staff_invites_dealership_status
  ON public.staff_invites(dealership_id, status);

