# BACKEND DEVELOPMENT INSTRUCTIONS

**File:** `apps/api/AGENTS.md`  
**Application:** Dealership SaaS — Backend API  
**Organization:** Orgetise Technologies Pvt. Ltd.  
**Framework:** NestJS  
**Language:** TypeScript  
**Database:** PostgreSQL / Supabase  
**Authentication:** Supabase Auth  
**Status:** Mandatory development instructions

---

# 1. Purpose

This document defines the mandatory backend development standards for the multi-tenant pre-owned automobile dealership SaaS platform.

Every AI coding agent, developer or automated coding tool working inside `apps/api` must follow these instructions.

The backend must be designed as a production-grade, secure, modular and scalable SaaS API.

It is responsible for:

- Authentication verification.
- Tenant resolution.
- Membership validation.
- Role-based access control.
- Branch-level authorization.
- Business logic.
- Database operations.
- Inventory management.
- CRM and lead management.
- Customer management.
- Vehicle purchases and sales.
- Financial calculations.
- Employee management.
- Subscription enforcement.
- Payment processing.
- File access authorization.
- Notifications and integrations.
- Audit logging.
- Platform administration.

The backend is the source of truth for business rules and application data.

# 2. Mandatory documentation

Before modifying backend code, read:

1. `/AGENTS.md`
2. `/docs/ARCHITECTURE.md`
3. `/docs/DATABASE.md`
4. `/docs/SECURITY.md`
5. `/apps/api/AGENTS.md`

Also inspect relevant frontend contracts, database migrations and feature documentation when necessary.

Do not assume documentation accurately reflects the current implementation. Inspect the repository and database schema before making changes.

If an implementation conflicts with approved documentation:

- Identify the conflict.
- Explain its impact.
- Propose a correction.
- Do not silently change architectural decisions.
- Update the relevant documentation after an approved change.

# 3. Backend architecture

Use NestJS with a modular architecture.

Separate responsibilities into:

1. Controllers.
2. Services.
3. DTOs.
4. Guards.
5. Decorators.
6. Repositories or data-access services.
7. Entities and domain types where appropriate.
8. Interceptors.
9. Filters.
10. Background jobs and integrations.

## 3.1 Architecture flow

```text
HTTP Request
     |
     v
Middleware
     |
     v
Authentication Guard
     |
     v
Tenant Resolution Guard
     |
     v
Membership Validation
     |
     v
Permission Guard
     |
     v
Controller
     |
     v
DTO Validation
     |
     v
Application Service
     |
     v
Data Access Layer
     |
     v
PostgreSQL + RLS
     |
     v
HTTP Response
```

The exact order of guards and pipes must be implemented according to NestJS lifecycle behavior. Ensure that tenant context is available before any operation that requires it.

Business logic must not live inside controllers.

# 4. Technology standards

Use the existing repository stack.

Expected backend technologies:

| Technology | Responsibility |
|---|---|
| NestJS | Backend framework |
| TypeScript | Programming language |
| PostgreSQL | Relational database |
| Supabase | Managed database and authentication infrastructure |
| Supabase Auth | Identity provider |
| Redis | Caching, distributed rate limiting and background jobs where needed |
| BullMQ | Background job processing where adopted |
| Swagger / OpenAPI | API documentation |
| Jest | Unit and integration testing |

Do not introduce every technology immediately.

Before adding a package:

1. Inspect the existing dependencies.
2. Check whether the functionality already exists.
3. Evaluate maintenance and security.
4. Check compatibility.
5. Explain why the dependency is required.

Do not replace the database, ORM or query layer without architectural approval.

# 5. Project structure

Use a feature-oriented modular architecture.

Suggested structure:

