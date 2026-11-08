-- ====================================================================
-- MIGRATION: 20261107000009_harden_staff_security
-- Comprehensive Security Hardening & Public Invite Resolution
--
-- Why this is required:
-- 1. The staff_invites table is protected by PostgreSQL RLS, meaning
--    only authenticated owners and admins of that dealership can read it.
-- 2. New staff members clicking an invite link are unauthenticated.
-- 3. To securely resolve their invite details WITHOUT exposing the table
--    to public enumeration/scraping, we provide a SECURITY DEFINER RPC
--    get_staff_invite_by_token(token).
-- 4. To accept an invite atomically (preventing double-accept race conditions,
--    enforcing cross-dealership isolation, and auto-cleaning accidental onboarding
--    placeholder showrooms), we provide accept_staff_invite(token).
-- 5. To prevent invited staff from ever accidentally seeing the "Create Showroom"
--    wizard if they navigate to /onboarding, get_my_pending_invite_token() intercepts
--    them and redirects them to their pending invitation.
-- 6. To allow showroom owners and admins to remove staff (unlinking dealership_id = NULL)
--    without violating PostgreSQL RLS WITH CHECK policy (which previously failed with 44000).
-- 7. To provide an atomic remove_showroom_staff(p_staff_id, p_reassign_to) RPC
--    that transfers leads and unlinks profiles inside a single database transaction.
-- ====================================================================

-- ── STEP 1: Allow public reading of basic dealership info (name, city) ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dealerships' AND policyname = 'Public can view dealership basic info'
  ) THEN
    CREATE POLICY "Public can view dealership basic info"
      ON public.dealerships FOR SELECT
      USING (true);
  END IF;
END $$;

-- ── STEP 2: Drop any broad SELECT policy on staff_invites ──
DROP POLICY IF EXISTS "Invitees can view pending invites" ON public.staff_invites;

-- Ensure staff_invites table RLS is enabled and strictly restricted
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;

-- ── STEP 3: Function to safely inspect an invite by token (Public/Anon) ──
CREATE OR REPLACE FUNCTION public.get_staff_invite_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite record;
BEGIN
  -- Strict lookup: only returns data if the exact unguessable 256-bit token matches
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

-- Grant execute to anon & authenticated users so invite links can be resolved
GRANT EXECUTE ON FUNCTION public.get_staff_invite_by_token(text) TO anon, authenticated, service_role;


-- ── STEP 4: Atomic invite acceptance RPC (Authenticated users only) ──
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
  -- Guard 1: Must be authenticated
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required. Please sign in or create an account.'
    );
  END IF;

  -- Guard 2: Fetch caller email from JWT or auth.users
  v_user_email := lower(trim(COALESCE(auth.jwt()->>'email', '')));
  IF v_user_email = '' THEN
    SELECT lower(trim(COALESCE(email, ''))) INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;
  END IF;

  -- Guard 3: Lock and inspect invite record (FOR UPDATE prevents race conditions)
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

  -- Guard 4: Validate status
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

  -- Guard 5: Validate expiration window (72 hours)
  IF v_invite.expires_at < now() THEN
    UPDATE public.staff_invites
    SET status = 'expired', updated_at = now()
    WHERE id = v_invite.id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'This invitation link has expired (72-hour window passed).'
    );
  END IF;

  -- Guard 6: Verify email matches authenticated user
  IF v_user_email <> '' AND lower(trim(v_invite.email)) <> v_user_email THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You are signed in as ' || v_user_email || ', but this invitation was sent to ' || v_invite.email || '. Please switch accounts.'
    );
  END IF;

  -- Guard 7: Prevent multi-dealership conflict (Single showroom architecture)
  SELECT dealership_id, full_name INTO v_current_dealership_id, v_final_full_name
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_current_dealership_id IS NOT NULL AND v_current_dealership_id <> v_invite.dealership_id THEN
    -- Check if current showroom is an empty accidental placeholder (0 vehicles, 0 leads, <= 1 staff)
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

  -- STEP A: Update profiles table with atomic role & showroom link
  UPDATE public.profiles
  SET
    dealership_id = v_invite.dealership_id,
    role = v_invite.intended_role,
    status = 'active',
    full_name = COALESCE(NULLIF(v_final_full_name, ''), v_invite.full_name, 'Showroom Staff'),
    onboarding_completed = true,
    updated_at = now()
  WHERE id = v_user_id;

  -- STEP B: Mark staff_invites row as accepted
  UPDATE public.staff_invites
  SET
    status = 'accepted',
    accepted_at = now(),
    accepted_by = v_user_id,
    updated_at = now()
  WHERE id = v_invite.id;

  -- STEP C: Clean up orphan placeholder showroom if applicable
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

