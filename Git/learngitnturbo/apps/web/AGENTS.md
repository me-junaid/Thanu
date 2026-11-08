# FRONTEND DEVELOPMENT INSTRUCTIONS

**File:** `apps/web/AGENTS.md`  
**Application:** Dealership SaaS — Frontend  
**Organization:** Orgetise Technologies Pvt. Ltd.  
**Framework:** Next.js App Router  
**Language:** TypeScript  
**Status:** Mandatory development instructions

---

# 1. Purpose

This document defines the mandatory frontend development standards for the dealership SaaS platform.

Every AI coding agent, developer or automated coding tool working inside `apps/web` must follow these instructions.

The frontend must be developed as a production-grade, multi-tenant SaaS application—not as a collection of disconnected pages or a temporary prototype.

The application must support:

- Platform administration.
- Dealership administration.
- Dealership employee dashboards.
- Inventory management.
- CRM and lead management.
- Sales and purchase operations.
- Customer-facing dealership websites.
- Subscription and billing interfaces.
- Multiple dealerships with independent branding and data.

The frontend must be scalable, maintainable, accessible, responsive and secure.

# 2. Mandatory documentation

Before modifying any frontend code, read:

1. `/AGENTS.md`
2. `/docs/ARCHITECTURE.md`
3. `/docs/DATABASE.md`
4. `/docs/SECURITY.md`
5. `/apps/web/AGENTS.md`

If the repository contains additional documentation relevant to the task, read it as well.

Do not assume the documentation perfectly describes the current implementation. Inspect the existing code and identify differences before making changes.

If documentation conflicts with the implementation or another instruction:

- Do not silently choose an approach.
- Identify the conflict.
- Explain its implications.
- Follow the established repository-level decision or request clarification when necessary.
- Update documentation when an approved architectural decision changes.

# 3. Core development principles

Every implementation must follow these principles:

1. Type safety.
2. Component reusability.
3. Separation of concerns.
4. Consistent design language.
5. Responsive-first implementation.
6. Accessibility.
7. Performance optimization.
8. Secure data handling.
9. Predictable state management.
10. Maintainable folder structure.
11. Minimal unnecessary dependencies.
12. Production-quality error handling.

Do not sacrifice maintainability for a quick visual result.

Avoid unnecessary abstractions, but do not duplicate substantial business logic across multiple pages.

# 4. Technology stack

Use the technologies already established in the repository.

Expected frontend stack:

| Technology | Responsibility |
|---|---|
| Next.js | Application framework |
| React | UI rendering |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase Auth | Authentication |
| NestJS API | Backend communication |
| React Hook Form | Form management, when adopted |
| Zod | Schema validation, when adopted |
| TanStack Query | Server-state management, when adopted |
| Zustand | Client-state management, when adopted |
| Lucide React | Icons, when adopted |

These are architectural preferences, not permission to install every package immediately.

Before adding a dependency:

1. Inspect `package.json`.
2. Check whether an existing dependency already solves the problem.
3. Consider bundle size and maintenance.
4. Confirm compatibility with the existing Next.js version.
5. Add the dependency only when justified.

Never upgrade major framework versions or replace established libraries without approval.

# 5. Next.js architecture

## 5.1 App Router

Use the Next.js App Router.

Organize routes according to their application responsibility.

Suggested structure:

```text
apps/web/
├── public/
│
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   ├── pricing/
│   │   │   └── features/
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (platform)/
│   │   │   └── platform/
│   │   │       ├── dashboard/
│   │   │       ├── tenants/
│   │   │       ├── subscriptions/
│   │   │       └── settings/
│   │   │
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── overview/
│   │   │       ├── inventory/
│   │   │       ├── leads/
│   │   │       ├── customers/
│   │   │       ├── sales/
│   │   │       ├── purchases/
│   │   │       ├── employees/
│   │   │       ├── branches/
│   │   │       ├── reports/
│   │   │       ├── billing/
│   │   │       └── settings/
│   │   │
│   │   ├── (storefront)/
│   │   │   └── ...
│   │   │
│   │   ├── api/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── data-display/
│   │   ├── feedback/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── inventory/
│   │   ├── crm/
│   │   ├── customers/
│   │   ├── sales/
│   │   ├── purchases/
│   │   ├── employees/
│   │   ├── branches/
│   │   ├── reports/
│   │   ├── billing/
│   │   └── settings/
│   │
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── tenant/
│   │   ├── utils/
│   │   └── validations/
│   │
│   ├── providers/
│   ├── stores/
│   ├── types/
│   └── config/
│
├── tests/
├── .env.example
├── next.config.ts
├── package.json
└── AGENTS.md
```

