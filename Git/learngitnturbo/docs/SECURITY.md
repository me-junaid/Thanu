# SECURITY IMPLEMENTATION DOCUMENT

**File:** `docs/SECURITY.md`  
**Product:** Multi-Tenant Pre-Owned Automobile Dealership SaaS  
**Organization:** Orgetise Technologies Pvt. Ltd.  
**Status:** Proposed security baseline  
**Applies to:** Next.js, NestJS, Supabase Auth, PostgreSQL, Supabase Storage, integrations and deployment infrastructure

---

# 1. Purpose

This document defines the security architecture, implementation requirements, and operational practices for the dealership SaaS platform.

Security must be implemented at every layer:

1. Frontend security
2. API security
3. Authentication
4. Authorization and permissions
5. Multi-tenant data isolation
6. Database security
7. File and media security
8. Payment and subscription security
9. Audit logging and monitoring
10. Infrastructure and deployment security

Security must not depend on frontend restrictions. Every sensitive operation must be authorized and validated by the backend and, where applicable, enforced again by PostgreSQL Row Level Security (RLS).

## 1.1 Core security principles

- **Zero trust:** Never trust client-supplied identity, tenant, role, price, ownership, or permissions.
- **Defense in depth:** Enforce security at the frontend, API, database, and infrastructure layers.
- **Least privilege:** Give users and services only the permissions they need.
- **Tenant isolation:** Dealership data must remain isolated.
- **Secure by default:** New endpoints, tables, and storage buckets must begin with restrictive access.
- **Fail closed:** If authorization or tenant resolution fails, deny the operation.
- **Accountability:** Sensitive actions must be traceable through audit logs.
- **Data minimization:** Collect and expose only the information necessary for a feature.

---

# 2. Security architecture

## 2.1 Application architecture

The proposed architecture:

```text
                         INTERNET
                            |
                     HTTPS / TLS
                            |
                    Next.js Frontend
                            |
                     NestJS API
                            |
             +--------------+--------------+
             |              |              |
        Auth Guard      Tenant Guard    Permission Guard
             |              |              |
             +--------------+--------------+
                            |
                    Business Services
                            |
                User-scoped Supabase Client
                            |
                  PostgreSQL + RLS
                            |
               Tenant-isolated application data
```

Additional infrastructure:

- Supabase Auth: identity and authentication.
- Supabase Storage: vehicle images and documents.
- NestJS: authorization, business rules and API validation.
- PostgreSQL RLS: database-level tenant protection.
- Payment provider: subscription and payment processing.
- Monitoring: security events, errors and operational alerts.

## 2.2 Security responsibility by layer

| Layer | Responsibility |
|---|---|
| Next.js | Secure UI behavior, session handling, safe rendering |
| NestJS | Authentication verification, authorization, validation, rate limiting |
| PostgreSQL | Tenant isolation, RLS, constraints and data integrity |
| Supabase Auth | Identity, password management and authentication |
| Supabase Storage | File access and tenant-specific storage policies |
| Infrastructure | HTTPS, secrets, network access and deployment security |
| Monitoring | Audit trails, suspicious activity and incident detection |

**Important:** Hiding a button in Next.js is not authorization. A user must not gain access by directly calling the API.

---

# 3. Authentication security

## 3.1 Authentication provider

Use Supabase Auth for user authentication.

The application must not implement its own password storage or authentication token generation unless there is a separately approved architectural reason.

Supported authentication methods may include:

- Email and password
- Email verification
- Password reset
- Optional multi-factor authentication
- Secure session management

Phone-based OTP can be introduced when required, but must use a trusted authentication provider and server-side verification.

## 3.2 Authentication requirements

- Require authentication for all private application routes and API endpoints.
- Verify email addresses where email-based accounts are used.
- Require strong passwords according to the authentication provider's current capabilities.
- Apply rate limits to login, OTP and password-reset operations.
- Prevent account enumeration through authentication error messages.
- Revoke or invalidate sessions after account suspension or other security-sensitive events, using supported provider mechanisms.
- Require reauthentication for particularly sensitive account changes where supported.
- Never log passwords, access tokens, refresh tokens or OTP values.

## 3.3 JWT verification

NestJS must verify Supabase access tokens on protected requests.

Validate:

- Token signature using the trusted Supabase project configuration.
- Issuer.
- Audience.
- Expiration (`exp`).
- Not-before (`nbf`), when present.
- Subject (`sub`).
- Expected token type and relevant claims.

Use the provider's supported JWT verification approach and signing-key configuration. Support key rotation and do not assume a single hardcoded signing key.