```text
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── middleware/
│   │   ├── pipes/
│   │   ├── exceptions/
│   │   ├── interfaces/
│   │   └── utils/
│   │
│   ├── config/
│   │   ├── configuration.ts
│   │   ├── validation.ts
│   │   └── database.config.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── supabase/
│   │   ├── redis/
│   │   ├── storage/
│   │   ├── payments/
│   │   └── email/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── tenants/
│   │   ├── memberships/
│   │   ├── permissions/
│   │   ├── branches/
│   │   ├── employees/
│   │   ├── inventory/
│   │   ├── customers/
│   │   ├── crm/
│   │   ├── purchases/
│   │   ├── sales/
│   │   ├── commissions/
│   │   ├── reports/
│   │   ├── subscriptions/
│   │   ├── billing/
│   │   ├── notifications/
│   │   ├── integrations/
│   │   ├── audit/
│   │   └── platform-admin/
│   │
│   ├── jobs/
│   ├── health/
│   └── database/
│       ├── migrations/
│       └── seeds/
│
├── test/
├── .env.example
├── nest-cli.json
├── package.json
└── AGENTS.md
```

This is a proposed structure. Inspect the current codebase before creating or moving folders.

Do not create empty modules for every feature in advance. Implement modules when their responsibilities are defined.

# 6. Module architecture

Each business module must own its domain-specific business logic.

Example:

```text
modules/inventory/
├── inventory.module.ts
├── inventory.controller.ts
├── inventory.service.ts
├── inventory.repository.ts
├── dto/
│   ├── create-vehicle.dto.ts
│   ├── update-vehicle.dto.ts
│   ├── query-vehicles.dto.ts
│   └── update-vehicle-status.dto.ts
├── interfaces/
├── types/
└── tests/
```

## 6.1 Controller responsibilities

Controllers must:

- Define HTTP routes.
- Receive validated input.
- Read authenticated user context.
- Read trusted tenant context.
- Call application services.
- Return appropriate responses.
- Apply relevant API decorators.

Controllers must not:

- Contain complex business logic.
- Execute large SQL queries directly.
- Calculate financial totals.
- Implement tenant authorization independently.
- Access arbitrary tables without domain services.

## 6.2 Service responsibilities

Services contain business rules.

Examples:

`InventoryService`:

- Create vehicles.
- Update vehicles.
- Publish listings.
- Change vehicle status.
- Validate branch access.
- Prevent invalid operations.
- Coordinate inventory history.

`SalesService`:

- Validate vehicle availability.
- Create sales.
- Calculate totals.
- Record payments.
- Enforce sale lifecycle rules.
- Coordinate vehicle status changes.

Services must remain focused on their domain.

## 6.3 Repository responsibilities

Use a repository or dedicated data-access service where it provides meaningful separation.

Responsibilities:

- Database queries.
- Filtering.
- Pagination.
- Data mapping.
- Tenant-scoped record retrieval.
- Transaction execution.

Do not create unnecessary repository abstractions that simply duplicate an ORM or database client's functionality.

Every data-access operation must preserve tenant and permission boundaries.

# 7. Authentication

## 7.1 Supabase Auth integration

Supabase Auth is the identity provider.

NestJS must verify access tokens before allowing private API operations.

Do not implement custom password hashing or token generation without an approved architectural decision.

## 7.2 JWT verification

Validate:

- Signature.
- Issuer.
- Audience.
- Expiration.
- Not-before claim where applicable.
- Subject.
- Expected token claims.

Use the supported Supabase JWT verification mechanism and signing-key configuration.

Support signing-key rotation.

Do not trust a JWT merely because it can be decoded.

## 7.3 Authenticated user context

Create a typed authenticated-user object.

Example:

```typescript
export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}
```

Only populate identity information from a successfully verified token.

Do not trust user IDs submitted in request bodies to determine who is performing an operation.

## 7.4 Authentication guard

Create a reusable authentication guard.

Example:

```typescript
@UseGuards(AuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: AuthenticatedUser) {
  return this.profileService.getProfile(user.id);
}
```

Public endpoints must be explicitly marked using a documented decorator or equivalent mechanism.

Do not make routes public accidentally by omitting authentication guards.

# 8. Multi-tenant architecture

Tenant isolation is the most important backend responsibility.

## 8.1 Tenant identification

Resolve tenant context using trusted server-side information.

Possible sources:

- Verified custom domain.
- Platform-managed dealership subdomain.
- Authenticated user's selected dealership membership.

The frontend may request a tenant context, but the backend must validate it.

Never assume a tenant ID is trustworthy simply because it was sent in a request header, query parameter or body.

## 8.2 Tenant context

Create a typed tenant context.

Example:

```typescript
export interface TenantContext {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'inactive';
}
```

Use a centralized tenant-resolution service.

The tenant context must be available to controllers and services through a documented mechanism, such as a request-scoped provider or a trusted request context.

Avoid storing tenant identity in mutable global variables.

## 8.3 Membership validation

Before accessing private dealership resources, validate:

1. Authenticated user.
2. Tenant identity.
3. Membership existence.
4. Membership status.
5. Assigned role.
6. Required permissions.
7. Branch scope, where applicable.

Only active memberships may access private tenant data.

Suspended or revoked memberships must be denied.

## 8.4 Tenant-scoped queries

Every tenant-owned database query must include tenant context.

Unsafe:

```typescript
return this.db
  .from('vehicles')
  .select('*')
  .eq('id', vehicleId);
```

Safer:

```typescript
return this.db
  .from('vehicles')
  .select('*')
  .eq('tenant_id', tenant.id)
  .eq('id', vehicleId);
```

However, tenant filters in application queries do not replace PostgreSQL RLS.

The database must independently enforce tenant boundaries.

## 8.5 Cross-tenant relationship protection

Validate relationships between records.

Examples:

- A lead cannot reference another tenant's vehicle.
- A sale cannot reference another tenant's customer.
- An employee cannot be assigned to another tenant's branch.
- A purchase cannot reference another tenant's vehicle.
- A follow-up cannot reference another tenant's lead.

Use tenant-aware composite foreign keys where supported by the database design.

Never rely solely on frontend validation.

## 8.6 Branch authorization

Branch-level access must be enforced by the backend.

Examples:

- Dealership owner: all branches within the tenant.
- Branch manager: assigned branch.
- Sales executive: assigned branch and permitted records.
- Inventory manager: authorized inventory scope.

Do not treat tenant membership as automatic permission to access every branch.

# 9. Authorization and RBAC

Implement role-based access control.

## 9.1 Roles

Suggested roles:

- platform_super_admin
- dealership_owner
- dealership_admin
- general_manager
- branch_manager
- inventory_manager
- sales_manager
- sales_executive
- accountant
- read_only

Roles may be extended as business requirements evolve.

## 9.2 Permissions

Use granular permission identifiers.

Examples:

```text
vehicles.read
vehicles.create
vehicles.update
vehicles.delete
vehicles.publish

leads.read
leads.create
leads.assign
leads.update

customers.read
customers.create
customers.update

sales.read
sales.create
sales.update
sales.cancel

employees.read
employees.invite
employees.update
employees.suspend

reports.read
settings.update
billing.read
billing.manage
```

## 9.3 Permission guard

Create a reusable permission guard.

Example:

```typescript
@RequirePermissions('vehicles.create')
@Post()
createVehicle() {
  // Business operation
}
```

The guard must determine permissions using trusted server-side membership and role data.

Do not accept permissions from the request body or frontend state.

## 9.4 Platform administrator access

Platform administration must be separate from dealership access.

Platform administrators may manage:

- Tenants.
- Subscription plans.
- Platform settings.
- Billing operations.
- Platform analytics.
- Security incidents.

Requirements:

- Explicit platform administrator authorization.
- Strong authentication and MFA where supported.
- Audit logging.
- Restricted privileged operations.
- Separate permission checks.
- No silent access to tenant data.

# 10. Database and Supabase integration

## 10.1 Database access

Follow the database architecture established in `docs/DATABASE.md`.

Use the existing database client and migration approach.

Do not introduce a second database abstraction without architectural approval.

## 10.2 User-scoped database access

For normal tenant requests, use a Supabase client carrying the verified user's access token so PostgreSQL RLS applies.

Example concept:

```typescript
const userClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  },
);
```

The actual implementation must:

- Use the verified token.
- Avoid logging credentials.
- Avoid exposing server secrets.
- Avoid sharing mutable authorization headers between requests.
- Handle errors safely.

## 10.3 Service-role client

The service-role key bypasses RLS.

Rules:

- Never expose it to the frontend.
- Never use it as the default client for routine tenant operations.
- Never use it to avoid fixing RLS policies.
- Restrict it to narrowly defined privileged operations.
- Validate authorization independently before using it.
- Log sensitive operations.
- Never return unrestricted query results.

Privileged database access must be isolated in a clearly named server-side service.

## 10.4 PostgreSQL RLS

Every tenant-owned table must have appropriate RLS policies.

Do not:

- Disable RLS to resolve application errors.
- Assume application filters provide sufficient isolation.
- Introduce new tenant-owned tables without security policies.
- Add broad policies that grant access to all authenticated users.

RLS policies must support the intended operation and authorization model.

Test them using realistic authenticated users.

## 10.5 Database migrations

All schema changes must be version controlled.

Before writing a migration:

1. Inspect the existing schema.
2. Read `docs/DATABASE.md`.
3. Identify dependent foreign keys.
4. Identify RLS policies.
5. Identify indexes.
6. Consider backward compatibility.
7. Plan rollback or recovery where practical.

Do not make untracked production database changes.

Do not use destructive schema operations casually.

For important migrations, prefer an expand-and-contract strategy:

1. Add compatible schema changes.
2. Deploy compatible application code.
3. Backfill data if required.
4. Switch application behavior.
5. Remove obsolete schema only after verification.

# 11. DTOs and input validation

Every API endpoint receiving user input must use validated DTOs.

Enable global validation:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

Requirements:

- Validate request bodies.
- Validate query parameters.
- Validate route parameters.
- Validate UUIDs.
- Validate numeric ranges.
- Validate enums.
- Validate string lengths.
- Validate nested objects.
- Reject unexpected properties.
- Validate date formats.
- Validate file metadata.

Never trust values from the frontend.

Do not use raw request bodies directly in database writes.

## 11.1 DTO example

```typescript
export class CreateVehicleDto {
  @IsString()
  @Length(1, 100)
  make: string;

  @IsString()
  @Length(1, 100)
  model: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;
}
```

This is an illustrative example. Production DTOs must match the actual API and database representation.

## 11.2 Avoid mass assignment

Never spread an untrusted request body directly into a database update.

Unsafe:

```typescript
await db
  .from('vehicles')
  .update(req.body);
```

Instead, explicitly select permitted fields from the validated DTO.

Never allow ordinary users to update:

- `tenant_id`
- Internal ownership fields.
- System-generated identifiers.
- Privileged status fields.
- Audit fields.
- Subscription entitlement values.
- Financial fields outside their permission scope.

# 12. API design standards

## 12.1 REST conventions

Use predictable REST endpoints.

Examples:

```text
GET    /api/v1/vehicles
GET    /api/v1/vehicles/:id
POST   /api/v1/vehicles
PATCH  /api/v1/vehicles/:id
DELETE /api/v1/vehicles/:id

GET    /api/v1/leads
POST   /api/v1/leads
PATCH  /api/v1/leads/:id

GET    /api/v1/customers
POST   /api/v1/customers

GET    /api/v1/sales
POST   /api/v1/sales
```

Use action endpoints where they express domain operations more clearly.

Examples:

```text
POST /api/v1/vehicles/:id/publish
POST /api/v1/vehicles/:id/reserve
POST /api/v1/sales/:id/cancel
POST /api/v1/leads/:id/assign
```

Do not expose unrestricted database operations as generic API endpoints.

## 12.2 API versioning

Use a consistent API versioning strategy.

Example:

```text
/api/v1/
```

Avoid breaking existing frontend integrations without a coordinated migration.

## 12.3 Response structure

Use consistent response formats.

Example:

```json
{
  "data": {
    "id": "uuid",
    "status": "available"
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

Paginated response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

The actual response contract must be consistent with the established frontend API client.

Do not create different response structures arbitrarily across modules.

## 12.4 Pagination

All potentially large collections must support pagination.

Requirements:

- Enforce maximum page size.
- Validate page and limit values.
- Use indexed sorting.
- Avoid unbounded database queries.
- Use cursor pagination where it provides advantages for large or frequently changing collections.

## 12.5 Filtering and sorting

- Use allowlisted filter fields.
- Validate filter values.
- Restrict sort columns.
- Prevent SQL injection.
- Apply tenant and branch filters before returning results.
- Avoid exposing internal database fields through arbitrary filtering.

# 13. Business logic requirements

Business rules must live in backend services and must not be duplicated as independent implementations in the frontend.

## 13.1 Inventory

The inventory module must handle:

- Vehicle creation.
- Vehicle updates.
- Vehicle publication.
- Vehicle status transitions.
- Vehicle image and document references.
- Branch assignment.
- Vehicle history.

Possible vehicle statuses:

- draft
- available
- reserved
- sold
- archived

The backend must validate permitted status transitions.

Example:

```text
draft -> available
available -> reserved
reserved -> available
reserved -> sold
available -> sold
sold -> archived
```

This is a starting example, not a complete business rule. Define the actual lifecycle explicitly before implementing transitions.

Never allow an arbitrary status update that bypasses inventory or sales rules.

## 13.2 CRM

The CRM module must handle:

- Lead creation.
- Lead assignment.
- Lead ownership.
- Lead stage transitions.
- Customer relationships.
- Lead activity history.
- Follow-ups.
- Test-drive scheduling.

Potential lead stages:

- new
- contacted
- interested
- test_drive
- negotiation
- booked
- converted
- lost

Validate stage transitions and record relevant history.

## 13.3 Purchases

The purchase module must support:

- Vehicle acquisition records.
- Seller information.
- Acquisition price.
- Purchase date.
- Associated expenses.
- Supporting documents.
- Purchase status.

Acquisition costs must remain private dealership data.

Do not expose purchase prices through public vehicle APIs.

## 13.4 Sales

The sales module must support:

- Customer validation.
- Vehicle availability validation.
- Sale price.
- Discounts.
- Taxes and charges where applicable.
- Payment records.
- Sale status.
- Salesperson assignment.
- Commission calculation.

Sale creation must be transaction-safe.

Do not permit the same vehicle to be sold twice through concurrent requests.

Use database constraints and transactions to protect inventory and sales consistency.

## 13.5 Financial calculations

Financial operations must be deterministic and accurate.

Requirements:

- Avoid floating-point arithmetic for monetary calculations.
- Use integer minor units or an appropriate exact-decimal representation.
- Follow the database's established INR representation.
- Validate discounts and payment amounts.
- Prevent negative or invalid balances.
- Record financial adjustments.
- Preserve transaction history.
- Avoid silent overwrites of financial records.

If the database stores INR in paise, the backend must consistently convert and calculate using paise.

## 13.6 Employee management

The employee module must handle:

- Invitations.
- Membership creation.
- Role assignment.
- Branch assignments.
- Employee suspension.
- Employee removal.
- Permission changes.

Never allow users to grant themselves elevated roles.

Validate that the acting user has the required permission to invite employees or change roles.

## 13.7 Subscription enforcement

The backend must enforce plan entitlements.

Examples:

- Maximum vehicle listings.
- Maximum branches.
- Maximum employees.
- Custom domain support.
- Advanced reporting.
- Storage limits.

Never rely on frontend feature hiding to enforce subscription limits.

Check entitlements before performing restricted operations.

# 14. Transactions and concurrency

Use database transactions for operations involving multiple related writes.

Examples:

- Creating a sale and updating vehicle status.
- Creating a purchase and recording expenses.
- Recording payments and updating financial balances.
- Converting a lead into a customer or sale.
- Assigning employees and memberships.

## 14.1 Transaction rules

- Keep transactions as short as practical.
- Avoid network calls inside database transactions.
- Use appropriate isolation and locking.
- Handle transaction failures.
- Avoid partial business operations.
- Enforce uniqueness through database constraints.
- Make retry behavior safe.

## 14.2 Race conditions

Pay special attention to:

- Two users selling the same vehicle.
- Two users reserving the same vehicle.
- Duplicate payment webhooks.
- Simultaneous lead assignment.
- Concurrent inventory updates.
- Subscription usage limits.

Use database constraints, row locking, atomic updates or appropriate isolation mechanisms.

Never depend only on a frontend disabled button to prevent duplicate operations.

# 15. File storage

Use the approved Supabase Storage architecture.

The backend must authorize sensitive file operations.

Responsibilities:

- Validate tenant ownership.
- Validate record ownership.
- Validate permissions.
- Validate file metadata.
- Generate secure storage paths.
- Generate signed URLs for private files.
- Restrict private document access.
- Record sensitive file operations.

Never expose private documents through permanent public URLs.

Do not trust client-supplied storage paths.

The storage policies must independently enforce access rules.

# 16. Payment and webhook security

## 16.1 Payment operations

Use a trusted payment provider.

Never:

- Store raw card credentials.
- Trust payment success from the browser.
- Accept arbitrary payment amounts without server-side validation.
- Allow the frontend to directly change subscription status.
- Expose payment secret keys.

## 16.2 Webhook processing

Webhook endpoints must:

1. Verify provider signatures.
2. Validate event structure.
3. Check event type.
4. Verify associated payment or subscription references.
5. Prevent duplicate processing.
6. Store processing results.
7. Handle retry safely.

Use provider event IDs and database uniqueness constraints for idempotency.

Do not mark payments successful before verified provider confirmation.

# 17. Background jobs and integrations

Use background jobs for work that should not block an HTTP response.

Potential jobs:

- Email notifications.
- WhatsApp notifications.
- Vehicle image processing.
- Report generation.
- Subscription renewal processing.
- Payment reconciliation.
- Data exports.
- Scheduled follow-ups.

Use Redis and BullMQ only when the infrastructure is configured and the use case requires them.

## 17.1 Job security

- Validate job payloads.
- Avoid including secrets in payloads.
- Validate tenant context.
- Make jobs idempotent.
- Handle retries.
- Use bounded retry policies.
- Record failures.
- Avoid duplicate side effects.

A background worker must not assume that a job payload's tenant ID is automatically trustworthy.

## 17.2 Integration security

For external integrations:

- Store credentials server-side.
- Encrypt sensitive credentials where appropriate.
- Restrict access to integration settings.
- Verify external webhooks.
- Validate external responses.
- Apply timeouts.
- Handle provider failures.
- Avoid leaking customer data to unauthorized services.

# 18. Rate limiting and API protection

Use rate limiting for:

- Authentication.
- OTP requests.
- Password resets.
- Public enquiry submissions.
- Public listing endpoints.
- File uploads.
- Sensitive administrative actions.

Use distributed rate limiting when running multiple backend instances.

Additional protections:

- Explicit CORS allowlists.
- HTTP security headers.
- Request-size limits.
- File-size limits.
- Request timeouts.
- Input validation.
- Safe error handling.
- Protection against abuse and automated submissions.

CORS must never be treated as authorization.

# 19. Error handling and logging

## 19.1 Standardized exceptions

Use NestJS exception handling consistently.

Appropriate responses:

| Status | Meaning |
|---|---|
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Access denied |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Business-rule validation failure |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

Avoid revealing whether a private record exists in another tenant.

Where necessary, return a consistent not-found response to avoid leaking cross-tenant record existence.

## 19.2 Logging

Use structured logs.

Include when appropriate:

- Request ID.
- User ID.
- Tenant ID.
- Endpoint.
- HTTP method.
- Response status.
- Execution duration.
- Error category.

Never log:

- Passwords.
- JWTs.
- Refresh tokens.
- Service-role keys.
- Webhook secrets.
- OTP values.
- Payment credentials.
- Unredacted sensitive customer data.

Use redaction for request headers and bodies.

## 19.3 Audit logging

Record sensitive operations.

Examples:

- Role changes.
- Employee invitations.
- Vehicle deletion.
- Vehicle publication.
- Lead reassignment.
- Sale creation.
- Sale cancellation.
- Payment updates.
- Subscription changes.
- Tenant suspension.
- Platform administrator operations.

Audit records must identify the actor and affected resource.

Ordinary users must not be able to modify audit records.

# 20. API documentation

Use Swagger/OpenAPI for API documentation.

Document:

- Endpoint.
- HTTP method.
- Authentication requirement.
- Required permissions.
- Request DTO.
- Response format.
- Error responses.
- Pagination.
- Filters.
- Example requests.

Keep documentation synchronized with implementation.

Do not document an endpoint as public if it requires authentication.

Avoid exposing internal-only administrative endpoints through public API documentation unless intended.

# 21. Configuration and secrets

## 21.1 Environment configuration

Use environment-specific configuration.

Example:

```text
NODE_ENV=
PORT=
WEB_ORIGIN=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DATABASE_URL=

