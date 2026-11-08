-- ==============================================================================
-- Migration: 20261108000010_optimize_performance_indexes.sql
-- Description: Composite multi-tenant performance indexes for sub-50ms dashboard queries.
-- Indexes filter by dealership_id first, followed by sorting/filtering predicates.
-- ==============================================================================

-- ── 1. Leads Indexes ─────────────────────────────────────────────────────────
-- Status filtering on showroom leads
CREATE INDEX IF NOT EXISTS idx_leads_dealership_status
  ON public.leads(dealership_id, status);

-- Chronological default order for leads inbox
CREATE INDEX IF NOT EXISTS idx_leads_dealership_created_at
  ON public.leads(dealership_id, created_at DESC);

-- Scoped query for sales executive assigned leads
CREATE INDEX IF NOT EXISTS idx_leads_dealership_assigned_to
  ON public.leads(dealership_id, assigned_to)
  WHERE assigned_to IS NOT NULL;

-- ── 2. Vehicles Indexes ──────────────────────────────────────────────────────
-- Status filtering for inventory (e.g. available, reserved, sold)
CREATE INDEX IF NOT EXISTS idx_vehicles_dealership_status
  ON public.vehicles(dealership_id, status);

-- Chronological inventory sorting for showroom catalog
CREATE INDEX IF NOT EXISTS idx_vehicles_dealership_created_at
  ON public.vehicles(dealership_id, created_at DESC);

-- ── 3. Test Drives Indexes ───────────────────────────────────────────────────
-- Status filtering for test drive requests
CREATE INDEX IF NOT EXISTS idx_test_drives_dealership_status
  ON public.test_drives(dealership_id, status);

-- Schedule timeline sorting
CREATE INDEX IF NOT EXISTS idx_test_drives_dealership_scheduled_at
  ON public.test_drives(dealership_id, scheduled_at DESC);

-- ── 4. Sales Deals & Expenses Indexes ─────────────────────────────────────────
-- Deal status filtering and kanban board grouping
CREATE INDEX IF NOT EXISTS idx_sales_deals_dealership_status
  ON public.sales_deals(dealership_id, status);

-- Financial timeline sorting for P&L and sales ledger
CREATE INDEX IF NOT EXISTS idx_sales_deals_dealership_deal_date
  ON public.sales_deals(dealership_id, deal_date DESC);

-- Vehicle expenses ledger sorting
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_dealership_created_at
  ON public.vehicle_expenses(dealership_id, created_at DESC);

-- ── 5. Profiles & Staff Invites Indexes ──────────────────────────────────────
-- Active team roster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_dealership_status
  ON public.profiles(dealership_id, status);

-- Pending staff invitations list
CREATE INDEX IF NOT EXISTS idx_staff_invites_dealership_status
  ON public.staff_invites(dealership_id, status);