Do not trust a decoded JWT unless its signature and claims have been verified.

## 3.4 Session handling

- Prefer secure, HttpOnly cookies when using a cookie-based browser session architecture.
- Set `Secure` in production.
- Set an appropriate `SameSite` policy.
- Protect cookie-authenticated state-changing requests against CSRF.
- Never store privileged service-role credentials in browser storage.
- Do not expose refresh tokens to client-side application code unnecessarily.
- Handle expired sessions cleanly.
- Clear application session state on logout.

If the application uses bearer tokens instead of cookies, follow the provider's recommended browser token handling and protect against XSS. Do not mix authentication strategies without a documented reason.

## 3.5 Password reset

Password-reset flow must:

1. Accept the user's registered email address.
2. Request a reset through Supabase Auth.
3. Send the user to an approved reset URL.
4. Verify the reset token through the provider.
5. Allow the password update.
6. Display a generic response that does not reveal whether an account exists.

Only allow approved redirect URLs. Never accept arbitrary redirect destinations.

---

# 4. Multi-tenant security

This is the most critical security requirement of the product.

The platform serves multiple independent dealerships. Every tenant's private business data must remain isolated.

## 4.1 Tenant isolation model

Use a shared PostgreSQL database and shared application schema with tenant ownership.

Every tenant-owned business table must contain:

```sql
tenant_id UUID NOT NULL
```

Examples:

- branches
- employees
- vehicles
- customers
- leads
- follow_ups
- test_drives
- purchases
- sales
- sale_payments
- commissions
- notifications
- audit_logs

Platform-level tables such as subscription plans may not require `tenant_id`.

## 4.2 Tenant identification

The tenant context may be established through:

- A verified custom domain.
- A platform-managed dealership subdomain.
- An authenticated user's active dealership membership.

The backend must resolve the tenant using trusted server-side data.

Example:

```text
royaldrive.example.com
          |
          v
     Tenant Resolver
          |
          v
    Verify Domain
          |
          v
   Resolve Tenant ID
          |
          v
  Validate User Membership
          |
          v
    Continue Request
```

A custom domain must be verified and mapped to exactly the intended tenant.

## 4.3 Never trust client-supplied tenant IDs

The frontend may send a tenant identifier as a navigation or selection hint, but the backend must independently validate it.

Never use this pattern:

```typescript
const tenantId = req.body.tenantId;

return this.vehicleRepository.find({
  where: { tenantId },
});
```

Instead:

```typescript
const tenant = await this.tenantResolver.resolve(request);

await this.membershipService.assertActiveMembership(
  authenticatedUser.id,
  tenant.id,
);

return this.vehicleService.findAll({
  tenantId: tenant.id,
});
```

The `tenant.id` must come from a trusted tenant-resolution process and must be checked against the authenticated user's active membership.

For public dealership websites, tenant resolution through a verified domain is sufficient to identify the public tenant context. It does not grant access to private dealership data.

## 4.4 Tenant membership

A user can belong to multiple dealerships.

The platform must validate:

- User identity.
- Membership existence.
- Membership status.
- Tenant association.
- Assigned role.
- Branch restrictions, where applicable.

Membership statuses:

- invited
- active
- suspended
- revoked

Only active memberships can access private dealership resources.

When a membership is suspended or revoked, subsequent requests must be denied. Do not rely on an old frontend session to preserve access.

## 4.5 Cross-tenant relationship protection

Every relationship between tenant-owned records must preserve tenant consistency.

Example:

A lead belonging to Tenant A must not reference a vehicle belonging to Tenant B.

Use composite foreign keys where appropriate:

```sql
ALTER TABLE vehicles
ADD CONSTRAINT vehicles_tenant_id_id_unique
UNIQUE (tenant_id, id);

ALTER TABLE leads
ADD CONSTRAINT leads_vehicle_tenant_fk
FOREIGN KEY (tenant_id, vehicle_id)
REFERENCES vehicles (tenant_id, id);
```

Apply the same principle to customers, branches, employees, sales and other tenant-owned relationships.

Do not rely exclusively on application code to prevent cross-tenant references.

## 4.6 Branch-level isolation

Some dealership users may have access to only one or a few branches.

Authorization must support both:

- Tenant-level permissions.
- Branch-level restrictions.

Example:

| Role | Access |
|---|---|
| Dealership owner | All branches in their tenant |
| General manager | Assigned branches or tenant-wide access |
| Branch manager | Assigned branch |
| Sales executive | Assigned leads and permitted branch inventory |
| Inventory manager | Inventory operations within permitted branches |

