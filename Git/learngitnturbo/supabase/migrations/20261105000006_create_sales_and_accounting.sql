-- ====================================================================
-- MIGRATION: 20261105000006_create_sales_and_accounting
-- Creates vehicle_expenses, sales_deals, deal_payments, deal_commissions
-- tables with GST margin scheme fields, delivery gate pass tracking,
-- RTO ownership transfer status, RLS policies, and realistic seed data.
-- ====================================================================

-- 1. Helper function for role checking
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Types & Enums (Safe creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status') THEN
    CREATE TYPE deal_status AS ENUM (
      'draft',
      'token_booked',
      'financing_pending',
      'payment_cleared',
      'delivered',
      'rto_in_progress',
      'completed',
      'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM (
      'upi',
      'bank_transfer',
      'cheque',
      'cash',
      'card',
      'auto_loan',
      'exchange_trade_in'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
    CREATE TYPE payment_type AS ENUM (
      'token_deposit',
      'down_payment',
      'loan_disbursement',
      'exchange_adjustment',
      'final_settlement',
      'refund'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM (
      'pending_clearance',
      'cleared',
      'bounced',
      'refunded'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rto_transfer_status') THEN
    CREATE TYPE rto_transfer_status AS ENUM (
      'pending_docs',
      'docs_collected',
      'submitted_to_rto',
      'scrutiny_approved',
      'rc_transferred',
      'disputed'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reconditioning_category') THEN
    CREATE TYPE reconditioning_category AS ENUM (
      'mechanical_repair',
      'bodywork_paint',
      'detailing_ceramic',
      'tyre_replacement',
      'interior_restoration',
      'electrical_battery',
      'rto_paperwork_fines',
      'transportation_towing',
      'other'
    );
  END IF;
END $$;

-- 3. Vehicle Reconditioning / Expense Ledger (Landed Cost Tracking)
CREATE TABLE IF NOT EXISTS public.vehicle_expenses (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id        uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  vehicle_id           uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  
  category             reconditioning_category NOT NULL DEFAULT 'mechanical_repair',
  description          text NOT NULL,
  vendor_name          text,
  invoice_number       text,
  invoice_date         date DEFAULT CURRENT_DATE,
  
  amount               bigint NOT NULL CHECK (amount >= 0), -- Stored in INR (₹)
  paid_by_dealership   boolean NOT NULL DEFAULT true,
  receipt_url          text,
  
  created_by           uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- 4. Sales Deals Table
CREATE TABLE IF NOT EXISTS public.sales_deals (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id          uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  deal_number            text NOT NULL UNIQUE, -- e.g. "DL-2026-0042"
  
  -- Relational Links
  vehicle_id             uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  lead_id                uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  sales_rep_id           uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Buyer Dossier
  customer_name          text NOT NULL,
  customer_phone         text NOT NULL,
  customer_email         text,
  customer_address       text,
  customer_pan           text,
  customer_aadhaar       text,
  
  -- Deal Economics (All currency in INR ₹)
  agreed_selling_price   bigint NOT NULL CHECK (agreed_selling_price > 0),
  rto_transfer_charges   bigint NOT NULL DEFAULT 0,
  insurance_charges      bigint NOT NULL DEFAULT 0,
  extended_warranty_fee  bigint NOT NULL DEFAULT 0,
  accessories_charges    bigint NOT NULL DEFAULT 0,
  discount_amount        bigint NOT NULL DEFAULT 0,
  total_deal_amount      bigint NOT NULL, -- Computed: (agreed + rto + ins + warr + acc - disc)
  
  -- Token & Booking Parameters
  token_amount           bigint NOT NULL DEFAULT 0,
  token_paid_at          timestamptz,
  token_receipt_number   text,
  is_token_refundable    boolean NOT NULL DEFAULT false,
  
  -- Auto Loan / Financing Details
  is_financed            boolean NOT NULL DEFAULT false,
  financier_name         text,
  loan_application_ref   text,
  loan_sanctioned_amount bigint DEFAULT 0,
  loan_disbursed_amount  bigint DEFAULT 0,
  delivery_order_number  text,
  delivery_order_url     text,
  
  -- Trade-in / Exchange Vehicle
  has_exchange           boolean NOT NULL DEFAULT false,
  exchange_vehicle_id    uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  exchange_allowance     bigint DEFAULT 0,
  
  -- Statutory GST Margin Scheme Breakdown
  vehicle_purchase_cost  bigint NOT NULL, -- Snapshot of purchase_price at deal creation
  vehicle_landed_cost    bigint NOT NULL, -- Snapshot of (purchase + sum of vehicle_expenses)
  taxable_margin         bigint NOT NULL DEFAULT 0,
  gst_rate_percent       smallint NOT NULL DEFAULT 18,
  cgst_amount            bigint NOT NULL DEFAULT 0,
  sgst_amount            bigint NOT NULL DEFAULT 0,
  total_gst_on_margin    bigint NOT NULL DEFAULT 0,
  
  -- Final Financial Performance (Protected RBAC)
  net_gross_profit       bigint NOT NULL DEFAULT 0, -- (agreed_price - landed_cost - gst_margin)
  sales_commission_amount bigint NOT NULL DEFAULT 0,
  
  -- Status & Milestones
  status                 deal_status NOT NULL DEFAULT 'draft',
  rto_status             rto_transfer_status NOT NULL DEFAULT 'pending_docs',
  rto_application_no     text,
  rto_completion_date    date,
  new_rc_smartcard_url   text,
  
  -- Gate Pass & Delivery Handover
  gate_pass_number       text UNIQUE,
  delivered_at           timestamptz,
  delivery_odometer_km   integer,
  delivery_fuel_level    text,
  handover_photo_url     text,
  delivery_notes         text,
  
  -- Cancellation & Notes
  cancellation_reason    text,
  internal_notes         text,
  
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- 5. Deal Payments Ledger (Tranches & Receipts)
CREATE TABLE IF NOT EXISTS public.deal_payments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id        uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  deal_id              uuid NOT NULL REFERENCES public.sales_deals(id) ON DELETE CASCADE,
  
  payment_number       text NOT NULL, -- e.g. "PAY-2026-0182"
  payment_type         payment_type NOT NULL DEFAULT 'down_payment',
  payment_method       payment_method NOT NULL DEFAULT 'bank_transfer',
  payment_status       payment_status NOT NULL DEFAULT 'cleared',
  
  amount               bigint NOT NULL CHECK (amount > 0),
  transaction_ref      text, -- UTR / Cheque No / UPI Transaction ID
  cheque_bank_name     text,
  cheque_date          date,
  
  cleared_at           timestamptz DEFAULT now(),
  received_by          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  receipt_pdf_url      text,
  notes                text,
  
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- 6. Sales Commission Ledger
CREATE TABLE IF NOT EXISTS public.deal_commissions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id        uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  deal_id              uuid NOT NULL REFERENCES public.sales_deals(id) ON DELETE CASCADE,
  sales_rep_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  commission_amount    bigint NOT NULL CHECK (commission_amount >= 0),
  calculation_basis    text NOT NULL DEFAULT 'fixed', -- 'fixed' or 'percent_of_margin'
  percentage_rate      numeric(5,2),
  
  is_approved          boolean NOT NULL DEFAULT false,
  approved_by          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at          timestamptz,
  
  is_paid              boolean NOT NULL DEFAULT false,
  paid_at              timestamptz,
  payment_ref          text,
  
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS vehicle_expenses_dealership_idx ON public.vehicle_expenses(dealership_id);
CREATE INDEX IF NOT EXISTS vehicle_expenses_vehicle_idx ON public.vehicle_expenses(vehicle_id);

CREATE INDEX IF NOT EXISTS sales_deals_dealership_idx ON public.sales_deals(dealership_id);
CREATE INDEX IF NOT EXISTS sales_deals_vehicle_idx ON public.sales_deals(vehicle_id);
CREATE INDEX IF NOT EXISTS sales_deals_lead_idx ON public.sales_deals(lead_id);
CREATE INDEX IF NOT EXISTS sales_deals_sales_rep_idx ON public.sales_deals(dealership_id, sales_rep_id);
CREATE INDEX IF NOT EXISTS sales_deals_status_idx ON public.sales_deals(dealership_id, status);
CREATE INDEX IF NOT EXISTS sales_deals_rto_status_idx ON public.sales_deals(dealership_id, rto_status);
CREATE INDEX IF NOT EXISTS sales_deals_created_at_idx ON public.sales_deals(dealership_id, created_at DESC);

CREATE INDEX IF NOT EXISTS deal_payments_dealership_idx ON public.deal_payments(dealership_id);
CREATE INDEX IF NOT EXISTS deal_payments_deal_idx ON public.deal_payments(deal_id);
CREATE INDEX IF NOT EXISTS deal_payments_status_idx ON public.deal_payments(dealership_id, payment_status);

CREATE INDEX IF NOT EXISTS deal_commissions_dealership_idx ON public.deal_commissions(dealership_id);
CREATE INDEX IF NOT EXISTS deal_commissions_rep_idx ON public.deal_commissions(sales_rep_id);

-- 7. Row Level Security
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_commissions ENABLE ROW LEVEL SECURITY;

-- Vehicle Expenses RLS
DROP POLICY IF EXISTS "Members can view vehicle expenses" ON public.vehicle_expenses;
CREATE POLICY "Members can view vehicle expenses"
  ON public.vehicle_expenses FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Authorized staff can insert vehicle expenses" ON public.vehicle_expenses;
CREATE POLICY "Authorized staff can insert vehicle expenses"
  ON public.vehicle_expenses FOR INSERT
  WITH CHECK (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Owners and accountants can update vehicle expenses" ON public.vehicle_expenses;
CREATE POLICY "Owners and accountants can update vehicle expenses"
  ON public.vehicle_expenses FOR UPDATE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND (public.is_dealership_owner() = true OR public.get_my_role() IN ('admin', 'accountant'))
  );

DROP POLICY IF EXISTS "Owners can delete vehicle expenses" ON public.vehicle_expenses;
CREATE POLICY "Owners can delete vehicle expenses"
  ON public.vehicle_expenses FOR DELETE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
  );

-- Sales Deals RLS
DROP POLICY IF EXISTS "Members can view deals of their showroom" ON public.sales_deals;
CREATE POLICY "Members can view deals of their showroom"
  ON public.sales_deals FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Authorized staff can create deals" ON public.sales_deals;
CREATE POLICY "Authorized staff can create deals"
  ON public.sales_deals FOR INSERT
  WITH CHECK (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Authorized staff can update deals" ON public.sales_deals;
CREATE POLICY "Authorized staff can update deals"
  ON public.sales_deals FOR UPDATE
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Only Owners can delete deals" ON public.sales_deals;
CREATE POLICY "Only Owners can delete deals"
  ON public.sales_deals FOR DELETE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
  );

-- Deal Payments RLS
DROP POLICY IF EXISTS "Members can view payments" ON public.deal_payments;
CREATE POLICY "Members can view payments"
  ON public.deal_payments FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Authorized staff can record payments" ON public.deal_payments;
CREATE POLICY "Authorized staff can record payments"
  ON public.deal_payments FOR INSERT
  WITH CHECK (dealership_id = public.get_my_dealership_id());

DROP POLICY IF EXISTS "Owners and Accountants can update payments" ON public.deal_payments;
CREATE POLICY "Owners and Accountants can update payments"
  ON public.deal_payments FOR UPDATE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND (public.is_dealership_owner() = true OR public.get_my_role() IN ('admin', 'accountant'))
  );

-- Commissions RLS
DROP POLICY IF EXISTS "Staff view commissions" ON public.deal_commissions;
CREATE POLICY "Staff view commissions"
  ON public.deal_commissions FOR SELECT
  USING (
    dealership_id = public.get_my_dealership_id()
    AND (
      public.is_dealership_owner() = true
      OR public.get_my_role() IN ('admin', 'accountant')
      OR sales_rep_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners and Accountants manage commissions" ON public.deal_commissions;
CREATE POLICY "Owners and Accountants manage commissions"
  ON public.deal_commissions FOR ALL
  USING (
    dealership_id = public.get_my_dealership_id()
    AND (public.is_dealership_owner() = true OR public.get_my_role() IN ('admin', 'accountant'))
  );

-- 8. Seed Realistic Demonstration Data for Pre-Owned Deals
DO $$
DECLARE
  v_dealership_id uuid;
  v_owner_id uuid;
  v_amg_id uuid;
  v_bmw_id uuid;
  v_porsche_id uuid;
  v_defender_id uuid;
  v_deal_1_id uuid;
  v_deal_2_id uuid;
  v_deal_3_id uuid;
  v_deal_4_id uuid;
BEGIN
  SELECT id INTO v_dealership_id FROM public.dealerships LIMIT 1;
  SELECT id INTO v_owner_id FROM public.profiles WHERE dealership_id = v_dealership_id LIMIT 1;
  
  IF v_dealership_id IS NOT NULL THEN
    SELECT id INTO v_amg_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Mercedes-AMG' LIMIT 1;
    SELECT id INTO v_bmw_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'BMW' LIMIT 1;
    SELECT id INTO v_porsche_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Porsche' LIMIT 1;
    SELECT id INTO v_defender_id FROM public.vehicles WHERE dealership_id = v_dealership_id AND brand = 'Land Rover' LIMIT 1;

    -- Only seed if sales_deals is empty
    IF NOT EXISTS (SELECT 1 FROM public.sales_deals WHERE dealership_id = v_dealership_id) THEN

      -- RECONDITIONING / EXPENSES SEEDING
      IF v_amg_id IS NOT NULL THEN
        INSERT INTO public.vehicle_expenses (
          dealership_id, vehicle_id, category, description, vendor_name,
          invoice_number, amount, created_by
        ) VALUES
        (v_dealership_id, v_amg_id, 'detailing_ceramic', 'Full 9H Ceramic Coating & Paint Correction', 'Apex Detailing Studio', 'INV-DET-491', 120000, v_owner_id),
        (v_dealership_id, v_amg_id, 'tyre_replacement', 'Pirelli P Zero Corsa (Rear Axle 315/30 R21)', 'Speedways Tyre Corp', 'INV-TYR-992', 80000, v_owner_id);
      END IF;

      IF v_bmw_id IS NOT NULL THEN
        INSERT INTO public.vehicle_expenses (
          dealership_id, vehicle_id, category, description, vendor_name,
          invoice_number, amount, created_by
        ) VALUES
        (v_dealership_id, v_bmw_id, 'detailing_ceramic', 'Interior Nappa Leather Sanitization & Ceramic Protect', 'Apex Detailing Studio', 'INV-DET-502', 80000, v_owner_id);
      END IF;

      -- DEAL 1: Mercedes-AMG GT 63 S (Delivered on Road, Gate Pass Issued)
      IF v_amg_id IS NOT NULL THEN
        INSERT INTO public.sales_deals (
          dealership_id, deal_number, vehicle_id, sales_rep_id,
          customer_name, customer_phone, customer_email, customer_address, customer_pan,
          agreed_selling_price, rto_transfer_charges, insurance_charges, extended_warranty_fee,
          accessories_charges, discount_amount, total_deal_amount,
          token_amount, token_paid_at, token_receipt_number,
          is_financed, financier_name, loan_application_ref, loan_sanctioned_amount, loan_disbursed_amount, delivery_order_number,
          vehicle_purchase_cost, vehicle_landed_cost, taxable_margin, gst_rate_percent, cgst_amount, sgst_amount, total_gst_on_margin,
          net_gross_profit, sales_commission_amount, status, rto_status, rto_application_no,
          gate_pass_number, delivered_at, delivery_odometer_km, delivery_fuel_level, delivery_notes
        ) VALUES (
          v_dealership_id, 'DL-2026-0042', v_amg_id, v_owner_id,
          'Vikramaditya Singhania', '+91 98450 11223', 'vikram.singhania@apexholding.in', 'Indiranagar 100ft Road, Bengaluru, Karnataka', 'ABCPV9182K',
          16200000, 45000, 180000, 120000, 0, 50000, 16495000,
          500000, now() - interval '6 days', 'TKN-2026-0042',
          true, 'HDFC Bank Auto Loans', 'HDFC-AL-88912', 10000000, 10000000, 'HDFC-DO-2026-9921',
          14000000, 14200000, 1864407, 18, 167796, 167797, 335593,
          1664407, 120000, 'delivered', 'submitted_to_rto', 'KA04-RTO-2026-8819',
          'GP-2026-0012', now() - interval '1 day', 18220, 'full', 'Handover completed with two original keys, BSI warranty documents, and Form 29/30 acknowledged.'
        ) RETURNING id INTO v_deal_1_id;

        -- Deal 1 Payments (100% Cleared)
        INSERT INTO public.deal_payments (
          dealership_id, deal_id, payment_number, payment_type, payment_method, payment_status,
          amount, transaction_ref, cleared_at, received_by, notes
        ) VALUES
        (v_dealership_id, v_deal_1_id, 'PAY-2026-0081', 'token_deposit', 'upi', 'cleared', 500000, 'UPI/20260401/8921820', now() - interval '6 days', v_owner_id, 'Initial booking token'),
        (v_dealership_id, v_deal_1_id, 'PAY-2026-0082', 'down_payment', 'bank_transfer', 'cleared', 5995000, 'RTGS/HDFC9821892019/CUSTOMER', now() - interval '2 days', v_owner_id, 'Customer down payment clearance'),
        (v_dealership_id, v_deal_1_id, 'PAY-2026-0083', 'loan_disbursement', 'auto_loan', 'cleared', 10000000, 'HDFC/AL/DISBURSE/9921', now() - interval '1 day', v_owner_id, 'HDFC bank loan direct NEFT disbursement');

        -- Deal 1 Commission
        INSERT INTO public.deal_commissions (
          dealership_id, deal_id, sales_rep_id, commission_amount, calculation_basis, is_approved, is_paid
        ) VALUES
        (v_dealership_id, v_deal_1_id, v_owner_id, 120000, 'fixed', true, false);
      END IF;

      -- DEAL 2: BMW M4 Competition (Token Booked & Reserved)
      IF v_bmw_id IS NOT NULL THEN
        INSERT INTO public.sales_deals (
          dealership_id, deal_number, vehicle_id, sales_rep_id,
          customer_name, customer_phone, customer_email, customer_address, customer_pan,
          agreed_selling_price, rto_transfer_charges, insurance_charges, extended_warranty_fee,
          accessories_charges, discount_amount, total_deal_amount,
          token_amount, token_paid_at, token_receipt_number,
          is_financed, financier_name, loan_application_ref, loan_sanctioned_amount, loan_disbursed_amount,
          vehicle_purchase_cost, vehicle_landed_cost, taxable_margin, gst_rate_percent, cgst_amount, sgst_amount, total_gst_on_margin,
          net_gross_profit, sales_commission_amount, status, rto_status
        ) VALUES (
          v_dealership_id, 'DL-2026-0043', v_bmw_id, v_owner_id,
          'Arjun Mehra', '+91 99001 88344', 'arjun.mehra@techventures.io', 'Lavelle Road, Bengaluru, Karnataka', 'BKPPM4019Q',
          12800000, 35000, 150000, 0, 0, 0, 12985000,
          200000, now() - interval '2 days', 'TKN-2026-0043',
          true, 'ICICI Bank Auto Loans', 'ICICI-CAR-44019', 9000000, 0,
          11200000, 11280000, 1355932, 18, 122034, 122034, 244068,
          1275932, 80000, 'token_booked', 'pending_docs'
        ) RETURNING id INTO v_deal_2_id;

        INSERT INTO public.deal_payments (
          dealership_id, deal_id, payment_number, payment_type, payment_method, payment_status,
          amount, transaction_ref, cleared_at, received_by, notes
        ) VALUES
        (v_dealership_id, v_deal_2_id, 'PAY-2026-0084', 'token_deposit', 'bank_transfer', 'cleared', 200000, 'NEFT/ICIC771920491/TOKEN', now() - interval '2 days', v_owner_id, 'Token advance collected. Vehicle locked to reserved.');
      END IF;

      -- DEAL 3: Land Rover Defender 110 (Financing Pending)
      IF v_defender_id IS NOT NULL THEN
        INSERT INTO public.sales_deals (
          dealership_id, deal_number, vehicle_id, sales_rep_id,
          customer_name, customer_phone, customer_email, customer_address, customer_pan,
          agreed_selling_price, rto_transfer_charges, insurance_charges, extended_warranty_fee,
          accessories_charges, discount_amount, total_deal_amount,
          token_amount, token_paid_at, token_receipt_number,
          is_financed, financier_name, loan_application_ref, loan_sanctioned_amount, loan_disbursed_amount,
          vehicle_purchase_cost, vehicle_landed_cost, taxable_margin, gst_rate_percent, cgst_amount, sgst_amount, total_gst_on_margin,
          net_gross_profit, sales_commission_amount, status, rto_status
        ) VALUES (
          v_dealership_id, 'DL-2026-0044', v_defender_id, v_owner_id,
          'Rajeshwari Deshmukh', '+91 97412 55667', 'r.deshmukh@deshmukhgroup.com', 'Koregaon Park, Pune, Maharashtra', 'CKKPD8819L',
          11500000, 40000, 140000, 95000, 0, 0, 11775000,
          500000, now() - interval '4 days', 'TKN-2026-0044',
          true, 'Kotak Mahindra Prime', 'KOTAK-PRIME-88219', 8500000, 0,
          9800000, 9900000, 1440678, 18, 129661, 129661, 259322,
          1340678, 75000, 'financing_pending', 'pending_docs'
        ) RETURNING id INTO v_deal_3_id;

        INSERT INTO public.deal_payments (
          dealership_id, deal_id, payment_number, payment_type, payment_method, payment_status,
          amount, transaction_ref, cleared_at, received_by, notes
        ) VALUES
        (v_dealership_id, v_deal_3_id, 'PAY-2026-0085', 'token_deposit', 'upi', 'cleared', 500000, 'UPI/20260402/9910283', now() - interval '4 days', v_owner_id, 'Token deposit cleared'),
        (v_dealership_id, v_deal_3_id, 'PAY-2026-0086', 'down_payment', 'bank_transfer', 'cleared', 2775000, 'RTGS/KOTAK88201923/DOWNPAY', now() - interval '1 day', v_owner_id, 'Partial customer down payment received. Awaiting Kotak DO.');
      END IF;

      -- DEAL 4: Porsche 911 GT3 (Fully Closed & RC Transferred)
      IF v_porsche_id IS NOT NULL THEN
        INSERT INTO public.sales_deals (
          dealership_id, deal_number, vehicle_id, sales_rep_id,
          customer_name, customer_phone, customer_email, customer_address, customer_pan,
          agreed_selling_price, rto_transfer_charges, insurance_charges, extended_warranty_fee,
          accessories_charges, discount_amount, total_deal_amount,
          token_amount, token_paid_at, token_receipt_number,
          is_financed, financier_name,
          vehicle_purchase_cost, vehicle_landed_cost, taxable_margin, gst_rate_percent, cgst_amount, sgst_amount, total_gst_on_margin,
          net_gross_profit, sales_commission_amount, status, rto_status, rto_application_no, rto_completion_date,
          gate_pass_number, delivered_at, delivery_odometer_km, delivery_fuel_level, delivery_notes
        ) VALUES (
          v_dealership_id, 'DL-2026-0040', v_porsche_id, v_owner_id,
          'Siddharth Vardhan', '+91 98860 44556', 'siddharth@vardhanestates.com', 'Sadashivnagar, Bengaluru, Karnataka', 'AKLPV7710R',
          24500000, 50000, 250000, 200000, 0, 0, 25000000,
          1000000, now() - interval '18 days', 'TKN-2026-0040',
          false, null,
          21500000, 21650000, 2542373, 18, 228814, 228813, 457627,
          2392373, 200000, 'completed', 'rc_transferred', 'KA04-RTO-2026-7712', CURRENT_DATE - 3,
          'GP-2026-0008', now() - interval '12 days', 9420, 'full', 'VIP customer delivery with Porsche Tequipment accessories. New smart card handed over.'
        ) RETURNING id INTO v_deal_4_id;

        INSERT INTO public.deal_payments (
          dealership_id, deal_id, payment_number, payment_type, payment_method, payment_status,
          amount, transaction_ref, cleared_at, received_by, notes
        ) VALUES
        (v_dealership_id, v_deal_4_id, 'PAY-2026-0070', 'token_deposit', 'bank_transfer', 'cleared', 1000000, 'RTGS/HDFC771920/TOKEN', now() - interval '18 days', v_owner_id, 'High-value token for Porsche GT3 reservation'),
        (v_dealership_id, v_deal_4_id, 'PAY-2026-0071', 'final_settlement', 'bank_transfer', 'cleared', 24000000, 'RTGS/HDFC991204/SETTLEMENT', now() - interval '13 days', v_owner_id, 'Full settlement via wire transfer');

        INSERT INTO public.deal_commissions (
          dealership_id, deal_id, sales_rep_id, commission_amount, calculation_basis, is_approved, approved_at, is_paid, paid_at
        ) VALUES
        (v_dealership_id, v_deal_4_id, v_owner_id, 200000, 'fixed', true, now() - interval '3 days', true, now() - interval '2 days');
      END IF;

    END IF;
  END IF;
END $$;

