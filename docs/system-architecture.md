# System Architecture - Auto Quotation v2.0.0

Last Updated: 2026-03-14 | Version: 2.0.0 (Multi-Tenant SaaS)

## Architecture Overview

Auto Quotation is a modern Next.js multi-tenant SaaS application with server-side rendering, client-side interactivity, and strong separation of concerns via a service layer. The system enforces role-based access control, tenant isolation, and provides a unified API for quote, document, and template management.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  React Components (19) + Tailwind CSS 4 + shadcn/ui    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
┌────────────────────┴──────────────────────────────────────┐
│                   Next.js 16 Server                        │
│  App Router │ Server/Client Components │ Middleware │     │
│  API Routes │ Server Actions │ Error Boundaries │          │
└────────────┬──────────────────────────────────────────┬───┘
             │                                          │
  ┌──────────┴────────────┐      ┌────────────────────┴──┐
  │  Business Logic Layer  │      │   External Services   │
  │  - Service layer      │      │  - Vercel Blob        │
  │    (Result<T> pattern)│      │  - Better Auth        │
  │  - Pricing engine     │      └───────────────────────┘
  │  - Template engine    │
  │  - Document gen       │
  │  - Validation (Zod)   │
  │  - RBAC helpers       │
  └────────────┬──────────┘
               │
  ┌────────────┴──────────────────┐
  │  Data Persistence Layer        │
  │  Drizzle ORM + PostgreSQL      │
  │  (Neon @neondatabase/serverless)
  │  Multi-tenant with row-level   │
  │  isolation via tenant_id       │
  └────────────────────────────────┘