Branch access must be checked by backend services and database policies where appropriate.

---

# 5. Authorization and RBAC

## 5.1 Role-based access control

Implement RBAC (Role-Based Access Control).

A user's permissions must be determined from their active membership and assigned role, not from values submitted by the frontend.

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

Roles may be extended later.

## 5.2 Permission naming

Use consistent permission identifiers.

Examples:

```text
vehicles.read
vehicles.create
vehicles.update
vehicles.delete
vehicles.publish
vehicles.mark_sold

leads.read
leads.create
leads.assign
leads.update
leads.delete

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

## 5.3 Backend authorization

Use NestJS guards and decorators.

Example:

```typescript
@RequirePermissions('vehicles.create')
@Post()
async createVehicle(
  @CurrentUser() user: AuthenticatedUser,
  @CurrentTenant() tenant: TenantContext,
  @Body() dto: CreateVehicleDto,
) {
  return this.vehicleService.create({
    tenantId: tenant.id,
    userId: user.id,
    dto,
  });
}
```

The guard must:

1. Verify authentication.
2. Resolve the active tenant context.
3. Validate membership.
4. Load or securely determine permissions.
5. Verify the required permission.
6. Check branch scope when applicable.
7. Reject unauthorized requests.

Do not use frontend role names or local storage values as authorization evidence.

## 5.4 Platform administrator isolation

Platform administrators have access to platform-level operations, such as:

- Tenant management.
- Subscription plan management.
- Platform analytics.
- Billing administration.
- Platform configuration.
- Security investigations.

Platform administrator access must be separate from ordinary dealership membership.

Requirements:

- Do not automatically grant platform administrator privileges to dealership owners.
- Require MFA for privileged platform accounts where supported.
- Log every sensitive platform action.
- Restrict platform administration endpoints.
- Use separate authorization checks for platform-level operations.
- Require additional confirmation for destructive or high-impact actions.

A platform administrator must not silently bypass audit logging.

---

# 6. PostgreSQL security and Row Level Security

## 6.1 Enable RLS

Enable RLS on every tenant-owned table.

Example:

```sql
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles FORCE ROW LEVEL SECURITY;
```

Repeat for all private tenant-owned tables.

`FORCE ROW LEVEL SECURITY` helps ensure table owners are subject to RLS, but privileged roles such as PostgreSQL superusers and roles with `BYPASSRLS` can still bypass it.

Never treat RLS as protection against a deliberately privileged database connection.

## 6.2 Example tenant policy

The following is a conceptual example. Implement and test it against the actual Supabase JWT claims and membership schema.

```sql
CREATE POLICY "tenant_members_can_read_vehicles"
ON vehicles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM memberships m
    WHERE m.tenant_id = vehicles.tenant_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  )
);
```

A production implementation must also account for role permissions and branch restrictions.

## 6.3 Policies for every operation

Do not create only SELECT policies.

Implement separate policies for:

- SELECT
- INSERT
- UPDATE
- DELETE

For example, an INSERT policy must validate that the authenticated user has an active membership for the tenant being inserted.

An UPDATE policy must validate both:

- The existing row is accessible.
- The new row remains within the authorized tenant and scope.

Use `WITH CHECK` for new row values.

Example:

```sql
CREATE POLICY "tenant_members_can_insert_vehicles"
ON vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM memberships m
    WHERE m.tenant_id = vehicles.tenant_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  )
);
```

This example is only a membership boundary. Production policies must also enforce the necessary permission and branch rules.

## 6.4 Avoid unsafe RLS functions

If helper functions are required:

- Use narrowly scoped functions.
- Set a safe `search_path` when using `SECURITY DEFINER`.
- Revoke unnecessary execution privileges.
- Grant execution only to required roles.
- Avoid dynamic SQL unless absolutely necessary.
- Review recursive policy dependencies.
- Test behavior as real authenticated users.

Do not introduce a `SECURITY DEFINER` function simply to make an RLS policy easier to write.

## 6.5 Supabase service-role key

The service-role key bypasses normal RLS protections.

Rules:

- Never expose it in Next.js browser code.
- Never prefix it with `NEXT_PUBLIC_`.
- Never include it in frontend build output.
- Never use it as the default database client for ordinary tenant requests.
- Never log it.
- Restrict access to deployment secrets.

For normal user requests, use a Supabase client configured with the authenticated user's access token so that database RLS applies.

For narrowly defined platform operations that require elevated access:

1. Use a dedicated server-side service.
2. Validate the operation's authorization independently.
3. Restrict the operation to the minimum required records.
4. Record the action in audit logs.
5. Avoid returning unrestricted database results.

If NestJS connects directly to PostgreSQL instead of using the user-scoped Supabase client, establish the authenticated user and tenant context safely within each transaction. Never allow connection-pool state to leak between requests.

---

# 7. API security

## 7.1 API authentication

Every private NestJS endpoint must use authentication guards.

Public endpoints must be explicitly identified and documented.

Examples of potentially public endpoints:

- Public vehicle listings.
- Public vehicle details.
- Public dealership information.
- Public enquiry submission.
- Public contact forms.

Do not accidentally expose private endpoints by omitting a guard.

## 7.2 Input validation

Use DTOs and NestJS validation.

Recommended baseline:

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

- Validate all request bodies.
- Validate query parameters.
- Validate route parameters.
- Validate UUIDs and numeric values.
- Enforce string length limits.
- Restrict accepted enum values.
- Reject unexpected properties.
- Normalize and validate email addresses.
- Validate phone numbers according to supported regions.
- Limit pagination sizes.
- Validate sorting and filtering fields against an allowlist.

Never pass arbitrary user input directly into SQL queries or ORM query expressions.

## 7.3 SQL injection

- Use parameterized SQL queries.
- Use safe ORM query builders.
- Avoid string concatenation for SQL.
- Do not dynamically interpolate untrusted table or column names.
- Use allowlists for sorting and filtering.
- Review raw SQL in database functions and migrations.

## 7.4 Rate limiting

Apply rate limits to public and sensitive endpoints.

Suggested starting policy, subject to load testing:

| Endpoint category | Initial limit |
|---|---:|
| Login and authentication | 5 attempts / minute |
| OTP requests | 3 requests / 10 minutes |
| Password reset | 3 requests / 10 minutes |
| Public enquiry submission | 5 requests / minute |
| Public vehicle browsing | 60 requests / minute |
| Authenticated API | 120 requests / minute |
| File upload initiation | 10 requests / minute |

These are initial defaults, not universal limits.

Use a distributed rate limiter such as Redis-backed storage when running multiple API instances. In-memory rate limiting alone is insufficient for a horizontally scaled production deployment.

Also consider:

- IP-based limits.
- User-based limits.
- Tenant-based limits.
- Endpoint-specific limits.
- Abuse detection.
- Temporary blocking.

## 7.5 CORS

Configure explicit allowed origins.

Example:

```typescript
app.enableCors({
  origin: [
    'https://orgetise.com',
    'https://app.orgetise.com',
  ],
  credentials: true,
});
```

The actual list must include approved platform and dealership origins as required.

Never use unrestricted wildcard origins with credentialed requests.

Custom dealership domains must be checked against verified domain records before being allowed.

CORS is not authentication or authorization. It does not prevent direct API requests from other clients.

## 7.6 HTTP security headers

Configure secure HTTP headers using Helmet or an equivalent solution.

Include suitable policies for:

- Content Security Policy.
- Strict Transport Security.
- X-Content-Type-Options.
- Referrer Policy.
- Frame protection.
- Permissions Policy.

Tune CSP for the actual scripts, images, fonts and payment integrations used by the application.

Avoid enabling unsafe inline scripts or broad wildcard sources without a documented requirement.

## 7.7 Error handling

Never expose:

- Database connection strings.
- SQL queries.
- Stack traces in production.
- JWTs.
- Internal server paths.
- Environment variables.
- Secrets.
- Internal authorization details.

Return structured, safe errors.

Example:

```json
{
  "statusCode": 403,
  "code": "FORBIDDEN",
  "message": "You do not have permission to perform this action."
}
```

Log technical details securely on the server, with sensitive values redacted.

---

# 8. Vehicle and business data protection

Dealership information includes sensitive commercial and customer data.

## 8.1 Public and private vehicle data

Public vehicle pages may expose:

- Make.
- Model.
- Variant.
- Year.
- Mileage.
- Fuel type.
- Transmission.
- Public selling price.
- Approved vehicle images.
- Public description.
- Public features.
- Availability status.

Private dealership data must never be exposed publicly:

- Purchase price.
- Acquisition cost.
- Profit margin.
- Internal valuation.
- Supplier details.
- Internal notes.
- Customer information.
- Private vehicle documents.
- Employee information.
- Commission information.

Do not expose private database rows and rely on frontend code to hide fields.

Use a dedicated public view, safe query, or public API response DTO containing only approved fields.

## 8.2 Customer information

Customer records must be available only to authorized dealership users.

Protect:

- Names.
- Phone numbers.
- Email addresses.
- Addresses.
- Enquiry details.
- Purchase history.
- Follow-up notes.
- Financial information.

Do not include customer information in public APIs, public page metadata, analytics events, or unsecured logs.

## 8.3 Data access boundaries

Every query must enforce:

- Correct tenant.
- Correct branch, if applicable.
- Correct record ownership or assignment, if applicable.
- Required permission.
- Record lifecycle restrictions.

Never retrieve a record by its UUID alone and assume that the UUID provides authorization.

---

# 9. File and media security

The platform will store vehicle images, documents, and potentially customer-related files.

## 9.1 Storage separation

Use separate storage policies for public and private files.

Suggested buckets:

| Bucket | Access |
|---|---|
| `vehicle-public` | Public read for approved published images |
| `vehicle-private` | Authorized dealership users |
| `customer-documents` | Authorized users only |
| `employee-documents` | Authorized users only |
| `platform-assets` | Controlled platform access |

Public buckets must contain only files explicitly approved for public display.

## 9.2 File upload validation

Validate files on the server.

Check:

- Maximum file size.
- Allowed file extensions.
- Actual MIME type.
- File signature or magic bytes.
- Image dimensions where applicable.
- Upload authorization.
- Tenant ownership.
- Storage destination.

Do not trust the filename extension or browser-provided MIME type.

Recommended initial limits:

| File type | Initial maximum |
|---|---:|
| Vehicle image | 10 MB |
| PDF document | 15 MB |
| Other permitted documents | 15 MB |

Adjust these limits based on actual business requirements and infrastructure capacity.

## 9.3 Upload security

- Generate server-controlled storage paths.
- Never allow users to choose arbitrary storage paths.
- Prevent path traversal.
- Use random or UUID-based object names.
- Restrict executable and unsupported file types.
- Do not permit HTML or JavaScript uploads to public storage.
- Use signed URLs for private file downloads.
- Set short expiration times for sensitive signed URLs.
- Verify tenant ownership before generating a signed URL.
- Consider malware scanning for private document uploads.

Example path:

```text
tenant/{tenant_id}/vehicles/{vehicle_id}/{file_id}.webp
```

The path structure is not itself a security boundary. Storage policies must enforce access independently.

## 9.4 Deleting files

When deleting a vehicle or document:

- Verify tenant ownership.
- Verify permission.
- Update the database state safely.
- Remove or schedule removal of associated storage objects.
- Record sensitive deletions in audit logs.

Avoid deleting a database record while leaving sensitive files publicly accessible.

---

# 10. Payment and subscription security

The SaaS platform may process dealership subscription payments.

## 10.1 Payment provider

Use a trusted payment provider.

Do not store raw card numbers, CVVs, or other card authentication data in the application database.

Store only the necessary payment-provider references and transaction metadata.

## 10.2 Payment verification

Never trust payment status supplied by the browser.

Payment state must be updated only after a valid provider response or verified webhook.

Webhook requirements:

1. Verify the provider's signature.
2. Validate the event structure.
3. Validate the event type.
4. Verify the associated subscription or payment reference.
5. Check idempotency.
6. Process the event safely.
7. Store the event result.
8. Return the appropriate response.

## 10.3 Webhook security

- Verify signatures using the provider's official method.
- Keep webhook secrets server-side.
- Reject invalid signatures.
- Prevent replay and duplicate processing through event IDs and idempotency.
- Do not trust webhook payloads without verification.
- Log processing results without logging secrets.
- Make handlers safe to retry.

## 10.4 Subscription enforcement

Subscription restrictions must be enforced by the backend.

Examples:

- Maximum vehicle listings.
- Maximum employees.
- Maximum branches.
- Custom domain access.
- Advanced analytics.
- Additional storage.

Do not enforce paid plan entitlements only by hiding frontend features.

The backend must check the current subscription state and the relevant entitlement before allowing restricted operations.

---

# 11. Audit logging and activity tracking

Security-sensitive actions must be traceable.

## 11.1 Actions to audit

At minimum:

- Login and logout events where available.
- Failed authentication attempts.
- Password and account security changes.
- Employee invitations.
- Role changes.
- Permission changes.
- Membership suspension or revocation.
- Vehicle creation, updates and deletion.
- Vehicle publication and status changes.
- Customer record access or export where appropriate.
- Lead reassignment.
- Sale creation, modification and cancellation.
- Payment and subscription changes.
- Branch creation and deletion.
- Domain verification and changes.
- Platform administrator actions.
- Sensitive document access where appropriate.

## 11.2 Audit log fields

Suggested schema:

```text
id
tenant_id
actor_user_id
actor_type
action
resource_type
resource_id
branch_id
ip_address
user_agent
request_id
metadata
created_at
```

Use JSON metadata only for safe, necessary contextual information.

Never store:

- Passwords.
- Access tokens.
- Refresh tokens.
- OTP values.
- Full payment credentials.
- Unredacted secrets.

## 11.3 Audit log integrity

- Restrict update and delete access.
- Do not allow ordinary dealership users to modify audit records.
- Record platform-level actions separately where appropriate.
- Restrict audit-log access by permission.
- Retain records according to an approved retention policy.
- Consider immutable or externally archived logs for high-value security events.

Audit logs should be distinct from ordinary application activity feeds.

---

# 12. Data privacy and retention

The application will process customer and employee information.

Implement privacy controls appropriate to the jurisdictions where the platform operates, including applicable Indian data-protection requirements.

## 12.1 Data minimization

Collect only information required for the business purpose.

Do not collect sensitive customer information without a clear business requirement.

## 12.2 Data retention

Define retention policies for:

- Customer enquiries.
- Customer records.
- Uploaded documents.
- Employee records.
- Payment metadata.
- Audit logs.
- Communication logs.
- Authentication records.

Do not delete legally required financial or audit records simply because a dealership account is closed.

## 12.3 Account deletion and tenant closure

Before deleting a dealership:

1. Verify the requester's authority.
2. Confirm the tenant identity.
3. Check outstanding subscriptions and invoices.
4. Identify data-retention obligations.
5. Identify active branches and users.
6. Export or preserve required records where appropriate.
7. Revoke access.
8. Disable custom domains and integrations.
9. Apply the approved retention and deletion policy.
10. Record the operation.

Use soft deletion for important business entities where operationally appropriate. Define a separate controlled process for permanent deletion.

---

# 13. Frontend security

## 13.1 XSS protection

- Avoid rendering untrusted HTML.
- Avoid `dangerouslySetInnerHTML` unless there is a reviewed sanitization process.
- Sanitize rich-text content before rendering.
- Validate URLs before using them in links.
- Do not insert user-controlled content into scripts.
- Use a restrictive Content Security Policy.

## 13.2 Sensitive data in frontend

Never include:

- Supabase service-role keys.
- Database passwords.
- Payment secret keys.
- Webhook secrets.
- Internal API credentials.
- Private storage credentials.

Do not place sensitive customer or financial data in public page props, static generation output, or browser-accessible caches.

## 13.3 Browser caching

Do not publicly cache private pages or API responses.

Use appropriate private/no-store caching for authenticated content, customer records, financial records and admin pages.

Public vehicle listing pages may use caching, but cache keys must include the resolved dealership context. When a vehicle becomes unavailable or private, invalidate relevant cached content.

## 13.4 Open redirects

Do not accept arbitrary redirect URLs from query parameters.

Use an allowlist of approved redirect destinations.

## 13.5 Dependency security

- Use maintained packages.
- Remove unused dependencies.
- Review package permissions and provenance where practical.
- Run dependency vulnerability checks.
- Pin and lock dependencies.
- Review major dependency upgrades.
- Avoid copying unknown scripts into the application.

---

# 14. Infrastructure and deployment security

## 14.1 HTTPS

All production application traffic must use HTTPS.

- Redirect HTTP to HTTPS.
- Enable HSTS after confirming HTTPS deployment.
- Use valid TLS certificates.
- Avoid mixed content.
- Secure API and custom-domain traffic.

## 14.2 Environment variables

Separate environments:

```text
.env.local
.env.development
.env.test
Production deployment secrets
```

Never commit `.env` files containing secrets.

Maintain `.env.example` with placeholder values only.

Suggested secret categories:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_CONFIGURATION
DATABASE_URL
PAYMENT_SECRET_KEY
PAYMENT_WEBHOOK_SECRET
REDIS_URL
EMAIL_PROVIDER_API_KEY
```