REDIS_URL=

PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=

EMAIL_PROVIDER_API_KEY=
```

Only define variables actually used by the application.

## 21.2 Configuration validation

Validate required environment variables at startup.

The application must fail clearly if required production configuration is missing or invalid.

Never silently use insecure fallback values in production.

## 21.3 Secret management

- Never commit production secrets.
- Never log secrets.
- Never expose secrets through API responses.
- Use deployment secret management.
- Rotate compromised credentials.
- Restrict secret access.
- Keep development and production credentials separate.

# 22. Caching and performance

Optimize database access and API performance without compromising tenant isolation.

Requirements:

- Avoid N+1 queries.
- Use appropriate indexes.
- Paginate large collections.
- Select only necessary fields.
- Avoid unbounded queries.
- Use caching only where safe.
- Scope tenant-specific cache keys correctly.
- Invalidate stale data after mutations.
- Use timeouts for external services.
- Avoid unnecessary synchronous work.

Never use a global cache key for tenant-specific private data.

Example:

```text
tenant:{tenant_id}:vehicles:{filter_hash}
```

The cache key must also account for any relevant authorization or branch scope.

Do not cache private user data in publicly accessible caches.

# 23. Testing standards

Use the repository's existing testing framework.

If the project does not yet have a testing setup, propose one before adding dependencies.

## 23.1 Unit tests

Test:

- Business rules.
- Permission evaluation.
- Tenant resolution logic.
- DTO validation.
- Financial calculations.
- Vehicle status transitions.
- Lead stage transitions.
- Subscription entitlements.
- Payment idempotency logic.

## 23.2 Integration tests

Test:

- Database queries.
- Transactions.
- RLS policies.
- Tenant isolation.
- Membership validation.
- Cross-tenant relationship protection.
- Storage authorization.
- Webhook processing.

## 23.3 End-to-end tests

Test complete workflows:

- Authentication.
- Dealership creation.
- Membership invitation.
- Vehicle creation.
- Vehicle publication.
- Lead submission.
- Lead assignment.
- Follow-up creation.
- Vehicle purchase.
- Vehicle sale.
- Payment recording.
- Subscription management.

## 23.4 Mandatory tenant-isolation tests

Create at least two test tenants.

```text
Tenant A: Royal Drive
Tenant B: Premium Motors
```

Verify that a Tenant A user cannot:

- Read Tenant B vehicles.
- Update Tenant B vehicles.
- Delete Tenant B customers.
- Read Tenant B leads.
- Access Tenant B sales.
- Download Tenant B documents.
- Create relationships to Tenant B records.
- Access Tenant B branches.
- Read Tenant B private analytics.

Repeat these tests against the actual database access path, including RLS.

A passing service-layer test alone is insufficient to establish tenant isolation.

# 24. Health checks and observability

Implement appropriate health endpoints.

Examples:

```text
GET /api/v1/health
GET /api/v1/health/readiness
```

Health checks should distinguish:

- Application availability.
- Database connectivity.
- Required infrastructure availability.

Do not expose credentials, connection strings or sensitive infrastructure details.

Use monitoring for:

- API latency.
- Error rates.
- Database failures.
- Queue failures.
- Payment webhook failures.
- Authentication failures.
- Unusual traffic.
- Resource usage.

# 25. AI coding-agent workflow

Every coding agent must follow this process.

## Step 1 — Understand

- Read mandatory documentation.
- Inspect the existing NestJS modules.
- Inspect relevant database tables.
- Inspect existing DTOs and guards.
- Identify API contracts with the frontend.
- Identify tenant boundaries.
- Identify permissions.
- Identify transactional requirements.

## Step 2 — Plan

Before making changes, identify:

- Modules involved.
- Files to create.
- Files to modify.
- Database changes.
- API endpoints.
- DTOs.
- Guards and permissions.
- Tenant-scoping requirements.
- RLS implications.
- Tests required.

For substantial architectural changes, present the plan for review before implementation.

## Step 3 — Implement

- Follow modular architecture.
- Keep controllers thin.
- Keep business logic in services.
- Validate all inputs.
- Apply authentication and permission guards.
- Enforce tenant and branch boundaries.
- Use transactions where required.
- Handle errors safely.
- Write tests.

## Step 4 — Verify

Run the actual scripts configured in `package.json`.

Expected examples:

```bash
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api build
```

Do not assume these script names exist. Inspect the repository.

Do not claim a test or build passed unless it was actually executed successfully.

## Step 5 — Report

Every implementation report must include:

1. Feature implemented.
2. Modules created or modified.
3. API endpoints added or modified.
4. Database changes.
5. Permissions and tenant security.
6. Tests executed.
7. Build and type-check results.
8. Known limitations.
9. Remaining security risks.

# 26. Strict prohibitions

AI coding agents must never:

- Put complex business logic in controllers.
- Trust client-supplied tenant IDs.
- Trust frontend roles or permissions.
- Skip membership validation.
- Bypass branch-level authorization.
- Disable RLS to make queries work.
- Use the service-role key for routine tenant queries.
- Expose privileged credentials.
- Accept unvalidated request bodies.
- Spread arbitrary request objects into database updates.
- Perform financial calculations using unsafe floating-point arithmetic.
- Allow duplicate vehicle sales.
- Trust browser payment success.
- Process unsigned webhooks.
- Return unrestricted database records.
- Expose private dealership information through public APIs.
- Perform unrelated refactoring without approval.
- Modify database schemas without migrations.
- Ignore failed tests.
- Claim successful verification without executing it.

# 27. Definition of done

A backend feature is complete only when:

- [ ] It follows the approved backend architecture.
- [ ] Controllers remain focused on HTTP concerns.
- [ ] Business logic is implemented in appropriate services.
- [ ] DTO validation is implemented.
- [ ] Authentication is enforced.
- [ ] Permissions are enforced.
- [ ] Tenant isolation is enforced.
- [ ] Branch restrictions are enforced where applicable.
- [ ] Database constraints are respected.
- [ ] RLS policies are implemented and tested where applicable.
- [ ] Transactions are used where required.
- [ ] Errors are handled safely.
- [ ] Logs do not expose sensitive information.
- [ ] API documentation is updated.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Relevant tenant-isolation tests pass.
- [ ] Type checking passes.
- [ ] Production build passes.
- [ ] Documentation is updated.

# 28. Final architectural rules

The backend must follow these non-negotiable decisions:

1. Supabase Auth is responsible for user identity.
2. NestJS verifies authentication tokens.
3. NestJS resolves and validates dealership context.
4. Active memberships determine dealership access.
5. RBAC controls feature permissions.
6. Branch-level rules restrict organizational access.
7. PostgreSQL RLS enforces database-level isolation.
8. Tenant-aware foreign keys protect relationships.
9. Business logic lives in backend services.
10. Financial operations use safe, transactional database operations.
11. Payment status is based on verified provider events.
12. Sensitive operations are recorded in audit logs.

**Final rule:** Every backend feature must be designed as a secure, tenant-aware business operation. Never prioritize implementation speed over data isolation, financial correctness or authorization security.