This is a proposed organizational structure. Inspect the current repository before creating or moving folders.

Do not restructure the entire application simply to match this example.

## 5.2 Route groups

Use route groups to separate application layouts without unnecessarily changing URL paths.

Examples:

- `(marketing)` — public product website.
- `(auth)` — authentication pages.
- `(platform)` — Orgetise platform administration.
- `(dashboard)` — dealership dashboard.
- `(storefront)` — customer-facing dealership websites.

Avoid creating duplicate route hierarchies or conflicting dynamic routes.

## 5.3 Server Components by default

Use React Server Components by default.

Use Client Components only when browser-side interactivity is required.

Examples requiring Client Components:

- Interactive forms.
- Modals and dialogs.
- Dropdown menus.
- Data tables with interactive controls.
- Client-side filters.
- Drag-and-drop.
- Browser-specific APIs.
- Interactive charts.
- Local UI state.

Do not add `"use client"` to an entire page or layout when only one small component needs interactivity.

Keep the client boundary as small as practical.

## 5.4 Server-side and client-side responsibilities

Server-side responsibilities:

- Initial data fetching when appropriate.
- Server-only configuration.
- Secure session verification.
- Rendering public content.
- Preparing serializable props.
- Metadata generation.

Client-side responsibilities:

- Interactive UI.
- Form input.
- Local component state.
- Browser events.
- User-triggered mutations.
- Interactive filters and controls.

Never expose private server configuration or secrets through serialized props.

# 6. Component architecture

## 6.1 Component categories

Use four primary categories.

### A. UI components

Reusable low-level interface components:

```text
components/ui/
├── button.tsx
├── input.tsx
├── select.tsx
├── checkbox.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── badge.tsx
├── avatar.tsx
├── skeleton.tsx
└── tooltip.tsx
```

### B. Layout components

Application-level structural components:

```text
components/layout/
├── dashboard-shell.tsx
├── dashboard-sidebar.tsx
├── dashboard-header.tsx
├── mobile-navigation.tsx
├── page-header.tsx
└── content-container.tsx
```

### C. Feature components

Business-specific components:

```text
features/inventory/components/
├── vehicle-card.tsx
├── vehicle-table.tsx
├── vehicle-form.tsx
├── vehicle-filters.tsx
├── vehicle-gallery.tsx
└── vehicle-status-badge.tsx
```

### D. Shared components

Components reused across multiple features:

```text
components/shared/
├── confirm-dialog.tsx
├── search-input.tsx
├── empty-state.tsx
├── error-state.tsx
├── loading-state.tsx
└── permission-gate.tsx
```

## 6.2 Component rules

- Keep components focused on one responsibility.
- Extract reusable logic when it improves clarity.
- Avoid extremely large component files.
- Avoid deeply nested conditional rendering.
- Use composition instead of excessive boolean props.
- Avoid duplicate implementations of the same UI pattern.
- Use clear and descriptive names.
- Keep business logic outside purely presentational components.
- Do not create abstractions that make simple code harder to understand.

Prefer:

```tsx
<VehicleTable
  vehicles={vehicles}
  onEdit={handleEdit}
  onView={handleView}
/>
```

Avoid passing unrelated application-wide state through many levels of components.

# 7. Design system and UI standards

The product must maintain a consistent, premium and professional design system.

The visual direction should be inspired by Apple's design principles:

- Clean layouts.
- Strong visual hierarchy.
- Generous spacing.
- Refined typography.
- Purposeful animations.
- Minimal visual noise.
- Consistent interaction patterns.
- High-quality imagery.
- Clear feedback.
- Responsive composition.

Do not directly copy Apple's proprietary interfaces or assets.

## 7.1 Design tokens

Centralize design tokens.

Define consistent values for:

- Colors.
- Typography.
- Spacing.
- Border radius.
- Shadows.
- Borders.
- Breakpoints.
- Z-index layers.
- Animation durations.

Use CSS variables and the existing Tailwind configuration where appropriate.

Do not scatter unrelated hardcoded colors throughout components.

## 7.2 Color system

Maintain semantic colors:

```text
background
foreground
card
muted
muted-foreground
primary
primary-foreground
secondary
accent
destructive
border
input
ring
success
warning
info
```

Use semantic colors rather than assigning colors based on individual component preferences.

## 7.3 Typography

- Establish a consistent type scale.
- Use a readable body font.
- Maintain appropriate heading hierarchy.
- Avoid excessive font sizes.
- Avoid unnecessary font-weight variation.
- Ensure text contrast is accessible.
- Use tabular numbers for financial and dashboard metrics where appropriate.

## 7.4 Spacing and layout

Use a consistent spacing scale.

Avoid arbitrary margin and padding values unless a design requires them.

Maintain alignment across:

- Page headers.
- Cards.
- Forms.
- Tables.
- Dialogs.
- Sidebar navigation.
- Dashboard sections.

## 7.5 Icons

Use one consistent icon library.

Do not mix multiple icon libraries without a clear reason.

Icons must:

- Have consistent visual weight.
- Have appropriate dimensions.
- Include accessible labels when they communicate meaning.
- Avoid unnecessary decorative usage.

## 7.6 Animation

Use animation to improve interaction clarity.

Examples:

- Dialog transitions.
- Dropdown appearance.
- Sidebar expansion.
- Loading transitions.
- Page-level feedback.

Requirements:

- Avoid excessive movement.
- Respect reduced-motion preferences.
- Avoid animations that block interaction.
- Prefer lightweight CSS animations where sufficient.
- Do not add large animation libraries without justification.

# 8. Responsive design

All pages must work across:

- Mobile phones.
- Tablets.
- Laptops.
- Desktop monitors.
- Large desktop screens.

Use a mobile-first approach.

## 8.1 Responsive requirements

- No unintended horizontal scrolling.
- No clipped primary actions.
- Navigation must adapt to screen size.
- Forms must remain usable on mobile.
- Tables must provide a usable mobile presentation.
- Dialogs must fit smaller screens.
- Images must maintain appropriate aspect ratios.
- Touch targets must be sufficiently large.
- Important content must not disappear on smaller screens.

## 8.2 Dashboard behavior

Desktop:

- Persistent or collapsible sidebar.
- Main content area.
- Dashboard header.
- Responsive data tables.

Mobile:

- Compact header.
- Drawer or mobile navigation.
- Single-column content where appropriate.
- Scrollable or card-based data presentations.
- Full-width forms when appropriate.

Do not simply shrink desktop components to fit mobile.

Design appropriate mobile interaction patterns.

# 9. API integration

NestJS is the source of truth for application business logic.

The frontend must communicate with the backend through a centralized API layer.

## 9.1 Centralized API client

Create or use a shared API client.

Example:

```text
lib/api/
├── client.ts
├── endpoints.ts
├── error-handler.ts
└── types.ts
```

The API client should handle:

- Base URL configuration.
- Authentication headers or secure session forwarding.
- Request serialization.
- Response parsing.
- Error normalization.
- Request cancellation where appropriate.
- Consistent timeout handling.
- Request IDs where supported.

Do not create separate, inconsistent fetch implementations in every feature.

## 9.2 Environment variables

Use:

```text
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Only expose values intentionally designed for public browser access.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
```

These are server-only secrets.

The actual variable names must match the existing repository configuration.

## 9.3 API response types

Use TypeScript interfaces or types for API responses.

Example:

```typescript
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  sellingPrice: number;
  status: VehicleStatus;
}
```

Do not use `any` for API responses.

Do not assume an API response matches the expected type without validation when data crosses an untrusted boundary.

Use runtime schemas for critical external responses where appropriate.

## 9.4 API error handling

Handle:

- 400 — validation errors.
- 401 — authentication required or expired.
- 403 — insufficient permissions.
- 404 — resource not found.
- 409 — conflict.
- 422 — business-rule validation.
- 429 — rate limit.
- 500 — server error.
- Network failures.
- Timeout failures.

Display clear, user-friendly messages.

Never show raw database errors, stack traces or internal API responses to users.

## 9.5 Loading, empty and error states

Every data-driven feature must handle:

1. Loading.
2. Success with data.
3. Success with no data.
4. Error.
5. Unauthorized access.
6. Network interruption where relevant.

Do not leave users with a blank screen when an API request fails.

Use skeletons or other appropriate loading indicators instead of unnecessary full-page spinners.

# 10. State management

Use the simplest suitable state-management approach.

## 10.1 Local state

Use React state for:

- Modal visibility.
- Selected tabs.
- Temporary form state.
- Dropdown state.
- Local filters.
- Component-specific interactions.

## 10.2 Server state

Use the repository's established server-state solution.

If TanStack Query is adopted, use it consistently for:

- API fetching.
- Caching.
- Mutations.
- Refetching.
- Query invalidation.
- Optimistic updates where safe.

Do not duplicate server data unnecessarily in Zustand or another client store.

## 10.3 Global client state

Use a global store only when multiple unrelated components genuinely need shared client-side state.

Appropriate examples:

- Sidebar state.
- Active UI preferences.
- Temporary cross-component workflows.

Do not store sensitive authorization decisions in a client-side global store.

## 10.4 State synchronization

After mutations:

- Update the affected UI.
- Invalidate relevant queries.
- Handle failed mutations.
- Prevent duplicate submissions.
- Avoid stale data.
- Preserve user input when appropriate.

Do not optimistically update financial or irreversible operations unless rollback behavior is carefully designed.

# 11. Forms and validation

All forms must provide a consistent and reliable experience.

## 11.1 Form standards

- Use explicit labels.
- Provide meaningful placeholders.
- Display validation errors near fields.
- Validate required fields.
- Prevent duplicate submissions.
- Show submission progress.
- Provide success and failure feedback.
- Preserve user input after recoverable errors.
- Support keyboard navigation.
- Ensure mobile usability.

## 11.2 Validation

Use a shared schema approach where appropriate.

Validate at multiple layers:

1. Frontend validation for user experience.
2. NestJS DTO validation for API security.
3. Database constraints for data integrity.

Frontend validation never replaces backend validation.

## 11.3 Financial values

Use correct formatting for INR.

Examples:

```text
₹5,50,000
₹12,75,000
₹45,000
```

Do not use floating-point arithmetic for financial calculations.

Follow the backend's monetary representation and API contract.

# 12. Authentication and authorization in the frontend

## 12.1 Authentication state

Implement a centralized authentication provider or session-management layer.

It must support:

- Current user.
- Session status.
- Login.
- Logout.
- Password reset.
- Session expiry.
- Authentication loading state.

Avoid separate, inconsistent authentication logic in individual pages.

## 12.2 Route protection

Protect private application routes.

Unauthenticated users should be redirected to the appropriate login page.

Authenticated users without required permissions should receive an appropriate forbidden state.

Do not rely solely on middleware or frontend route checks for security.

The NestJS API must enforce authentication and authorization independently.

## 12.3 Permission-aware UI

The UI may hide or disable controls based on permissions.

Examples:

- Hide vehicle deletion for users without delete permission.
- Disable employee invitation for users without invitation permission.
- Hide billing management from unauthorized roles.

However, every action must still be validated by NestJS.

A hidden button is not a security boundary.

## 12.4 Tenant context

The frontend may display the active dealership and allow authorized users to switch dealerships.

The backend must independently validate the selected tenant.