Only add variables that are actually used by the application.

Use the deployment platform's secret manager for production credentials.

## 14.3 Environment separation

Maintain separate:

- Development environment.
- Testing environment.
- Production environment.

Do not use production customer data in development without a documented, approved sanitization process.

Do not share production secrets with local development tools unnecessarily.

## 14.4 Database security

- Restrict database network access where supported.
- Use secure connection settings.
- Apply least-privilege database roles.
- Avoid exposing the database directly to browsers.
- Use connection pooling appropriately.
- Keep migrations under version control.
- Back up production data.
- Test database restoration periodically.

## 14.5 Backups and recovery

Define:

- Backup frequency.
- Retention duration.
- Recovery Point Objective (RPO).
- Recovery Time Objective (RTO).
- Restore testing frequency.
- Backup access permissions.

Backups must be protected against unauthorized access and deletion.

A backup is not considered reliable until restoration has been tested.

---

# 15. Security monitoring and incident response

## 15.1 Monitor suspicious activity

Monitor:

- Repeated login failures.
- Unusual password-reset requests.
- Repeated authorization failures.
- Cross-tenant access attempts.
- Unusual bulk data exports.
- Unexpected platform administrator activity.
- High-volume public form submissions.
- Repeated payment webhook failures.
- Unusual file uploads.
- Sudden API traffic increases.

