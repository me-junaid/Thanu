# Engineering Specification & Implementation Plan
# FLEET INVENTORY MANAGEMENT (`/dashboard/inventory`)
# ORGETISE — PRE-OWNED AUTOMOBILE DEALERSHIP SAAS

---

## 1. Executive Summary & Domain Context

**Orgetise** is a commercial, multi-tenant SaaS built for independent pre-owned automobile dealerships. 
In accordance with our architectural constitution (`AGENTS.md`):
- **Single-Showroom Architecture**: Each subscribing dealership account manages exactly **ONE** dedicated showroom lot. No multi-branch switching, inter-branch logistics, or multi-lot transfers.
- **Strict Tenant Isolation**: All vehicle listings, purchase costs, margins, and inspection records belong strictly to the authenticated `dealership_id`.
- **Public Discovery vs. Private Economics**:
  - **Public Storefront** (`/inventory`, `dealership.domain.com`): Displays verified specifications, asking price, high-resolution media, certification badges, and direct inquiry/WhatsApp CTAs.
  - **Internal Fleet OS** (`/dashboard/inventory`): Gives the dealership owner, sales managers, and inventory executives a high-precision command center to track vehicle lifecycle (`draft` → `in_refurbishment` → `available` → `reserved` → `sold` → `archived`), procurement costs, refurbishment expenses, estimated gross margins, and document compliance.

---

## 2. Core Functional Requirements

### 2.1 Fleet Overview & Status Pipeline
1. **Inventory KPI Metrics**:
   - Total Fleet Count (e.g. 34 Cars)
   - Floor Available vs. Reserved vs. In-Refurbishment vs. Sold
   - Total Capital Invested (Procurement + Refurbishment)
   - Projected Total Fleet Realization & Estimated Gross Margin (%)
   - Average Lot Turnaround Time (Days on lot)
2. **Filtering, Search & Sorting**:
   - Search by Brand, Model, Variant, Registration Number, or VIN.
   - Filter by Lifecycle Status (`all`, `available`, `reserved`, `refurbishment`, `sold`).
   - Filter by Fuel Type (`Petrol`, `Diesel`, `Hybrid`, `Electric`), Transmission, and Price Range.
   - Sort by Date Acquired (Newest/Oldest), Asking Price (High/Low), Mileage (Low/High), Days in Stock.
3. **Dual View Modes**:
   - **Data Grid / Table View**: High-density operational view with column toggling (Photo, Spec, Status, Procurement Cost, Asking Price, Margin, Days on Floor, Actions).
   - **Showroom Lot Card View**: Visual showroom grid highlighting hero imagery, key specs, certification badge, and quick actions.

### 2.2 Vehicle Creation & Editing Flow (`Add Vehicle` Modal / Wizard)
Multi-tab modal designed for precision data entry:
1. **General Specs**: Brand, Model, Variant, Manufacturing Year, Registration Year, Registration State & Plate Number, Kilometres Driven, Ownership (1st, 2nd, 3rd+), Exterior/Interior Color, Transmission, Fuel Type, Body Type.
2. **Pricing & Private Economics (RBAC Restricted)**:
   - Procurement / Purchase Price
   - Acquisition Date & Seller Info
   - Estimated Refurbishment & Detailing Cost
   - Minimum Floor Price (Acceptable Negotiation Bottom)
   - Public Asking Price (Listing Price)
   - Calculated Gross Margin: `(Asking Price - Purchase Price - Refurbishment Cost)`
3. **Media & Inspection**:
   - Hero cover image + Gallery images (with drag/drop re-ordering).
   - 150-point inspection checklist summary (Tyres, Engine, Suspension, Transmission, Electronics).
   - Certification tag toggle (`Orgetise Certified`, `Single Owner Verified`).
4. **Publishing Status**:
   - Draft (Private staging), Available (Live on digital storefront), In Refurbishment, Reserved.

### 2.3 Individual Vehicle Action Drawer / Detail Sheet
Clicking a vehicle opens an inspection drawer without leaving the inventory page:
- **Vehicle Dossier**: High-res gallery preview, detailed specifications.
- **Direct Storefront Link**: Quick link to view vehicle on the public dealership website.
- **Status Transition Guard**: One-click quick status change (`Available` ↔ `Reserved` ↔ `Mark Sold`) with confirmation guard.
- **Cost Breakdown**: Capital breakdown only visible to authorized roles (`owner`, `inventory_manager`).
- **Lead Matching**: Displays leads in the CRM currently interested in this exact car.

