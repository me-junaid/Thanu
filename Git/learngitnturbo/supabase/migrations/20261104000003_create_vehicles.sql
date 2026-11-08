-- ====================================================================
-- MIGRATION: 20261104000003_create_vehicles
-- Creates vehicles and vehicle_media tables with RLS and seed data.
-- ====================================================================

-- 1. Types & Enums (Safe creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
    CREATE TYPE vehicle_status AS ENUM ('draft', 'in_refurbishment', 'available', 'reserved', 'sold', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_fuel_type') THEN
    CREATE TYPE vehicle_fuel_type AS ENUM ('petrol', 'diesel', 'hybrid', 'electric', 'cng');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_transmission') THEN
    CREATE TYPE vehicle_transmission AS ENUM ('manual', 'automatic', 'dual_clutch', 'pdk');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_body_type') THEN
    CREATE TYPE vehicle_body_type AS ENUM ('coupe', 'sedan', 'suv', 'hatchback', 'convertible', 'wagon');
  END IF;
END $$;

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id        uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  
  -- Core Specifications
  brand                text NOT NULL,
  model                text NOT NULL,
  variant              text,
  manufacturing_year   smallint NOT NULL,
  registration_year    smallint NOT NULL,
  registration_number  text,
  vin                  text,
  
  -- Technical Attributes
  fuel_type            vehicle_fuel_type NOT NULL DEFAULT 'petrol',
  transmission         vehicle_transmission NOT NULL DEFAULT 'automatic',
  body_type            vehicle_body_type NOT NULL DEFAULT 'sedan',
  kilometers           integer NOT NULL DEFAULT 0,
  ownership_count      smallint NOT NULL DEFAULT 1,
  exterior_color       text,
  interior_color       text,
  
  -- Public Listing
  asking_price         bigint NOT NULL,
  featured             boolean NOT NULL DEFAULT false,
  certified            boolean NOT NULL DEFAULT true,
  description          text,
  
  -- Private Financials (Dealership Economics)
  purchase_price       bigint,
  refurbishment_cost   bigint DEFAULT 0,
  minimum_floor_price  bigint,
  acquisition_date     date DEFAULT CURRENT_DATE,
  acquired_from        text,
  internal_notes       text,
  
  -- Lifecycle
  status               vehicle_status NOT NULL DEFAULT 'available',
  published_at         timestamptz DEFAULT now(),
  sold_at              timestamptz,
  sold_price           bigint,
  
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS vehicles_dealership_idx ON public.vehicles(dealership_id);
CREATE INDEX IF NOT EXISTS vehicles_status_idx ON public.vehicles(dealership_id, status);
CREATE INDEX IF NOT EXISTS vehicles_brand_model_idx ON public.vehicles(dealership_id, brand, model);

-- 3. Vehicle Media Table
CREATE TABLE IF NOT EXISTS public.vehicle_media (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id  uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  vehicle_id     uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  url            text NOT NULL,
  is_hero        boolean NOT NULL DEFAULT false,
  sort_order     smallint NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vehicle_media_vehicle_idx ON public.vehicle_media(vehicle_id, sort_order);

-- 4. Row Level Security
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_media ENABLE ROW LEVEL SECURITY;

-- Vehicles Policies
DROP POLICY IF EXISTS "Members can view dealership vehicles" ON public.vehicles;
CREATE POLICY "Members can view dealership vehicles"
  ON public.vehicles FOR SELECT
  USING (
    dealership_id = public.get_my_dealership_id()
    OR status = 'available'
  );

DROP POLICY IF EXISTS "Members can insert dealership vehicles" ON public.vehicles;
CREATE POLICY "Members can insert dealership vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (
    dealership_id = public.get_my_dealership_id()
  );

DROP POLICY IF EXISTS "Members can update dealership vehicles" ON public.vehicles;
CREATE POLICY "Members can update dealership vehicles"
  ON public.vehicles FOR UPDATE
  USING (
    dealership_id = public.get_my_dealership_id()
  );

DROP POLICY IF EXISTS "Owner can delete dealership vehicles" ON public.vehicles;
CREATE POLICY "Owner can delete dealership vehicles"
  ON public.vehicles FOR DELETE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
  );

-- Vehicle Media Policies
DROP POLICY IF EXISTS "Members can view vehicle media" ON public.vehicle_media;
CREATE POLICY "Members can view vehicle media"
  ON public.vehicle_media FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Members can manage vehicle media" ON public.vehicle_media;
CREATE POLICY "Members can manage vehicle media"
  ON public.vehicle_media FOR ALL
  USING (
    dealership_id = public.get_my_dealership_id()
  );

-- 5. Seed Initial Vehicles for Existing Dealerships
DO $$
DECLARE
  v_dealership_id uuid;
  v_car_id uuid;
BEGIN
  SELECT id INTO v_dealership_id FROM public.dealerships LIMIT 1;
  
  IF v_dealership_id IS NOT NULL THEN
    -- Check if vehicles already seeded
    IF NOT EXISTS (SELECT 1 FROM public.vehicles WHERE dealership_id = v_dealership_id) THEN
      -- Car 1: Porsche 911 Carrera S
      INSERT INTO public.vehicles (
        dealership_id, brand, model, variant, manufacturing_year, registration_year,
        registration_number, fuel_type, transmission, body_type, kilometers,
        ownership_count, exterior_color, interior_color, asking_price, purchase_price,
        refurbishment_cost, status, featured, certified, description
      ) VALUES (
        v_dealership_id, 'Porsche', '911 Carrera S', 'Coupe (992)', 2023, 2023,
        'KA 01 MJ 9999', 'petrol', 'pdk', 'coupe', 12400,
        1, 'Gentian Blue Metallic', 'Black / Bordeaux Red Leather',
        18500000, 16200000, 150000, 'available', true, true,
        'Single owner, serviced exclusively at Porsche Centre Bengaluru. Sports exhaust, Chrono Package.'
      ) RETURNING id INTO v_car_id;

      INSERT INTO public.vehicle_media (dealership_id, vehicle_id, url, is_hero, sort_order)
      VALUES (v_dealership_id, v_car_id, 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80', true, 0);

      -- Car 2: Mercedes-AMG GT 63 S
      INSERT INTO public.vehicles (
        dealership_id, brand, model, variant, manufacturing_year, registration_year,
        registration_number, fuel_type, transmission, body_type, kilometers,
        ownership_count, exterior_color, interior_color, asking_price, purchase_price,
        refurbishment_cost, status, featured, certified, description
      ) VALUES (
        v_dealership_id, 'Mercedes-AMG', 'GT 63 S', '4-Door Coupé 4MATIC+', 2022, 2022,
        'KA 04 NM 4004', 'petrol', 'dual_clutch', 'coupe', 18200,
        1, 'Designo Selenite Grey Magno', 'Nappa Leather Black',
        16200000, 14000000, 200000, 'available', true, true,
        '4.0L V8 Biturbo, Carbon exterior package, Burmester 3D Surround sound system.'
      ) RETURNING id INTO v_car_id;

      INSERT INTO public.vehicle_media (dealership_id, vehicle_id, url, is_hero, sort_order)
      VALUES (v_dealership_id, v_car_id, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', true, 0);

      -- Car 3: BMW M4 Competition
      INSERT INTO public.vehicles (
        dealership_id, brand, model, variant, manufacturing_year, registration_year,
        registration_number, fuel_type, transmission, body_type, kilometers,
        ownership_count, exterior_color, interior_color, asking_price, purchase_price,
        refurbishment_cost, status, featured, certified, description
      ) VALUES (
        v_dealership_id, 'BMW', 'M4 Competition', 'M xDrive G82', 2024, 2024,
        'KA 05 PL 7777', 'petrol', 'automatic', 'coupe', 6100,
        1, 'Isle of Man Green', 'Kyalami Orange / Black Merino Leather',
        12800000, 11200000, 80000, 'reserved', false, true,
        'Under BMW BSI+ warranty package until 2028. M Carbon bucket seats.'
      ) RETURNING id INTO v_car_id;

      INSERT INTO public.vehicle_media (dealership_id, vehicle_id, url, is_hero, sort_order)
      VALUES (v_dealership_id, v_car_id, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', true, 0);

      -- Car 4: Audi RS6 Avant
      INSERT INTO public.vehicles (
        dealership_id, brand, model, variant, manufacturing_year, registration_year,
        registration_number, fuel_type, transmission, body_type, kilometers,
        ownership_count, exterior_color, interior_color, asking_price, purchase_price,
        refurbishment_cost, status, featured, certified, description
      ) VALUES (
        v_dealership_id, 'Audi', 'RS6 Avant', '4.0 TFSI Quattro', 2023, 2023,
        'KA 03 QW 1234', 'hybrid', 'automatic', 'wagon', 14800,
        1, 'Nardo Grey', 'Valcona Leather with RS Honeycomb',
        17500000, 15000000, 120000, 'available', false, true,
        'Ceramic brakes, RS Dynamic Package Plus, panoramic sunroof.'
      ) RETURNING id INTO v_car_id;

      INSERT INTO public.vehicle_media (dealership_id, vehicle_id, url, is_hero, sort_order)
      VALUES (v_dealership_id, v_car_id, 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80', true, 0);

      -- Car 5: Land Rover Defender 110
      INSERT INTO public.vehicles (
        dealership_id, brand, model, variant, manufacturing_year, registration_year,
        registration_number, fuel_type, transmission, body_type, kilometers,
        ownership_count, exterior_color, interior_color, asking_price, purchase_price,
        refurbishment_cost, status, featured, certified, description
      ) VALUES (
        v_dealership_id, 'Land Rover', 'Defender 110', 'D300 HSE 3.0L Diesel', 2023, 2023,
        'KA 01 TR 8080', 'diesel', 'automatic', 'suv', 21500,
        1, 'Pangea Green Metallic', 'Acorn Windsor Leather',
        11500000, 9800000, 100000, 'in_refurbishment', false, true,
        'Electronic Air Suspension, 3D Surround Camera, Meridian Surround Audio.'
      ) RETURNING id INTO v_car_id;

      INSERT INTO public.vehicle_media (dealership_id, vehicle_id, url, is_hero, sort_order)
      VALUES (v_dealership_id, v_car_id, 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80', true, 0);
    END IF;
  END IF;
END $$;