-- Grant execute to authenticated users for accepting invites
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text) TO authenticated, service_role;


-- ── STEP 5: Helper function for authenticated users on /onboarding ──
CREATE OR REPLACE FUNCTION public.get_my_pending_invite_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_email text;
  v_token text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  v_email := lower(trim(COALESCE(auth.jwt()->>'email', '')));
  IF v_email = '' THEN
    SELECT lower(trim(COALESCE(email, ''))) INTO v_email
    FROM auth.users
    WHERE id = v_user_id;
  END IF;

  IF v_email = '' THEN
    RETURN NULL;
  END IF;

  SELECT token INTO v_token
  FROM public.staff_invites
  WHERE lower(trim(email)) = v_email
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_pending_invite_token() TO authenticated, service_role;


-- ── STEP 6: Fix profiles RLS to allow unlinking staff (dealership_id = NULL) ──
-- The previous WITH CHECK required dealership_id = get_my_dealership_id(), which evaluated
-- to NULL = uuid (false) whenever an owner or admin removed a staff member by clearing dealership_id.
-- This caused PostgreSQL error 44000: new row violates row-level security policy for table "profiles".

DROP POLICY IF EXISTS "Owners can manage dealership staff profiles" ON public.profiles;
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

DROP POLICY IF EXISTS "Admins can manage non-owner staff profiles" ON public.profiles;
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


-- ── STEP 7: Atomic staff removal RPC (SECURITY DEFINER) ──
-- Executes lead reassignment, invite revocation, and profile unlinking atomically.
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
  -- Caller must be authenticated
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Caller must be owner or admin
  SELECT dealership_id, role INTO v_caller_dealership_id, v_caller_role
  FROM public.profiles
  WHERE id = v_caller_id;

  IF v_caller_dealership_id IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only showroom owners and administrators can remove staff members.');
  END IF;

  -- Cannot remove yourself
  IF p_staff_id = v_caller_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot remove yourself from your own dealership.');
  END IF;

  -- Target must exist and belong to the same dealership
  SELECT dealership_id, role, full_name INTO v_target_dealership_id, v_target_role, v_target_name
  FROM public.profiles
  WHERE id = p_staff_id;

  IF v_target_dealership_id IS NULL OR v_target_dealership_id <> v_caller_dealership_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Staff member does not belong to your showroom.');
  END IF;

  -- Cannot remove showroom principal (owner)
  IF v_target_role = 'owner' THEN
    RETURN jsonb_build_object('success', false, 'error', 'The showroom principal cannot be removed.');
  END IF;

  -- Admin cannot remove fellow admin
  IF v_caller_role = 'admin' AND v_target_role = 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Administrators cannot remove fellow administrators.');
  END IF;

  -- Reassign open leads if requested
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

  -- Revoke any pending invites created by this staff member
  UPDATE public.staff_invites
  SET status = 'revoked', updated_at = now()
  WHERE invited_by = p_staff_id AND dealership_id = v_caller_dealership_id AND status = 'pending';

  -- Unlink the staff profile from showroom
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

GRANT EXECUTE ON FUNCTION public.remove_showroom_staff(uuid, uuid) TO authenticated, service_role;