---

## 3. Database Schema Design (PostgreSQL / Supabase)

To support full multi-tenancy and single-showroom inventory, we create the `vehicles` and `vehicle_media` tables under the `public` schema:

```sql
-- ────────────────────────────────────────────────────────────────────
-- VEHICLES TABLE
-- ────────────────────────────────────────────────────────────────────
CREATE TYPE vehicle_status AS ENUM (
  'draft',
  'in_refurbishment',
  'available',
  'reserved',
  'sold',
  'archived'
);

CREATE TYPE vehicle_fuel_type AS ENUM (
  'petrol',
  'diesel',
  'hybrid',
  'electric',
  'cng'
);

CREATE TYPE vehicle_transmission AS ENUM (
  'manual',
  'automatic',
  'dual_clutch',
  'pdk'
);

CREATE TYPE vehicle_body_type AS ENUM (
  'coupe',
  'sedan',
  'suv',
  'hatchback',
  'convertible',
  'wagon'
);

CREATE TABLE public.vehicles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id        uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  
  -- Core Specifications
  brand                text NOT NULL,                   -- e.g. "Porsche"
  model                text NOT NULL,                   -- e.g. "911 Carrera S"
  variant              text,                            -- e.g. "Coupe (992)"
  manufacturing_year   smallint NOT NULL,               -- e.g. 2023
  registration_year    smallint NOT NULL,               -- e.g. 2023
  registration_number  text,                            -- e.g. "KA 01 MJ 9999" (can be masked publicly)
  vin                  text,                            -- Vehicle Identification Number
  
  -- Technical Attributes
  fuel_type            vehicle_fuel_type NOT NULL DEFAULT 'petrol',
  transmission         vehicle_transmission NOT NULL DEFAULT 'automatic',
  body_type            vehicle_body_type NOT NULL DEFAULT 'sedan',
  kilometers           integer NOT NULL DEFAULT 0,
  ownership_count      smallint NOT NULL DEFAULT 1,      -- 1 = First Owner
  exterior_color       text,
  interior_color       text,
  
  -- Public Listing Details
  asking_price         bigint NOT NULL,                 -- Stored in INR Minor Units (paise) or Integer INR
  featured             boolean NOT NULL DEFAULT false,
  certified            boolean NOT NULL DEFAULT true,
  description          text,
  
  -- Private Procurement & Economics (Restricted to Owner/Finance)
  purchase_price       bigint,                          -- Internal purchase cost
  refurbishment_cost   bigint DEFAULT 0,                -- Detailing, repair, mechanical service costs
  minimum_floor_price  bigint,                          -- Bottom line negotiation limit
  acquisition_date     date DEFAULT CURRENT_DATE,
  acquired_from        text,                            -- Individual Seller, Corporate Lease, Trade-in
  internal_notes       text,
  
  -- Lifecycle & Visibility
  status               vehicle_status NOT NULL DEFAULT 'available',
  published_at         timestamptz,
  sold_at              timestamptz,
  sold_price           bigint,
  
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX vehicles_dealership_idx ON public.vehicles(dealership_id);
CREATE INDEX vehicles_status_idx ON public.vehicles(dealership_id, status);
CREATE INDEX vehicles_brand_model_idx ON public.vehicles(dealership_id, brand, model);

-- ────────────────────────────────────────────────────────────────────
-- VEHICLE MEDIA TABLE
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE public.vehicle_media (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id  uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  vehicle_id     uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  url            text NOT NULL,
  is_hero        boolean NOT NULL DEFAULT false,
  sort_order     smallint NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX vehicle_media_vehicle_idx ON public.vehicle_media(vehicle_id, sort_order);

-- ────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_media ENABLE ROW LEVEL SECURITY;

-- 1. Dealership members can view their own vehicles
CREATE POLICY "Members can view dealership vehicles"
  ON public.vehicles FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

-- 2. Dealership members can insert vehicles into their showroom
CREATE POLICY "Members can insert dealership vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (dealership_id = public.get_my_dealership_id());

-- 3. Dealership members can update vehicles in their showroom
CREATE POLICY "Members can update dealership vehicles"
  ON public.vehicles FOR UPDATE
  USING (dealership_id = public.get_my_dealership_id());

-- 4. Only owner/admin can delete vehicles
CREATE POLICY "Owner can delete dealership vehicles"
  ON public.vehicles FOR DELETE
  USING (dealership_id = public.get_my_dealership_id() AND public.is_dealership_owner() = true);

-- Public Storefront Access (Read-only for published/available vehicles)
CREATE POLICY "Public storefront can view available vehicles"
  ON public.vehicles FOR SELECT
  TO anon
  USING (status = 'available');
```