Never assume that changing a frontend tenant ID grants access to another dealership.

Do not store tenant authorization as a trusted browser-side value.

# 13. Multi-tenant frontend behavior

The frontend must support multiple dealerships using the same application codebase.

## 13.1 Dealership context

Resolve and display the correct dealership context using the backend's trusted tenant resolution.

Support:

- Platform-managed subdomains.
- Verified custom domains.
- Authenticated dealership dashboard context.
- Tenant-specific branding.
- Tenant-specific configuration.

## 13.2 Branding

A dealership may customize:

- Logo.
- Brand colors.
- Business name.
- Contact information.
- Website content.
- Public website appearance.

Branding values must be loaded from trusted tenant configuration.

Do not allow arbitrary tenant-controlled CSS or JavaScript to execute in the platform application.

## 13.3 Cache isolation

All tenant-specific cached data must be scoped correctly.

Never share private data across tenants through:

- React cache.
- Next.js caching.
- API response caching.
- Browser storage.
- Global application state.
- Static generation.

For tenant-specific dynamic content, ensure the tenant context is part of the cache key or disable shared caching where necessary.

Private dashboard responses must not be publicly cached.

## 13.4 Public dealership websites

Public vehicle listings must display only approved public fields.

Never expose:

- Purchase cost.
- Internal profit.
- Customer details.
- Private documents.
- Employee information.
- Internal notes.
- Private operational records.

Use dedicated public API response types.

# 14. Inventory frontend standards

Inventory is one of the primary product modules.

The UI should support:

- Vehicle listing.
- Vehicle details.
- Vehicle creation.
- Vehicle editing.
- Image uploads.
- Document management.
- Status updates.
- Search.
- Filters.
- Sorting.
- Pagination.
- Branch selection.
- Vehicle history.

## 14.1 Vehicle status

Use backend-defined statuses.

Potential statuses:

- draft
- available
- reserved
- sold
- archived

Do not independently define frontend status values that conflict with the backend.

## 14.2 Vehicle forms

Organize vehicle forms into clear sections:

- Basic information.
- Vehicle specifications.
- Pricing.
- Registration details.
- Condition and inspection.
- Features.
- Images.
- Documents.
- Publication settings.

Do not create one excessively long, unstructured form.

## 14.3 Image handling

- Preview images before submission.
- Show upload progress.
- Validate file type and size.
- Support image removal.
- Display upload errors.
- Prevent accidental duplicate uploads.
- Use optimized image rendering.
- Avoid loading unnecessarily large original images.

Private vehicle documents must never be displayed through public vehicle pages.

# 15. CRM frontend standards

CRM interfaces should prioritize speed, clarity and workflow efficiency.

Features may include:

- Lead overview.
- Lead list.
- Lead detail.
- Lead assignment.
- Lead activity history.
- Follow-ups.
- Test-drive scheduling.
- Customer profiles.
- Lead pipeline.

## 15.1 Lead stages

Use backend-defined stages, potentially:

- new
- contacted
- interested
- test_drive
- negotiation
- booked
- converted
- lost

Do not hardcode stage transitions without checking backend business rules.

## 15.2 CRM usability

- Make follow-up actions easy to find.
- Display lead ownership clearly.
- Display next follow-up dates.
- Provide clear status indicators.
- Preserve activity history.
- Prevent accidental data loss.
- Confirm destructive operations.

# 16. Dashboard and analytics

Dashboard components must be data-driven.

Do not hardcode business metrics in production.

Examples:

- Total inventory.
- Available vehicles.
- Sold vehicles.
- Active leads.
- Conversion rate.
- Revenue.
- Pending payments.
- Upcoming follow-ups.

Requirements:

- Use backend-calculated metrics for authoritative financial and business values.
- Display loading and error states.
- Use appropriate date ranges.
- Format INR consistently.
- Avoid misleading chart scales.
- Provide accessible chart descriptions.
- Respect the user's permissions and branch scope.

# 17. Accessibility

Target WCAG 2.2 AA where practical.

Requirements:

- Semantic HTML.
- Keyboard accessibility.
- Visible focus states.
- Appropriate color contrast.
- Accessible form labels.
- Screen-reader-friendly controls.
- Accessible dialog behavior.
- Descriptive image alternative text.
- Reduced-motion support.
- Clear validation messages.

Do not use clickable `<div>` elements when semantic buttons or links are appropriate.

Do not communicate important information through color alone.

# 18. Performance optimization

The application must remain responsive as inventory and customer data grow.

## 18.1 Rendering

- Prefer Server Components for static and server-renderable content.
- Avoid unnecessary Client Components.
- Avoid unnecessary re-renders.
- Use stable component keys.
- Split large components where useful.
- Use lazy loading for non-critical UI.

## 18.2 Images

Use Next.js image optimization where compatible with the storage and delivery architecture.

- Set appropriate image dimensions.
- Use responsive sizes.
- Lazy-load below-the-fold images.
- Prioritize important hero images.
- Avoid large image payloads.
- Use modern image formats where supported.

## 18.3 Data fetching

- Fetch only required fields.
- Use pagination for large lists.
- Avoid fetching all vehicles or leads at once.
- Debounce search input where appropriate.
- Cancel obsolete requests.
- Cache only data that is safe to cache.
- Avoid duplicate requests.

## 18.4 Bundle size

- Avoid unnecessary dependencies.
- Lazy-load heavy charting and editor libraries.
- Avoid importing entire libraries when smaller imports are available.
- Review bundle size after introducing major dependencies.

## 18.5 Performance targets

Treat these as initial engineering targets, not guarantees:

- LCP: 2.5 seconds or less.
- INP: 200 milliseconds or less.
- CLS: 0.1 or less.

Measure real performance before making optimization claims.

# 19. SEO and metadata

Public marketing and dealership pages must support search-engine optimization.

Implement:

- Page-specific titles.
- Meta descriptions.
- Canonical URLs.
- Open Graph metadata.
- Social sharing images.
- Sitemap generation.
- Robots directives.
- Structured data where appropriate.
- Correct heading hierarchy.

Private dashboard pages must not be indexed.

Do not expose customer information or private vehicle data through metadata.

Ensure canonical URLs reflect the correct dealership domain.

# 20. Error and feedback interfaces

Build reusable components for:

- Loading states.
- Empty states.
- Error states.
- Success messages.
- Confirmation dialogs.
- Permission-denied states.
- Not-found states.

Use consistent interaction patterns across modules.

Destructive operations must require appropriate confirmation.

Examples:

- Delete vehicle.
- Delete customer.
- Cancel sale.
- Remove employee.
- Disconnect integration.

Do not display success feedback before the backend confirms that an operation succeeded.

# 21. Testing requirements

Use the testing framework already established in the repository. If none exists, propose an appropriate setup before adding dependencies.

## 21.1 Unit tests

Test:

- Formatting utilities.
- Validation schemas.
- Permission-based UI helpers.
- Data transformation functions.
- Feature-specific hooks.
- Important component behavior.

## 21.2 Component tests

Test:

- Form validation.
- Modal behavior.
- Table interactions.
- Dropdown behavior.
- Loading states.
- Empty states.
- Error states.
- Responsive behavior where practical.

## 21.3 End-to-end tests

Use an appropriate browser automation framework if available.

Important flows:

- Login and logout.
- Password reset.
- Dealership switching.
- Vehicle creation.
- Vehicle editing.
- Vehicle publishing.
- Lead creation.
- Lead assignment.
- Follow-up creation.
- Sale creation.
- Employee invitation.
- Permission-restricted actions.
- Public dealership website browsing.

## 21.4 Security tests

Verify:

- Unauthenticated users cannot access private pages or APIs.
- Unauthorized users cannot execute restricted operations.
- Tenant data is never displayed across dealership contexts.
- Private data is not present in public API responses.
- Private documents cannot be downloaded without authorization.
- Browser bundles contain no privileged credentials.

# 22. Code quality standards

## 22.1 TypeScript