Use request IDs to correlate frontend, API, database and infrastructure logs.

## 15.2 Incident response process

When a security incident is suspected:

1. Identify and classify the incident.
2. Contain affected accounts, sessions, services or credentials.
3. Preserve relevant logs and evidence.
4. Determine affected tenants and records.
5. Revoke compromised credentials.
6. Patch the vulnerability.
7. Restore affected services safely.
8. Notify affected parties and authorities when required.
9. Document the incident.
10. Review and improve preventive controls.

Maintain an incident response owner and escalation procedure before production launch.

---

# 16. Security testing requirements

Security testing is mandatory before production release and after significant changes to authentication, permissions, tenancy, storage or payments.

## 16.1 Authentication tests

- Unauthenticated users cannot access protected endpoints.
- Invalid tokens are rejected.
- Expired tokens are rejected.
- Suspended users cannot continue accessing private resources.
- Revoked memberships are denied.
- Password-reset links cannot be reused improperly.
- Login and OTP rate limits work.

## 16.2 Tenant isolation tests

Create at least two test dealerships:

```text
Tenant A: Royal Drive
Tenant B: Premium Motors
```

Create users:

```text
User A: Royal Drive owner
User B: Premium Motors owner
```

Verify:

- User A cannot read Tenant B vehicles.
- User A cannot update Tenant B vehicles.
- User A cannot delete Tenant B vehicles.
- User A cannot read Tenant B customers.
- User A cannot read Tenant B leads.
- User A cannot access Tenant B sales.
- User A cannot download Tenant B private documents.
- User A cannot create a lead linked to a Tenant B vehicle.
- User A cannot change their tenant ID to access Tenant B.
- User A cannot bypass branch restrictions.
- Public APIs expose only approved public data.