---

## 4. UI/UX Architecture & Component Structure

Follows the Orgetise design standards:
- Typography: Sans-serif high-clarity typography with serif headlines for luxury branding.
- Restrained color palette (neutral 950 slate, warm cream backgrounds `#FDFBF7`, emerald tags for available stock, amber tags for reserved stock).
- Currency representation: Strictly Indian Rupee formatting (`₹1,85,00,000` / `₹1.85 Cr`).

### 4.1 Component Directory Structure (`apps/web/`)
```
apps/web/
├── app/
│   └── dashboard/
│       └── inventory/
│           ├── page.tsx               # Server Component (data fetching & initial render)
│           ├── actions.ts             # Server Actions (CRUD, status changes, validation)
│           └── loading.tsx            # High-fidelity skeleton loader
├── components/
│   └── inventory/
│       ├── inventory-shell.tsx         # Client root orchestrating filter/view state
│       ├── inventory-header.tsx        # Title, KPI summary cards, 'Add Vehicle' button
│       ├── inventory-toolbar.tsx       # Search bar, status pill filters, view toggle (grid/table)
│       ├── inventory-table.tsx         # Desktop high-density tabular view
│       ├── inventory-grid.tsx          # Card-based showroom floor view
│       ├── inventory-empty-state.tsx   # Zero inventory / zero search results screen
│       ├── vehicle-drawer.tsx          # Slide-over quick inspection sheet
│       ├── vehicle-status-badge.tsx    # Standardized color-coded status pills
│       └── modals/
│           ├── add-vehicle-modal.tsx   # Multi-tab vehicle creation dialog
│           └── delete-vehicle-dialog.tsx# Confirmation dialog
```

---

## 5. Security & Access Control (RBAC)

In compliance with `AGENTS.md` Section 6 & Section 14:
1. **Private Financial Isolation**:
   - `purchase_price`, `refurbishment_cost`, and calculated `profit_margin` are strictly omitted from public storefront endpoints.
   - On `/dashboard/inventory`, if a logged-in staff member has role `sales_executive` or `viewer`, private purchase costs and profit margins are masked (`••••••` or hidden), accessible only to `owner` and `accountant`.
2. **Server-Side Validation with Zod**:
   - All vehicle mutations are validated with `vehicleCreateSchema` and `vehicleUpdateSchema`.
   - Never trust frontend values. Validate that `asking_price >= 0` and `kilometers >= 0`.

---

## 6. Phased Implementation Roadmap

### Phase 1: Database Migration & Shared Types
- Create migration `20261104000003_create_vehicles.sql`.
- Update `packages/supabase/src/types.ts` with `vehicles` and `vehicle_media`.
- Seed 8 luxury pre-owned cars for demonstration (Porsche, Mercedes, BMW, Audi, Land Rover).

### Phase 2: Server Actions & Data Access Layer
- Implement `getInventoryAction`: Fetch vehicles with search, filtering, and pagination for the user's `dealership_id`.
- Implement `createVehicleAction`: Insert validated vehicle with current `dealership_id`.
- Implement `updateVehicleStatusAction`: Rapid status transition (`available` ↔ `reserved` ↔ `sold`).
- Implement `deleteVehicleAction`: Guarded deletion restricted to showroom owner.

### Phase 3: Core UI Development
- Build `inventory-shell.tsx` with reactive filter pills, search input, and view toggles.
- Build `inventory-table.tsx` with sorting, responsive layouts, and quick-action menus.
- Build `inventory-grid.tsx` for showroom lot presentation.
- Build `vehicle-drawer.tsx` for zero-reload detail inspection.

### Phase 4: Add / Edit Vehicle Modal
- Form with validation for Brand, Model, Variant, Year, Price, Km, Fuel, and Transmission.
- Optional media URL attachment with preview thumbnail.

### Phase 5: Verification & Quality Gates
- Execute `pnpm --filter web check-types` (0 errors).
- Execute `pnpm --filter web build` (successful compilation).
- Verify tenant isolation: Verify user only sees vehicles belonging to their `dealership_id`.

