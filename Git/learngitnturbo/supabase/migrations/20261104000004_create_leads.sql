-- ====================================================================
-- MIGRATION: 20261104000004_create_leads
-- Creates leads and lead_activities tables with RLS and seed data.
-- ====================================================================

-- 1. Types & Enums (Safe creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM (
      'new',
      'contacted',
      'interested',
      'test_drive_scheduled',
      'negotiation',
      'booked',
      'converted',
      'lost'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
    CREATE TYPE lead_source AS ENUM (
      'website_form',
      'whatsapp_direct',
      'showroom_walkin',
      'phone_call',
      'referral',
      'other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_priority') THEN
    CREATE TYPE lead_priority AS ENUM (
      'low',
      'medium',
      'high',
      'urgent'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_activity_type') THEN
    CREATE TYPE lead_activity_type AS ENUM (
      'status_change',
      'note_added',
      'call_logged',
      'whatsapp_sent',
      'test_drive_booked',
      'assignment_change'
    );
  END IF;
END $$;

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id          uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  
  -- Customer Information
  customer_name          text NOT NULL,
  phone_number           text NOT NULL,
  email                  text,
  city                   text,
  
  -- Vehicle of Interest (Foreign Key to live inventory)
  vehicle_id             uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  
  -- Lead Parameters
  source                 lead_source NOT NULL DEFAULT 'website_form',
  status                 lead_status NOT NULL DEFAULT 'new',
  priority               lead_priority NOT NULL DEFAULT 'medium',
  
  -- Commercial Attributes
  budget_amount          bigint,
  financing_required     boolean NOT NULL DEFAULT false,
  trade_in_vehicle       text,
  
  -- Assignment & Scheduling
  assigned_to            uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  next_followup_at       timestamptz,
  lost_reason            text,
  
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS leads_dealership_idx ON public.leads(dealership_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads(dealership_id, status);
CREATE INDEX IF NOT EXISTS leads_assigned_idx ON public.leads(dealership_id, assigned_to);
CREATE INDEX IF NOT EXISTS leads_followup_idx ON public.leads(dealership_id, next_followup_at);

-- 3. Lead Activities Table (Audit & Timeline History)
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id  uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  lead_id        uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  created_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  activity_type  lead_activity_type NOT NULL DEFAULT 'note_added',
  title          text NOT NULL,
  description    text,
  metadata       jsonb DEFAULT '{}'::jsonb,
  
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_activities_lead_idx ON public.lead_activities(lead_id, created_at DESC);

-- 4. Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Leads Policies
DROP POLICY IF EXISTS "Members can view dealership leads" ON public.leads;
CREATE POLICY "Members can view dealership leads"
  ON public.leads FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Public website can create leads" ON public.leads;
CREATE POLICY "Public website can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Members can update dealership leads" ON public.leads;
CREATE POLICY "Members can update dealership leads"
  ON public.leads FOR UPDATE
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Owners can delete leads" ON public.leads;
CREATE POLICY "Owners can delete leads"
  ON public.leads FOR DELETE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
  );

-- Lead Activities Policies
DROP POLICY IF EXISTS "Members can view lead activities" ON public.lead_activities;
CREATE POLICY "Members can view lead activities"
  ON public.lead_activities FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Members can insert lead activities" ON public.lead_activities;
CREATE POLICY "Members can insert lead activities"
  ON public.lead_activities FOR INSERT
  WITH CHECK (dealership_id = public.get_my_dealership_id());

-- 5. Seed Demonstration Leads for Existing Showroom
DO $$
DECLARE
  v_dealership_id uuid;
  v_owner_id uuid;
  v_porsche_id uuid;
  v_amg_id uuid;
  v_bmw_id uuid;
  v_audi_id uuid;
  v_lead_id uuid;
BEGIN
  SELECT id INTO v_dealership_id FROM public.dealerships LIMIT 1;
  SELECT id INTO v_owner_id FROM public.profiles WHERE dealership_id = v_dealership_id LIMIT 1;
  
  SELECT id INTO v_porsche_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Porsche' LIMIT 1;
  SELECT id INTO v_amg_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Mercedes-AMG' LIMIT 1;
  SELECT id INTO v_bmw_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'BMW' LIMIT 1;
  SELECT id INTO v_audi_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Audi' LIMIT 1;

  IF v_dealership_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE dealership_id = v_dealership_id) THEN
      
      -- Lead 1: Vikram Malhotra (Porsche 911 inquiry)
      INSERT INTO public.leads (
        dealership_id, customer_name, phone_number, email, city,
        vehicle_id, source, status, priority, budget_amount,
        financing_required, trade_in_vehicle, assigned_to, next_followup_at
      ) VALUES (
        v_dealership_id, 'Vikram Malhotra', '+91 98840 12345', 'vikram.malhotra@techcorp.in', 'Bengaluru',
        v_porsche_id, 'website_form', 'new', 'urgent', 18500000,
        false, '2020 BMW 530d M Sport', v_owner_id, now() + interval '2 hours'
      ) RETURNING id INTO v_lead_id;

      INSERT INTO public.lead_activities (dealership_id, lead_id, created_by, activity_type, title, description)
      VALUES (v_dealership_id, v_lead_id, v_owner_id, 'note_added', 'Web Inquiry Captured', 'Inquired via Storefront for 2023 Porsche 911 Carrera S. Looking for immediate delivery.');

      -- Lead 2: Ananya Deshmukh (Mercedes-AMG Test Drive)
      INSERT INTO public.leads (
        dealership_id, customer_name, phone_number, email, city,
        vehicle_id, source, status, priority, budget_amount,
        financing_required, trade_in_vehicle, assigned_to, next_followup_at
      ) VALUES (
        v_dealership_id, 'Ananya Deshmukh', '+91 98450 67890', 'ananya.deshmukh@gmail.com', 'Bengaluru',
        v_amg_id, 'whatsapp_direct', 'test_drive_scheduled', 'high', 16000000,
        true, NULL, v_owner_id, now() + interval '1 day'
      ) RETURNING id INTO v_lead_id;

      INSERT INTO public.lead_activities (dealership_id, lead_id, created_by, activity_type, title, description)
      VALUES (v_dealership_id, v_lead_id, v_owner_id, 'test_drive_booked', 'Showroom Test Drive Booked', 'Confirmed test drive appointment tomorrow at 4:30 PM for GT 63 S Coupé.');

      -- Lead 3: Rohan Singhal (BMW M4 Negotiation)
      INSERT INTO public.leads (
        dealership_id, customer_name, phone_number, email, city,
        vehicle_id, source, status, priority, budget_amount,
        financing_required, trade_in_vehicle, assigned_to, next_followup_at
      ) VALUES (
        v_dealership_id, 'Rohan Singhal', '+91 99001 54321', 'rohan@singhalgroup.com', 'Bengaluru',
        v_bmw_id, 'showroom_walkin', 'negotiation', 'high', 12500000,
        false, '2021 Mercedes C300d', v_owner_id, now() + interval '4 hours'
      ) RETURNING id INTO v_lead_id;

      INSERT INTO public.lead_activities (dealership_id, lead_id, created_by, activity_type, title, description)
      VALUES (v_dealership_id, v_lead_id, v_owner_id, 'call_logged', 'Counter-offer Discussion', 'Offered ₹1.24 Cr against asking ₹1.28 Cr. Evaluating exchange valuation for his C300d.');

      -- Lead 4: Karan Oberoi (Audi RS6 Token Received)
      INSERT INTO public.leads (
        dealership_id, customer_name, phone_number, email, city,
        vehicle_id, source, status, priority, budget_amount,
        financing_required, trade_in_vehicle, assigned_to, next_followup_at
      ) VALUES (
        v_dealership_id, 'Karan Oberoi', '+91 98110 99887', 'karan@oberoienterprises.in', 'Bengaluru',
        v_audi_id, 'phone_call', 'booked', 'urgent', 17500000,
        false, NULL, v_owner_id, now() + interval '2 days'
      ) RETURNING id INTO v_lead_id;

      INSERT INTO public.lead_activities (dealership_id, lead_id, created_by, activity_type, title, description)
      VALUES (v_dealership_id, v_lead_id, v_owner_id, 'status_change', 'Token Deposit Verified', 'Booking token ₹5,00,000 received via RTGS. Vehicle marked reserved on floor.');

      -- Lead 5: Dr. Siddharth Verma (General Walk-in Inquiry)
      INSERT INTO public.leads (
        dealership_id, customer_name, phone_number, email, city,
        vehicle_id, source, status, priority, budget_amount,
        financing_required, trade_in_vehicle, assigned_to, next_followup_at
      ) VALUES (
        v_dealership_id, 'Dr. Siddharth Verma', '+91 97400 33221', 'siddharth.v@apollohospitals.org', 'Bengaluru',
        NULL, 'showroom_walkin', 'contacted', 'medium', 10000000,
        true, NULL, v_owner_id, now() + interval '3 days'
      ) RETURNING id INTO v_lead_id;

      INSERT INTO public.lead_activities (dealership_id, lead_id, created_by, activity_type, title, description)
      VALUES (v_dealership_id, v_lead_id, v_owner_id, 'note_added', 'Showroom Visit Notes', 'Looking for a pre-owned luxury SUV around ₹1 Cr budget. Showed Land Rover Defender.');

    END IF;
  END IF;
END $$;