Repeat these tests against direct API requests and database access paths, not just the frontend.

## 16.3 RBAC tests

Test every role against every sensitive permission.

Examples:

- Sales executive cannot modify subscription plans.
- Inventory manager cannot access private customer financial records without permission.
- Branch manager cannot modify another branch's records without authorization.
- Accountant cannot change platform administrator permissions.
- Dealership owner cannot access another dealership.
- Ordinary dealership users cannot access platform administration.

## 16.4 File security tests

- Reject unsupported file types.
- Reject oversized files.
- Reject spoofed MIME types.
- Reject unauthorized uploads.
- Reject cross-tenant downloads.
- Expired signed URLs no longer work.
- Public storage does not expose private documents.
- Deleted private documents are no longer accessible.

## 16.5 API security tests

- Reject unexpected request properties.
- Reject malformed UUIDs.
- Reject invalid enum values.
- Reject unauthorized sorting and filtering.
- Verify rate limits.
- Test SQL injection attempts.
- Test XSS payload handling.
- Verify safe error responses.
- Verify CORS behavior.

## 16.6 Automated testing

Use:

- Unit tests for authorization services and business rules.
- Integration tests for database policies and tenant boundaries.
- End-to-end tests for authentication and sensitive workflows.
- Dependency vulnerability scanning.
- Static analysis and linting.
- Secret scanning.
- Periodic manual security review.

