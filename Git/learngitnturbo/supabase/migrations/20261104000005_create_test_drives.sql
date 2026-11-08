-- ====================================================================
-- MIGRATION: 20261104000005_create_test_drives
-- Creates test_drives table with digital gate pass, vehicle check-in,
-- RLS policies, and seed demonstration data for pre-owned dealerships.
-- ====================================================================

-- 1. Types & Enums (Safe creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_drive_status') THEN
    CREATE TYPE test_drive_status AS ENUM (
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_level') THEN
    CREATE TYPE fuel_level AS ENUM (
      'reserve',
      'quarter',
      'half',
      'three_quarters',
      'full'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_interest_tier') THEN
    CREATE TYPE customer_interest_tier AS ENUM (
      'hot',
      'warm',
      'cold'
    );
  END IF;
END $$;

-- 2. Test Drives Table
CREATE TABLE IF NOT EXISTS public.test_drives (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id          uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  
  -- Relational Links
  vehicle_id             uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  lead_id                uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  assigned_to            uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Sales Executive
  
  -- Customer Information
  customer_name          text NOT NULL,
  customer_phone         text NOT NULL,
  customer_email         text,
  driving_license_number text,
  driving_license_url    text,
  
  -- Scheduling & Status
  status                 test_drive_status NOT NULL DEFAULT 'scheduled',
  scheduled_at           timestamptz NOT NULL,
  duration_minutes       integer NOT NULL DEFAULT 30,
  
  -- Vehicle Gate Pass & Rollout (Checkout)
  started_at             timestamptz,
  start_odometer_km      integer,
  start_fuel_level       fuel_level DEFAULT 'half',
  pre_drive_notes        text,
  
  -- Vehicle Return & Inspection (Check-in)
  completed_at           timestamptz,
  end_odometer_km        integer,
  end_fuel_level         fuel_level,
  post_drive_notes       text,
  
  -- Post-Drive Evaluation & Conversion
  customer_rating        smallint CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback      text,
  interest_tier          customer_interest_tier,
  next_step_action       text,
  
  -- Cancellation / Discard
  cancellation_reason    text,
  
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS test_drives_dealership_idx ON public.test_drives(dealership_id);
CREATE INDEX IF NOT EXISTS test_drives_vehicle_idx ON public.test_drives(vehicle_id);
CREATE INDEX IF NOT EXISTS test_drives_lead_idx ON public.test_drives(lead_id);
CREATE INDEX IF NOT EXISTS test_drives_schedule_idx ON public.test_drives(dealership_id, scheduled_at);
CREATE INDEX IF NOT EXISTS test_drives_status_idx ON public.test_drives(dealership_id, status);
CREATE INDEX IF NOT EXISTS test_drives_assigned_idx ON public.test_drives(dealership_id, assigned_to);

-- 3. Row Level Security
ALTER TABLE public.test_drives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view dealership test drives" ON public.test_drives;
CREATE POLICY "Members can view dealership test drives"
  ON public.test_drives FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Members can create test drives" ON public.test_drives;
CREATE POLICY "Members can create test drives"
  ON public.test_drives FOR INSERT
  WITH CHECK (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Members can update test drives" ON public.test_drives;
CREATE POLICY "Members can update test drives"
  ON public.test_drives FOR UPDATE
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Owners can delete test drives" ON public.test_drives;
CREATE POLICY "Owners can delete test drives"
  ON public.test_drives FOR DELETE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
  );

-- 4. Seed Demonstration Test Drives for Existing Showroom
DO $$
DECLARE
  v_dealership_id uuid;
  v_owner_id uuid;
  v_porsche_id uuid;
  v_bmw_id uuid;
  v_amg_id uuid;
  v_audi_id uuid;
  v_defender_id uuid;
  v_porsche_lead_id uuid;
  v_bmw_lead_id uuid;
  v_amg_lead_id uuid;
  v_audi_lead_id uuid;
BEGIN
  SELECT id INTO v_dealership_id FROM public.dealerships LIMIT 1;
  SELECT id INTO v_owner_id FROM public.profiles WHERE dealership_id = v_dealership_id LIMIT 1;
  
  SELECT id INTO v_porsche_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Porsche' LIMIT 1;
  SELECT id INTO v_bmw_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'BMW' LIMIT 1;
  SELECT id INTO v_amg_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Mercedes-AMG' LIMIT 1;
  SELECT id INTO v_audi_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Audi' LIMIT 1;
  SELECT id INTO v_defender_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Land Rover' LIMIT 1;

  SELECT id INTO v_porsche_lead_id FROM public.leads WHERE dealership_id = v_dealership_id AND customer_name ILIKE '%Vikram%' LIMIT 1;
  SELECT id INTO v_bmw_lead_id FROM public.leads WHERE dealership_id = v_dealership_id AND customer_name ILIKE '%Rohan%' LIMIT 1;
  SELECT id INTO v_amg_lead_id FROM public.leads WHERE dealership_id = v_dealership_id AND customer_name ILIKE '%Ananya%' LIMIT 1;
  SELECT id INTO v_audi_lead_id FROM public.leads WHERE dealership_id = v_dealership_id AND customer_name ILIKE '%Karan%' LIMIT 1;

  IF v_dealership_id IS NOT NULL AND v_porsche_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.test_drives WHERE dealership_id = v_dealership_id) THEN
      
      -- 1. Drive Scheduled Today: Porsche 911 Carrera S
      INSERT INTO public.test_drives (
        dealership_id, vehicle_id, lead_id, assigned_to,
        customer_name, customer_phone, customer_email, driving_license_number,
        status, scheduled_at, duration_minutes,
        pre_drive_notes
      ) VALUES (
        v_dealership_id, v_porsche_id, v_porsche_lead_id, v_owner_id,
        'Vikram Malhotra', '+91 98840 12345', 'vikram.malhotra@techcorp.in', 'KA01 20180004921',
        'scheduled', ((CURRENT_DATE::text || ' 16:30:00+05:30')::timestamptz), 45,
        'Prospect interested in Sports Exhaust & PDK launch feel. Requested expressway route.'
      );

      -- 2. Drive In Progress (Active on Road with Gate Pass): BMW M4 Competition
      INSERT INTO public.test_drives (
        dealership_id, vehicle_id, lead_id, assigned_to,
        customer_name, customer_phone, customer_email, driving_license_number,
        status, scheduled_at, duration_minutes,
        started_at, start_odometer_km, start_fuel_level, pre_drive_notes
      ) VALUES (
        v_dealership_id, v_bmw_id, v_bmw_lead_id, v_owner_id,
        'Rohan Singhal', '+91 99001 54321', 'rohan@singhalgroup.com', 'DL03 20150098412',
        'in_progress', ((CURRENT_DATE::text || ' 14:00:00+05:30')::timestamptz), 40,
        now() - interval '22 minutes', 6100, 'three_quarters',
        'Digital gate pass issued. Accompanied by Sales Manager. Testing M Carbon bucket comfort.'
      );

      -- 3. Drive Confirmed Tomorrow: Mercedes-AMG GT 63 S
      INSERT INTO public.test_drives (
        dealership_id, vehicle_id, lead_id, assigned_to,
        customer_name, customer_phone, customer_email, driving_license_number,
        status, scheduled_at, duration_minutes,
        pre_drive_notes
      ) VALUES (
        v_dealership_id, v_amg_id, v_amg_lead_id, v_owner_id,
        'Ananya Deshmukh', '+91 98450 67890', 'ananya.deshmukh@gmail.com', 'MH02 20190038192',
        'confirmed', (((CURRENT_DATE + interval '1 day')::date::text || ' 11:30:00+05:30')::timestamptz), 30,
        'DL verified over WhatsApp. Car scheduled for detail wipe and tire pressure check.'
      );

      -- 4. Drive Completed Earlier Today: Audi RS6 Avant
      INSERT INTO public.test_drives (
        dealership_id, vehicle_id, lead_id, assigned_to,
        customer_name, customer_phone, customer_email, driving_license_number,
        status, scheduled_at, duration_minutes,
        started_at, start_odometer_km, start_fuel_level,
        completed_at, end_odometer_km, end_fuel_level,
        customer_rating, interest_tier, customer_feedback, next_step_action
      ) VALUES (
        v_dealership_id, v_audi_id, v_audi_lead_id, v_owner_id,
        'Karan Oberoi', '+91 98110 99887', 'karan@oberoienterprises.in', 'DL04 20160019283',
        'completed', ((CURRENT_DATE::text || ' 11:00:00+05:30')::timestamptz), 45,
        ((CURRENT_DATE::text || ' 11:05:00+05:30')::timestamptz), 14800, 'half',
        ((CURRENT_DATE::text || ' 11:50:00+05:30')::timestamptz), 14818, 'half',
        5, 'hot', 'Loved the exhaust note and air suspension ride. Ready to finalize token deposit.', 'token_deposit'
      );

      -- 5. Drive Completed Earlier Today: Land Rover Defender 110
      INSERT INTO public.test_drives (
        dealership_id, vehicle_id, lead_id, assigned_to,
        customer_name, customer_phone, customer_email, driving_license_number,
        status, scheduled_at, duration_minutes,
        started_at, start_odometer_km, start_fuel_level,
        completed_at, end_odometer_km, end_fuel_level,
        customer_rating, interest_tier, customer_feedback, next_step_action
      ) VALUES (
        v_dealership_id, v_defender_id, NULL, v_owner_id,
        'Dr. Siddharth Verma', '+91 97400 33221', 'siddharth.v@apollohospitals.org', 'KA05 20120008472',
        'completed', ((CURRENT_DATE::text || ' 15:00:00+05:30')::timestamptz), 30,
        ((CURRENT_DATE::text || ' 15:02:00+05:30')::timestamptz), 21500, 'full',
        ((CURRENT_DATE::text || ' 15:36:00+05:30')::timestamptz), 21524, 'three_quarters',
        4, 'warm', 'Impressive road presence and cabin insulation. Wants to compare with a Cayenne before deciding.', 'followup'
      );

    END IF;
  END IF;
END $$;