- Use strict TypeScript.
- Avoid `any`.
- Avoid unnecessary type assertions.
- Use explicit types for API boundaries.
- Prefer reusable types for shared contracts.
- Handle null and undefined values correctly.

## 22.2 Naming conventions

Use:

- PascalCase for React components.
- camelCase for variables and functions.
- kebab-case for file names where consistent with the repository.
- UPPER_SNAKE_CASE for constants where appropriate.
- Descriptive names for hooks beginning with `use`.

Examples:

```text
vehicle-card.tsx
vehicle-form.tsx
use-vehicles.ts
use-current-tenant.ts
vehicle.types.ts
```

Follow existing repository conventions if they differ.

## 22.3 Clean code

Avoid:

- Giant page components.
- Duplicated API logic.
- Excessive prop drilling.
- Unnecessary global state.
- Uncontrolled `any` types.
- Hardcoded production data.
- Unused imports.
- Dead components.
- Arbitrary timeout-based UI behavior.
- Silent error handling.
- Unnecessary dependency installation.

Do not leave unfinished TODOs in critical production flows without documenting them.

# 23. Development workflow for AI agents

Every task must follow this workflow.

## Step 1 — Understand

- Read mandatory documentation.
- Inspect the current folder structure.
- Identify existing components and patterns.
- Identify affected routes.
- Identify API dependencies.
- Identify tenant and permission requirements.
- Understand existing design tokens.

## Step 2 — Plan

Before coding, define:

- Files to create.
- Files to modify.
- Components required.
- API endpoints required.
- Types and validation schemas required.
- State-management requirements.
- Security considerations.
- Testing requirements.

For large changes, present the implementation plan for review before editing.

## Step 3 — Implement

- Follow existing architecture.
- Reuse existing components.
- Maintain type safety.
- Keep business logic separate from presentation.
- Implement loading, empty and error states.
- Ensure responsive behavior.
- Enforce permission-aware UI behavior.
- Avoid unnecessary dependencies.

## Step 4 — Verify

Run the relevant checks:

```bash
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build
```

These commands are expected examples. Inspect `package.json` and use the actual scripts available in the repository.

Do not claim a check passed unless it was executed successfully.

## Step 5 — Report

After implementation, report:

1. What was implemented.
2. Files created.
3. Files modified.
4. API dependencies.
5. Security considerations.
6. Tests executed.
7. Build and type-check results.
8. Remaining limitations or TODOs.

# 24. Strict prohibitions

AI coding agents must never:

- Rewrite the entire application without approval.
- Replace the established frontend stack without approval.
- Disable TypeScript checks to make a build pass.
- Use `any` to bypass type errors.
- Expose server secrets in browser code.
- Trust client-side tenant IDs for authorization.
- Trust frontend roles as security enforcement.
- Fetch unrestricted tenant data.
- Expose private business data on public pages.
- Disable security headers or authentication for convenience.
- Disable database RLS to make frontend features work.
- Introduce unapproved dependencies without justification.
- Hardcode fake business data in production flows.
- Ignore loading, empty or error states.
- Claim tests or builds passed without running them.
- Make unrelated changes while implementing a feature.
- Modify backend contracts without checking the backend implementation and documentation.

# 25. Definition of done

A frontend feature is complete only when:

- [ ] It follows the established application architecture.
- [ ] It uses reusable components where appropriate.
- [ ] It is fully typed.
- [ ] It uses the correct API contract.
- [ ] It handles loading states.
- [ ] It handles empty states.
- [ ] It handles errors.
- [ ] It handles unauthorized access.
- [ ] It respects tenant and branch boundaries.
- [ ] It is responsive.
- [ ] It meets accessibility requirements.
- [ ] It follows the design system.
- [ ] It has appropriate tests.
- [ ] Linting passes.
- [ ] Type checking passes.
- [ ] Production build passes.
- [ ] Relevant documentation is updated.

**Final rule:** Build every frontend feature as part of one cohesive, multi-tenant SaaS platform. Prioritize security, consistency, usability, maintainability and long-term scalability over quick implementation.