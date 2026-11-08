# Engineering Specification & Implementation Plan
# LEADS & INQUIRIES CRM PIPELINE (`/dashboard/leads`)
# ORGETISE — PRE-OWNED AUTOMOBILE DEALERSHIP SAAS

---

## 1. Executive Summary & Product Alignment

In pre-owned luxury automobile dealerships, lead velocity and disciplined follow-up dictate inventory turnover and gross margins. An unsold vehicle incurs carrying costs every single day it occupies floor space.

**Orgetise Leads & Inquiries CRM** is purpose-built for automotive dealerships:
- **Single-Showroom Architecture**: Every lead belongs strictly to the tenant's dedicated physical showroom lot (`dealership_id`). There is no multi-branch confusion.
- **Omnichannel Ingestion**: Captures incoming prospect inquiries from:
  1. **Public Storefront Inquiries** (Website vehicle detail inquiry forms).
  2. **WhatsApp Business Direct** (Click-to-chat inquiry leads).
  3. **Showroom Floor Walk-ins** (Visitors walking onto the dealership floor).
  4. **Direct Phone Desk Calls** (Inbound buyer calls).
- **Vehicle-Centric Engagement**: Unlike generic CRMs (HubSpot/Salesforce), every lead in Orgetise is intrinsically tied to a **specific certified vehicle** from the showroom's live inventory, tracking customer budget, financing needs, trade-in exchange interests, and test drive status.
- **Role-Based Workflows**:
  - **Dealership Owner / Sales Manager**: Full pipeline oversight, lead assignment/reassignment, conversion velocity metrics, lost deal post-mortems.
  - **Sales Executive**: Focused daily task queue ("Follow-ups Due Today", "Scheduled Test Drives", "Active Negotiations").

---

## 2. Core Functional Requirements

### 2.1 Omnichannel Automotive Sales Pipeline (8 Stages)
In accordance with `AGENTS.md` Section 10, the lead progression follows a structured automotive lifecycle:

1. **`new`** (Fresh Inquiry): Inbound inquiry from website/WhatsApp/phone awaiting first outreach (Target SLA: < 15 mins).
2. **`contacted`**: Sales executive has called or messaged; awaiting customer response.
3. **`interested`**: Prospect verified genuine; specs and vehicle history dossier shared.
4. **`test_drive_scheduled`**: Showroom appointment confirmed for vehicle evaluation.
5. **`negotiation`**: Price discussion, trade-in exchange valuation, or loan financing terms in progress.
6. **`booked`**: Token / reservation deposit received; vehicle marked `reserved` on showroom floor.
7. **`converted`**: Sale closed, delivery executed; vehicle marked `sold`.
8. **`lost`**: Deal dropped (lost to competitor, budget mismatch, vehicle sold to another buyer).

### 2.2 Dual Operational Views
- **Kanban Board View**: Drag-and-drop / column-based visual pipeline grouped by stage. Quick card snapshot shows Prospect Name, Vehicle Model & Thumbnail, Budget, Source Tag, Follow-up urgency, and Assigned Salesperson avatar.
- **Data Table View**: High-density operational grid for sales managers to filter, sort, search, and bulk-assign leads.

### 2.3 Comprehensive Lead Dossier & Activity Timeline (Drawer)
Clicking a lead opens a slide-over dossier without losing context:
- **Prospect Profile**: Name, Phone number, Email, Preferred contact channel (WhatsApp/Call).
- **Vehicle Interest**: Linked car (Photo, Spec, Asking Price), Trade-in vehicle details (if exchanging an old car), Financing needed (Yes/No, Down payment).
- **Communication Log & Activity Feed**: Append-only log of notes, call summaries, and automated system events (e.g. "Lead assigned to Rahul", "Test drive scheduled for 4:00 PM").
- **Quick Action Bar**: One-click WhatsApp message trigger, Call log dialog, Next Follow-up Date picker.

### 2.4 Lead Creation Modal ("New Inquiry / Walk-in")
Rapid data entry for showroom sales reps:
- Customer Name & Phone Number (Primary identity).
- Source Selection (`Website`, `WhatsApp`, `Showroom Walk-in`, `Phone Call`, `Referral`).
- Interested Vehicle Selector (Dropdown querying live `public.vehicles` with thumbnail preview).
- Budget Range & Financing requirement.
- Initial Sales Notes & Next Follow-up Date.

---

## 3. Database Schema Design (PostgreSQL / Supabase)

To enforce complete tenant isolation and lead history integrity, we introduce `leads` and `lead_activities` tables in `public`:

```sql
-- ────────────────────────────────────────────────────────────────────
-- LEADS & INQUIRIES SCHEMA
-- ────────────────────────────────────────────────────────────────────
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

CREATE TYPE lead_source AS ENUM (
  'website_form',
  'whatsapp_direct',
  'showroom_walkin',
  'phone_call',
  'referral',
  'other'
);

CREATE TYPE lead_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TABLE public.leads (
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
  budget_amount          bigint,                         -- In INR
  financing_required     boolean NOT NULL DEFAULT false,
  trade_in_vehicle       text,                           -- e.g. "2018 Honda City ZX"
  
  -- Assignment & Scheduling
  assigned_to            uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  next_followup_at       timestamptz,
  lost_reason            text,                           -- Captured when status = 'lost'
  
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX leads_dealership_idx ON public.leads(dealership_id);
CREATE INDEX leads_status_idx ON public.leads(dealership_id, status);
CREATE INDEX leads_assigned_idx ON public.leads(dealership_id, assigned_to);
CREATE INDEX leads_followup_idx ON public.leads(dealership_id, next_followup_at);

-- ────────────────────────────────────────────────────────────────────
-- LEAD ACTIVITY & INTERACTION HISTORY TABLE
-- ────────────────────────────────────────────────────────────────────
CREATE TYPE lead_activity_type AS ENUM (
  'status_change',
  'note_added',
  'call_logged',
  'whatsapp_sent',
  'test_drive_booked',
  'assignment_change'
);

CREATE TABLE public.lead_activities (
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

CREATE INDEX lead_activities_lead_idx ON public.lead_activities(lead_id, created_at DESC);

-- ────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- 1. Dealership members can view their showroom's leads
CREATE POLICY "Members can view dealership leads"
  ON public.leads FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

-- 2. Public / Storefront can insert new inquiries
CREATE POLICY "Public website can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- 3. Dealership staff can update leads in their showroom
CREATE POLICY "Members can update dealership leads"
  ON public.leads FOR UPDATE
  USING (dealership_id = public.get_my_dealership_id());

-- 4. Owners can delete leads
CREATE POLICY "Owners can delete leads"
  ON public.leads FOR DELETE
  USING (
    dealership_id = public.get_my_dealership_id()
    AND public.is_dealership_owner() = true
  );

-- Lead Activities Policies
CREATE POLICY "Members can view lead activities"
  ON public.lead_activities FOR SELECT
  USING (dealership_id = public.get_my_dealership_id());

CREATE POLICY "Members can insert lead activities"
  ON public.lead_activities FOR INSERT
  WITH CHECK (dealership_id = public.get_my_dealership_id());
```

---

## 4. UI/UX Architecture & Component Structure

Matching Orgetise's luxury automotive design language (warm cream backgrounds `#FDFBF7`, obsidian accents, emerald/amber/blue status tokens, and KaTeX-free clean typography):

```
apps/web/
├── app/
│   └── dashboard/
│       └── leads/
│           ├── page.tsx                 # Server Component (auth check, initial load)
│           ├── actions.ts               # Server Actions (CRUD, stage transitions, notes)
│           └── loading.tsx              # Skeleton loader
├── components/
│   └── leads/
│       ├── leads-shell.tsx              # State orchestrator (Kanban vs Table, filters)
│       ├── leads-header.tsx             # KPI metrics (Active Leads, Follow-ups Due, Hot Inquiries)
│       ├── leads-toolbar.tsx            # Search bar, Stage tabs, Source dropdown, Priority filter
│       ├── leads-kanban.tsx             # 8-column drag/click pipeline board
│       ├── leads-table.tsx              # High-density operational grid view
│       ├── lead-card.tsx                # Compact prospect card with vehicle tag
│       ├── lead-status-badge.tsx        # Standardized stage indicator
│       ├── lead-drawer.tsx              # Full dossier slide-over (Customer info, history timeline)
│       └── modals/
│           ├── create-lead-modal.tsx    # "New Inquiry / Walk-in" modal
│           └── log-activity-modal.tsx   # Add note / call summary dialog
```

---

## 5. Security & RBAC Enforcements

In compliance with `AGENTS.md` Section 6:
1. **Sales Rep Scoping**:
   - `owner` and `sales_manager`: Can view all leads in the showroom, assign leads, and change priority.
   - `sales_executive`: Default view filters to "My Assigned Leads", with ability to view unassigned pool.
2. **Contact Protection**:
   - Customer phone numbers and personal emails are never exposed over public APIs.
   - Lead activities cannot be edited or backdated once written to preserve audit authenticity.

---

## 6. Phased Implementation Roadmap

### Phase 1: Database Migration & Schema Setup
- Create migration `20261104000004_create_leads.sql`.
- Update `packages/supabase/src/types.ts` with `leads` and `lead_activities`.
- Seed 8 realistic luxury car buyer leads (Porsche Carrera inquiry, Mercedes-AMG walk-in, BMW test drive scheduled) tied to existing seeded inventory.

### Phase 2: Server Actions & Business Logic Layer
- `getLeadsAction(options)`: Fetch leads with vehicle and salesperson joins, KPI computations.
- `createLeadAction(input)`: Validated inquiry insertion with activity logging.
- `updateLeadStatusAction(leadId, status)`: Stage progression with automatic timeline audit record.
- `assignLeadAction(leadId, userId)`: Salesperson delegation.
- `addLeadNoteAction(leadId, note)`: Call notes and follow-up updates.

### Phase 3: Core UI & Kanban / Table Views
- Build `leads-header.tsx` with KPI overview (Active Inquiries, Test Drives Pending, Today's Follow-ups).
- Build `leads-kanban.tsx` with stage columns and interactive cards.
- Build `leads-table.tsx` with sorting, search, and direct WhatsApp buttons.
- Build `leads-shell.tsx` coordinating view toggling and search state.

### Phase 4: Lead Dossier Drawer & Interaction History
- Build `lead-drawer.tsx` with customer specs, linked vehicle summary, quick follow-up date picker, and timeline activity history.
- Build `create-lead-modal.tsx` with live car dropdown.

### Phase 5: Verification & Quality Gates
- Execute `pnpm --filter web check-types` (0 errors).
- Execute `pnpm --filter web build` (clean Turbopack compilation).
- Verify tenant isolation: Verify users only access inquiries belonging to their dedicated showroom.