A security test suite must run in CI before production deployment.

---

# 17. Security implementation checklist

## Phase 1 — Foundation

- [ ] HTTPS-only production traffic.
- [ ] Supabase Auth integration.
- [ ] JWT verification in NestJS.
- [ ] Secure session strategy.
- [ ] Environment-variable separation.
- [ ] Secrets excluded from Git.
- [ ] Global DTO validation.
- [ ] Safe exception handling.
- [ ] Security headers.

## Phase 2 — Tenant isolation

- [ ] Trusted tenant resolver.
- [ ] Verified custom-domain mapping.
- [ ] Membership validation.
- [ ] Tenant context guard.
- [ ] Tenant-scoped service methods.
- [ ] `tenant_id` on tenant-owned tables.
- [ ] Composite tenant-aware foreign keys.
- [ ] RLS enabled on all tenant-owned tables.
- [ ] RLS policies for SELECT, INSERT, UPDATE and DELETE.
- [ ] Cross-tenant integration tests.

## Phase 3 — Permissions

- [ ] RBAC implementation.
- [ ] Permission registry.
- [ ] Role-permission mapping.
- [ ] Branch-level access control.
- [ ] Platform administrator separation.
- [ ] Permission tests for each role.

## Phase 4 — Files and payments

- [ ] Private and public storage separation.
- [ ] File type and size validation.
- [ ] Tenant-scoped storage policies.
- [ ] Signed URLs for private files.
- [ ] Payment signature verification.
- [ ] Webhook idempotency.
- [ ] Server-side subscription enforcement.

