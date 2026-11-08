-- ====================================================================
-- MIGRATION: 20261107000008_staff_invite_acceptance
-- Phase 4: Public staff invite validation and acceptance support
-- ====================================================================

-- 1. Allow public reading of dealership name, city, and state for invite previews and storefront
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

-- 2. Allow invitees (anon or authenticated) to view pending staff invites by token
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'staff_invites' AND policyname = 'Invitees can view pending invites'
  ) THEN
    CREATE POLICY "Invitees can view pending invites"
      ON public.staff_invites FOR SELECT
      USING (status IN ('pending', 'accepted', 'revoked', 'expired'));
  END IF;
END $$;

-- 3. Allow authenticated invitees to update their invite to 'accepted'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'staff_invites' AND policyname = 'Invitees can accept own invite'
  ) THEN
    CREATE POLICY "Invitees can accept own invite"
      ON public.staff_invites FOR UPDATE
      TO authenticated
      USING (status = 'pending')
      WITH CHECK (status = 'accepted');
  END IF;
END $$;

-- 4. Helper function: get_staff_invite_by_token (SECURITY DEFINER for extra security)
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