```

## Layer Details

### 1. Presentation Layer

**Components:**
- Server page components (`src/app/**/*.tsx`) — fetch data, render server components
- Client components (`.tsx` with `'use client'`) — hooks, forms, interactivity
- UI components from shadcn/ui (Button, Dialog, Table, Form, etc.)
- Layout components (Navbar, Sidebar)

**Technology:**
- Next.js 16 App Router with dynamic routes
- React 19 with Server Components (default)
- Tailwind CSS 4 for responsive styling
- shadcn/ui for consistent, accessible UI
- Lucide React for icons

**Key Patterns:**
- Server components fetch data via Drizzle, pass to client components
- Form submission via Server Actions (`src/app/**/actions.ts`)
- Protected routes guarded by middleware
- Public routes (share, landing) bypass auth

### 2. Authentication & Authorization Layer

**Better Auth Integration:**
- Located: `src/auth/index.ts` (server), `src/auth/client.ts` (client)
- Email/password registration and login
- Session-based authentication with JWT tokens
- Email verification flow
- Automatic session refresh

**Middleware (`src/middleware.ts`):**
```typescript
// On every request:
// 1. Check session validity
// 2. Extract user from session
// 3. Find tenant membership (user → tenants via tenant_members)
// 4. Add to request context
// 5. Allow/deny based on route
```

**RBAC (Role-Based Access Control):**
- Roles: OWNER > ADMIN > MEMBER > VIEWER
- Stored in `tenant_members.role` table
- Enforced via helpers (`requireRole()`, `hasPermission()`)
- Applied at route level and service layer

### 3. Tenant Context & Isolation

**Tenant Context (`src/lib/tenant-context.ts`):**
```typescript
export async function getTenantContext() {
  const session = await auth.api.getSession();
  const user = session?.user;
  if (!user) throw new Error("Not authenticated");

  const membership = await db.query.tenantMembers.findFirst({
    where: eq(tenantMembers.userId, user.id)
  });

  return { userId: user.id, tenantId: membership.tenantId, role: membership.role };
}
```

**Data Isolation:**
- Every query filters `WHERE tenantId = ?` automatically
- Services layer applies tenant context to all DB operations
- No cross-tenant data leakage possible

### 4. Business Logic Layer (Services)

**Services** (`src/services/*.ts`):

| Service | Purpose | Key Functions |
|---------|---------|---|
| `quote-service.ts` | Quote CRUD, pricing, exports | createQuote, updateQuote, calculateTotal, exportPDF, exportExcel |
| `product-service.ts` | Products, pricing tiers, discounts | createProduct, importFromExcel, applyVolumeDiscount |
| `customer-service.ts` | Customer management | createCustomer, linkQuoteHistory |
| `document-service.ts` | Document generation | generateFromTemplate, storeDocument |
| `template-service.ts` | Template management, field extraction | analyzeTemplate, detectFields, createTemplate |
| `invite-service.ts` | Team invitations | sendInvite, acceptInvite, revokeInvite |
| `settings-service.ts` | Tenant configuration | updateCompanyInfo, setDefaults |
| `dashboard-service.ts` | Dashboard metrics | getRecentQuotes, getStatistics |

**Service Pattern (Result<T>):**
```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createQuote(input: QuoteInput): Promise<Result<Quote>> {
  try {
    const context = await getTenantContext();
    await requireRole("MEMBER"); // or higher

    const quote = await db.insert(quotes).values({
      ...input,
      tenantId: context.tenantId,
    }).returning();

    return { success: true, data: quote };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 5. Database Layer (Drizzle ORM)

**Database Client (`src/db/index.ts`):**
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
```

**Schema Location:** `src/db/schema/*.ts` (13 files, one per table/domain)

**Connection Strategy:**
- @neondatabase/serverless for Vercel edge functions
- Connection pooling via Neon proxy
- No hot connection pools (Neon manages)

### 6. Unified Template Engine

**Template Types:**
- Excel templates with named cell references (`{customerName}`, `{quoteNumber}`)
- PDF templates with region definitions (`{items}`, `{total}`)

**Processing Flow:**
```
1. User uploads template (Excel/PDF)
   ↓
2. Template service analyzes structure
   - Extract named ranges (Excel)
   - Detect placeholder patterns
   ↓
3. Store in document_templates table
   ↓
4. On document generation:
   - Fetch template
   - Replace placeholders with quote/customer data
   - Generate PDF/Excel output
   ↓
5. Store generated doc in documents table
```

**Key Module:** `src/lib/template-engine/`

## Data Models (13 Tables)

### Auth Tables (Better Auth Standard)

```
user (id, name, email, emailVerified, image, createdAt, updatedAt)
├─ users have sessions
├─ users have accounts (OAuth)
└─ users link to tenants via tenant_members

session (id, token, userId, expiresAt, ipAddress, userAgent, createdAt)
├─ one user → many sessions
└─ used for authentication

account (id, userId, provider, tokens, scope, password, createdAt)
└─ link to OAuth providers (future)

verification (id, identifier, value, expiresAt, createdAt)
└─ email verification tokens
```

### Tenant & Organization

```
tenants (id, name, createdAt, updatedAt)
├─ primaryColor, logoUrl (Vercel Blob)
├─ quoteNumberPrefix, defaultVAT, defaultShipping
├─ companyName, address, phone, email, taxCode
├─ bankName, bankAccount, bankOwner
└─ customTerms, greetingText

tenant_members (id, userId, tenantId, role, createdAt)
├─ role: OWNER | ADMIN | MEMBER | VIEWER
└─ defines user's permissions in tenant

tenant_invites (id, email, tenantId, invitedBy, expiresAt, createdAt)
└─ pending invitations for team members
```

### Core Business Models

```
categories (id, tenantId, name, sortOrder)
└─ product categories

units (id, tenantId, name)
└─ measurement units (Tháng, Cái, etc.)

products (id, tenantId, code, name, basePrice, pricingType)
├─ pricingType: FIXED | TIERED
└─ with relations to pricingTiers, volumeDiscounts

customers (id, tenantId, name, company, phone, email, address, notes)
└─ customer records with quote history

quotes (id, tenantId, quoteNumber, customerId, status)
├─ status: DRAFT | SENT | ACCEPTED | REJECTED | EXPIRED
├─ pricing: globalDiscountPercent, vatPercent, shippingFee
├─ items: [] (QuoteItem[])
└─ shareToken: secure link token
```

### Template & Document Models

```
document_templates (id, tenantId, name, type)
├─ type: EXCEL | PDF | HTML
├─ content: template binary/string
└─ fields: extracted placeholders

documents (id, tenantId, templateId, quoteId)
├─ content: generated output
├─ generatedAt: timestamp
└─ documentNumber: for tracking
```

## Data Flow Diagrams

### Quote Creation Flow

```
┌─────────────────────────────────────────┐
│  User: Dashboard / Quotes / New          │
│  (Server Component)                      │
│  - Fetch products, customers via DB      │
└────────────────┬────────────────────────┘
                 │ render → client component
                 ↓
┌──────────────────────────────────────────┐
│  QuoteBuilder (Client Component)          │
│  - useState for form state                │
│  - select customer, add items             │
│  - adjust pricing, discounts              │
│  - drag-reorder items                     │
└────────────────┬─────────────────────────┘
                 │ onSubmit → Server Action
                 ↓
┌──────────────────────────────────────────┐
│  Server Action: createQuote               │
│  1. getTenantContext() → extract tenant   │
│  2. Validate input with Zod schema        │
│  3. requireRole("MEMBER") → check RBAC    │
│  4. Call quote-service.createQuote()      │
│     - Calculate totals via pricing engine │
│     - Insert quote + items to DB          │
│  5. Return { success, quoteId }           │
│  6. revalidatePath("/quotes")             │
│  7. Redirect to quote detail              │
└──────────────────────────────────────────┘
```

### PDF Export Flow

```
┌──────────────────────────┐
│  User clicks: Export PDF  │
│  GET /api/export/pdf/[id]│
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  API Route Handler                    │
│  1. Extract quoteId from params       │
│  2. getTenantContext()                │
│  3. Fetch quote + items, customer     │
│  4. Fetch company settings (branding) │
│  5. Call generatePDFQuote()           │
│     - @react-pdf/renderer             │
│     - Layout: header, items, footer   │
│     - Apply brand colors, logo        │
│  6. Return PDF bytes                  │
│  7. Browser downloads as file         │
└──────────────────────────────────────┘
```

### Document Template Generation

```
┌────────────────────────────┐
│  User: Generate Document    │
│  Select template, quote      │
└────────────┬────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  Server Action: generateDocument      │
│  1. Fetch template from DB            │
│  2. Fetch quote + customer data       │
│  3. Call template-service.generate()  │
│     - If Excel: replace cells         │
│     - If PDF: replace regions         │
│  4. Save to documents table           │
│  5. Return document URL               │
└──────────────────────────────────────┘
```

### RBAC Decision Tree

```
Request arrives
    ↓
Middleware extracts session + tenant
    ↓
Route handler / Server Action
    ↓
requireRole("ROLE") check:
    ├─ If role ≥ required: allow
    ├─ If role < required: throw unauthorized
    └─ If no session: redirect to login
    ↓
Service layer executes business logic
    ↓
All DB queries filter by tenantId
    ↓
Response returned to client
```

## API Endpoints (v2.0.0)

### Public (No Auth)

**Share Page:**
- `GET /share/[token]` - Public quote preview (secure token required)

**Landing:**
- `GET /` (redirects to /login if not authenticated, else dashboard)

### Authenticated Routes

**Dashboard:**
- `GET /` - Dashboard with stats
- `GET /onboarding` - Tenant setup wizard

**Quote Management:**
- `GET /quotes` - List quotes (paginated, filtered)
- `POST /quotes` - Create quote (Server Action)
- `GET /quotes/[id]` - View quote detail
- `PUT /quotes/[id]` - Update quote (Server Action)
- `DELETE /quotes/[id]` - Delete quote (Server Action)
- `POST /quotes/[id]/clone` - Duplicate quote

**Products:**
- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/[id]` - Update product
- `DELETE /products/[id]` - Delete product
- `POST /products/import` - Bulk import from Excel

**Customers:**
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `PUT /customers/[id]` - Update customer
- `DELETE /customers/[id]` - Delete customer

**Documents:**
- `GET /documents` - List documents
- `POST /documents` - Create from template
- `GET /documents/[id]` - Download document
- `DELETE /documents/[id]` - Delete document

**Templates:**
- `GET /templates` - List templates
- `POST /templates` - Upload template
- `POST /api/doc-template/analyze` - Extract fields from upload
- `DELETE /templates/[id]` - Delete template

**Settings:**
- `GET /settings` - View tenant configuration
- `PUT /settings` - Update company info, branding, defaults

**Team Management:**
- `GET /settings/team` - List team members (role-based visibility)
- `POST /settings/team/invite` - Send invitation
- `DELETE /settings/team/[userId]` - Remove member

### Internal API Routes

**Export Endpoints:**
- `GET /api/export/pdf/[quoteId]` - Generate & download PDF
- `GET /api/export/excel/[quoteId]` - Generate & download Excel

**Document API:**
- `POST /api/doc-template/analyze` - Detect template fields
- `POST /api/doc-export/generate` - Generate doc from template

**Auth API (Better Auth):**
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signup` - Register new account
- `POST /api/auth/signout` - Terminate session
- `POST /api/auth/verify-email` - Verify email token

## Security Architecture

### Authentication
- Better Auth handles session validation
- JWT-based tokens with configurable expiry
- Email verification required for signup
- Secure session cookies (HTTP-only, Secure, SameSite)

### Authorization (RBAC)
- Roles enforced at service layer via `requireRole()`
- Database-backed: `tenant_members.role`
- Four roles: OWNER, ADMIN, MEMBER, VIEWER
- Future: permission matrix (fine-grained controls)

### Data Protection
- Multi-tenant isolation: `WHERE tenantId = ?` on all queries
- Parameterized Drizzle queries prevent SQL injection
- Zod validation on all user inputs
- File uploads validated (size, type)
- Secure token generation for share links (UUID v4)

### Infrastructure
- HTTPS enforced by Vercel
- Environment variables for secrets
- No hardcoded API keys or DB credentials
- Vercel Blob for file storage (isolated by token)
- Automatic security headers (Vercel defaults)

## Performance Optimization

### Database
- Indexes on foreign keys (tenantId, userId, quoteId)
- Eager loading via Drizzle `select` to avoid N+1
- Pagination (20 items default) for large result sets
- Connection pooling via @neondatabase/serverless

### Frontend
- Server-side rendering for data fetching
- Dynamic imports for heavy components
- Next.js automatic image optimization (Vercel Image)
- CSS-in-JS with Tailwind (optimized via postcss)
- Revalidation after mutations (incremental static)

### Caching
- Next.js automatic cache for `generateMetadata`
- `revalidatePath()` after mutations
- Browser cache for static assets
- CDN via Vercel Edge Network

## Scalability Considerations

### Horizontal
- Stateless API routes → multiple edge functions
- Database pooling via Neon (auto-scale connections)
- Static assets on CDN (Vercel)

### Vertical
- Server-side PDF generation (prevents client DOS)
- Incremental document imports (chunked processing)
- Pagination for large datasets

### Multi-Tenant
- Shared infrastructure costs
- Per-tenant metrics/quotas (future)
- Tenant isolation via database schema

## Deployment Architecture

**Hosting:** Vercel with automatic deployments

```
Git push to main/prod branch
    ↓
Vercel detects changes
    ↓
Build process:
    ├─ pnpm install
    ├─ pnpm run build
    ├─ Type check with tsc
    └─ Deploy edge functions + static
    ↓
Environment variables loaded
    ↓
Database migrations (if any)
    ↓
Live at https://auto-quotation.vercel.app
    ↓
CDN caches static assets
    ↓
Neon DB handles connections
```

## Technology Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | Next.js 16 | Server/Client components, built-in optimization, Vercel seamless |
| Database | PostgreSQL + Neon | ACID, JSON support, serverless, multi-tenant ready |
| ORM | Drizzle | Type-safe, excellent DX, Neon integration, fast queries |
| Auth | Better Auth | Email/password, sessions, no extra services, self-hosted |
| Validation | Zod | Runtime validation, TypeScript integration, clean API |
| UI | shadcn/ui + Tailwind | Accessible, customizable, modern, CSS 4 support |
| PDF | @react-pdf/renderer | Server-side, React integration, professional output |
| Excel | ExcelJS | Rich formatting, streaming, multi-sheet support |

## Limitations & Trade-offs

| Trade-off | Benefit | Cost |
|-----------|---------|------|
| Shared DB multi-tenant | Cost-efficient, simpler operations | Row-level isolation overhead |
| Denormalized settings in tenant | Fast reads, less joins | Disk space, cache invalidation |
| Server-side PDF gen | Prevents DOS, professional output | Higher CPU usage |
| Session-based auth (not OAuth) | Simpler for B2B SME market | OAuth for future |
| Zod validation every request | Catches invalid data | Small latency per request |

## Future Architectural Changes

**Phase 7+ Enhancements:**

1. **Email Notifications**
   - Resend integration → background jobs
   - Webhook triggers on quote status change
   - Template-based email bodies

2. **Analytics & Tracking**
   - Event logging to separate table
   - Quote view tracking (anonymized)
   - Dashboard metrics (revenue, pipeline)

3. **API for Integrations**
   - Rate limiting per tenant
   - API keys stored in DB
   - OAuth2 for third-party access

4. **Multi-Currency Support**
   - Currency field in tenant config
   - Exchange rate service (future)
   - Formatting by locale

5. **Advanced Reporting**
   - Query builder UI
   - Export to CSV/PDF
   - Scheduled reports

---

**Last Updated:** 2026-03-14 | **Next Review:** 2026-04-14