## Phase 5 — Monitoring and operations

- [ ] Audit logging.
- [ ] Security event monitoring.
- [ ] Rate limiting.
- [ ] Suspicious activity alerts.
- [ ] Backup and restore tests.
- [ ] Incident response process.
- [ ] Dependency and secret scanning.
- [ ] Production security review.

---

# 18. Security rules for AI coding agents

Every AI coding agent working on this repository must follow these rules.

## 18.1 Before implementing a feature

1. Read `AGENTS.md`.
2. Read `docs/ARCHITECTURE.md`.
3. Read `docs/DATABASE.md`.
4. Read this `docs/SECURITY.md`.
5. Inspect the existing implementation.
6. Identify the affected tables, APIs, permissions and tenant boundaries.
7. Prepare an implementation plan before changing files.

## 18.2 During implementation

- Never trust `tenant_id` from a request body.
- Never trust role or permission values from the frontend.
- Never bypass authentication guards for convenience.
- Never bypass tenant validation.
- Never disable RLS to make a feature work.
- Never expose service-role keys.
- Never use elevated database credentials for routine tenant requests.
- Never expose private dealership information in public API responses.
- Never expose private documents through public URLs.
- Never assume UUIDs are authorization.
- Never implement a sensitive operation without server-side permission checks.
- Never introduce a new tenant-owned table without tenant isolation policies.
- Never add a new API endpoint without classifying it as public or protected.
- Never modify authentication or authorization behavior without corresponding tests.

## 18.3 After implementation

The agent must:

1. Run relevant unit tests.
2. Run integration tests.
3. Run tenant-isolation tests where relevant.
4. Check permissions for affected endpoints.
5. Check for accidental secret exposure.
6. Review public API response fields.
7. Review RLS and storage policies.
8. Update documentation.
9. Report any unresolved security risks.

If a feature cannot be implemented securely within the current architecture, the agent must explain the limitation before implementing a workaround.

---

# 19. Production security acceptance criteria

The application must not be considered production-ready until all critical conditions below are satisfied.

| Requirement | Acceptance condition |
|---|---|
| Authentication | All private APIs verify valid identities |
| Tenant isolation | No cross-tenant access through API or database |
| Authorization | Sensitive operations require correct permissions |
| Database | RLS and tenant-aware constraints are implemented |
| Secrets | No privileged credentials in frontend or repository |
| Public data | No private dealership or customer information exposed |
| Storage | Private files require authorized access |
| Payments | Webhooks are verified and idempotent |
| Logging | Sensitive actions are traceable |
| Rate limiting | Authentication and public endpoints are protected |
| Testing | Critical security tests pass in CI |
| Recovery | Backups and restoration have been tested |

**Critical release rule:** Any unresolved critical vulnerability, tenant-isolation failure, unauthorized access path, or exposed privileged credential blocks production release.

---

# 20. Final architectural security decision

The platform will follow this security model:

- Supabase Auth for identity.
- NestJS for centralized API authorization and business rules.
- Verified tenant resolution for dealership context.
- Active membership validation for private dealership access.
- RBAC for feature-level permissions.
- Branch-level authorization for restricted dealership operations.
- PostgreSQL RLS for database-level tenant isolation.
- Tenant-aware foreign keys for relationship integrity.
- Separate public and private storage policies.
- Server-side payment verification.
- Audit logs for sensitive operations.

Security is a core platform capability, not a feature to add after development.

Every new module—inventory, CRM, sales, employees, billing, reports, integrations or administration—must follow these rules from its first implementation.