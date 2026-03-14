# Codebase Summary - Auto Quotation v2.0.0

Generated: 2026-03-14 | Version: 2.0.0 (Multi-Tenant SaaS)

## Overview

Auto Quotation is a production-grade Next.js 16 multi-tenant SaaS application for professional quotation management. Built with React 19, Drizzle ORM, Better Auth, and Tailwind CSS 4. The codebase emphasizes clean separation of concerns through a service layer pattern, comprehensive RBAC, and row-level tenant isolation.

**Total Source Files:** 140+ TypeScript/TSX files across app routes, components, services, auth, and utilities.

## Directory Structure

### `/src/app` — Next.js App Router (60+ files)

**Protected Routes (Dashboard):**

```
(dashboard)/
├── page.tsx                 # Dashboard home with stats
├── layout.tsx              # Dashboard layout with nav/sidebar
├── error.tsx               # Error boundary for dashboard
├── loading.tsx             # Suspense fallback
├── onboarding/             # Tenant setup wizard
│   ├── page.tsx
│   └── actions.ts          # Onboarding flow Server Actions
├── quotes/                 # Quote management
│   ├── page.tsx            # List quotes (paginated)
│   ├── actions.ts          # Create, update, delete Server Actions
│   ├── loading.tsx
│   ├── new/
│   │   └── page.tsx        # Create quote form
│   └── [id]/
│       └── page.tsx        # Quote detail/edit page
├── products/               # Product catalog
│   ├── page.tsx
│   ├── actions.ts
│   └── loading.tsx
├── customers/              # Customer management
│   ├── page.tsx
│   ├── actions.ts
│   └── loading.tsx
├── documents/              # Document templates & generated docs
│   ├── page.tsx            # List documents
│   ├── actions.ts
│   ├── new/
│   │   └── page.tsx        # Generate from template
│   ├── [id]/
│   │   └── page.tsx        # Document detail
│   └── loading.tsx
├── templates/              # Template management
│   ├── page.tsx            # List templates
│   ├── actions.ts
│   ├── new/
│   │   └── page.tsx        # Upload template
│   ├── [id]/
│   │   └── page.tsx        # Template detail
│   └── loading.tsx
└── settings/               # Company settings & team management
    ├── page.tsx            # Settings form
    ├── actions.ts
    └── loading.tsx
```

**Auth Routes:**

```
(auth)/
├── layout.tsx
├── login/
│   ├── page.tsx            # Sign in form
│   └── actions.ts
└── register/
    ├── page.tsx            # Sign up form
    └── actions.ts
```

**Public Routes:**

```
onboarding/
├── page.tsx                # Public landing/onboarding

share/
├── [token]/
│   └── page.tsx            # Public quote preview (no auth)

api/
├── auth/
│   └── [...all]/route.ts   # Better Auth API routes
├── export/
│   ├── pdf/
│   │   └── [quoteId]/route.ts     # PDF generation endpoint
│   └── excel/
│       └── [quoteId]/route.ts     # Excel generation endpoint
├── doc-template/
│   └── analyze/route.ts    # Extract template fields
└── doc-export/
    └── [...]/ route.ts     # Generate documents from templates
```

### `/src/components` — React Components (45+ files)

**Component Organization by Domain:**

```
ui/                         # shadcn/ui base components
├── button.tsx
├── dialog.tsx
├── table.tsx
├── form.tsx
├── input.tsx
├── select.tsx
└── ... (20+ shadcn components)

dashboard/                  # Dashboard-specific components
├── dashboard-header.tsx    # Title and filters
├── dashboard-stats.tsx     # Stats cards (quote count, etc)
├── dashboard-recent-quotes.tsx  # Recent quotes list
├── dashboard-client.tsx    # Client-side logic

quote/                      # Quote builder and display
├── quote-builder.tsx       # Main quote form
├── quote-items-table.tsx   # Items list with edit/delete
├── quote-pricing-summary.tsx  # Subtotal, VAT, total display
├── quote-actions.tsx       # Export, share, clone buttons
├── quote-preview.tsx       # PDF/Excel preview
├── quote-settings-dialog.tsx  # Global discount, VAT, fees
└── quote-page-client.tsx   # Client-side interactions

product/                    # Product management
├── product-data-table.tsx  # Products list (searchable, sortable)
├── product-dialog.tsx      # Create/edit product form
├── product-import-wizard.tsx  # Excel import flow (3-step)
└── product-page-client.tsx

customer/                   # Customer management
├── customer-data-table.tsx
├── customer-dialog.tsx     # Create/edit customer
└── customer-page-client.tsx

document/                   # Document templates & generation
├── template-upload-dialog.tsx  # Upload Excel/PDF template
├── template-field-detector.tsx  # Show extracted fields
├── document-generator.tsx   # Select template, generate
└── document-list.tsx

settings/                   # Settings and team management
├── settings-form.tsx       # Company info, branding, defaults
├── logo-uploader.tsx       # Logo upload to Vercel Blob
├── settings-tabs.tsx       # Tab navigation
├── team-members-list.tsx   # Team roster with roles
├── team-invite-form.tsx    # Send invite dialog
└── settings-page-client.tsx

layout/                     # Layout components
├── navbar.tsx              # Top navigation with user menu
├── sidebar.tsx             # Left sidebar with menu
├── main-layout.tsx         # Wrapper layout
└── breadcrumb.tsx
```

**Key Pattern:** Most domain features follow the `*-page-client.tsx` pattern where the page component (server) fetches data and renders a client component for interactivity.

### `/src/auth` — Authentication (Better Auth)

```
auth/
├── index.ts                # Server-side auth setup
│   ├── Initialize Better Auth
│   ├── Configure email/password plugin
│   ├── Set up database adapter (Drizzle)
│   └── Define auth routes
└── client.ts               # Client-side helper functions
    ├── getSession()
    ├── signIn()
    ├── signUp()
    ├── signOut()
    └── useAuth() hook (future)
```

### `/src/db` — Database Layer (Drizzle ORM)

```
db/
├── index.ts                # Drizzle client initialization
│   ├── postgres.js client setup
│   ├── Neon @neondatabase/serverless
│   └── Export: export const db = drizzle(...)
└── schema/                 # 13 table definitions
    ├── index.ts            # Re-exports all tables and relations
    ├── enums.ts            # Enum types (Role, Status, PricingType)
    ├── auth.ts             # Better Auth tables (user, session, account, verification)
    ├── tenants.ts          # Tenants table + relations
    ├── tenant-members.ts   # User-tenant membership with roles
    ├── tenant-invites.ts   # Pending invitations
    ├── categories.ts       # Product categories
    ├── units.ts            # Measurement units
    ├── products.ts         # Products with pricing tiers
    ├── customers.ts        # Customers
    ├── quotes.ts           # Quotations
    ├── document-templates.ts  # Reusable templates
    └── documents.ts        # Generated documents
```

**Schema Tables (13 Total):**

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `user` | User accounts | id, name, email, emailVerified, image |
| `session` | Active sessions | id, userId, token, expiresAt, ipAddress |
| `account` | OAuth accounts | id, userId, provider, tokens |
| `verification` | Email verification | id, identifier, value, expiresAt |
| `tenants` | Organizations | id, name, primaryColor, logoUrl, defaults |
| `tenant_members` | User-org membership | userId, tenantId, role |
| `tenant_invites` | Pending invites | email, tenantId, invitedBy, expiresAt |
| `categories` | Product categories | id, tenantId, name, sortOrder |
| `units` | Measurement units | id, tenantId, name |
| `products` | Products | id, tenantId, code, name, basePrice, pricingType |
| `customers` | Customers | id, tenantId, name, company, phone, email, address |
| `quotes` | Quotations | id, tenantId, quoteNumber, customerId, status, total |
| `document_templates` | Reusable templates | id, tenantId, name, type, content |
| `documents` | Generated documents | id, tenantId, templateId, quoteId, content |

### `/src/lib` — Utilities & Business Logic (35+ files)

**Core Modules:**

| Module | Purpose |
|--------|---------|
| `tenant-context.ts` | Extract tenantId + userId from session → `getTenantContext()` |
| `rbac.ts` | RBAC helpers → `requireRole()`, `hasPermission()` |
| `constants.ts` | Default values (quote prefix, VAT, colors, terms) |
| `db.ts` | ~~Deprecated~~ Use `/src/db/index.ts` instead |

**Business Logic:**

| Module | Purpose | Key Functions |
|--------|---------|---|
| `pricing-engine.ts` | Quote pricing calculations | calculateQuoteTotal, applyVolumeDiscount, applyTierPricing |
| `format-currency.ts` | Format numbers as VND | formatCurrency, formatPrice |
| `format-number-to-words.ts` | Numbers to Vietnamese text | numberToWords |
| `generate-quote-number.ts` | Auto-generate quote numbers | generateQuoteNumber |

**PDF & Export:**

| Module | Purpose |
|--------|---------|
| `pdf/font-registration.ts` | Register fonts for PDF generation |
| `generate-pdf-quote.tsx` | @react-pdf/renderer templates |
| `generate-excel-quote.ts` | ExcelJS workbook creation |

**Template Engine:**

```
template-engine/
├── extract-fields.ts       # Parse {fieldName} placeholders
├── detect-regions.ts       # Identify table/list regions
├── apply-placeholder.ts    # Replace placeholders with data
└── types.ts                # Template types
```

**Validation Schemas (Zod):**

```
validations/
├── auth-schemas.ts         # Login, register validation
├── quote-schemas.ts        # Quote form validation
├── product-schemas.ts      # Product form validation
├── customer-schemas.ts     # Customer form validation
├── settings-schemas.ts     # Settings form validation
└── template-schemas.ts     # Template upload validation
```

**Testing:**

```
__tests__/
├── pricing-engine.test.ts  # Quote pricing calculations
├── format-currency.test.ts
└── ... (unit tests)
```

### `/src/services` — Business Logic Layer (8 files)

Service layer implements Result<T> pattern for consistent error handling.

```
services/
├── quote-service.ts        # Quote CRUD, status updates, exports
├── product-service.ts      # Product CRUD, import, pricing
├── customer-service.ts     # Customer CRUD, quote history
├── document-service.ts     # Document generation, storage
├── template-service.ts     # Template management, field extraction
├── invite-service.ts       # Team invitations, acceptance
├── settings-service.ts     # Tenant configuration updates
└── dashboard-service.ts    # Dashboard metrics, recent quotes
```

**Service Pattern Example:**

```typescript
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createQuote(input: QuoteInput): Promise<Result<Quote>> {
  try {
    const context = await getTenantContext();
    await requireRole("MEMBER");
    // ... business logic
    return { success: true, data: quote };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Key Patterns

### Multi-Tenant Isolation

Every database query includes tenant filtering:

```typescript
const quotes = await db.query.quotes.findMany({
  where: eq(quotes.tenantId, tenantId), // Always filter
  with: { items: true, customer: true },
});
```

### RBAC (Role-Based Access Control)

```typescript
// In Server Actions/Services
await requireRole("MEMBER"); // Throws if insufficient permissions

// Roles: OWNER > ADMIN > MEMBER > VIEWER
```

### Service Layer

All business logic in `src/services/*.ts` with Result<T> returns:

```typescript
const result = await createQuote(data);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

### Server Actions

Form submissions use Server Actions defined in `actions.ts` files:

```typescript
// src/app/(dashboard)/quotes/actions.ts
"use server";

export async function saveQuote(data: QuoteInput) {
  const result = await createQuote(data);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath("/quotes");
  return { success: true, quoteId: result.data.id };
}
```

## Routes & URLs (English)

**Public:**
- `/` - Redirect to /login (guest) or dashboard (authenticated)
- `/login` - Sign in page
- `/register` - Sign up page
- `/share/[token]` - Public quote preview (no auth)

**Protected (Dashboard):**
- `/` - Dashboard home
- `/onboarding` - Tenant setup wizard
- `/quotes` - Quote list
- `/quotes/new` - Create quote
- `/quotes/[id]` - Quote detail/edit
- `/products` - Product catalog
- `/customers` - Customer list
- `/documents` - Generated documents
- `/templates` - Template management
- `/settings` - Company settings

**API:**
- `GET /api/auth/session` - Current session
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signout` - Sign out
- `GET /api/export/pdf/[quoteId]` - PDF download
- `GET /api/export/excel/[quoteId]` - Excel download
- `POST /api/doc-template/analyze` - Extract template fields
- `POST /api/doc-export/generate` - Create document

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js + React | 16.0 + 19.0 |
| **Language** | TypeScript | 5.4+ |
| **Database** | PostgreSQL (Neon) | 15+ |
| **ORM** | Drizzle | Latest + @neondatabase/serverless |
| **Auth** | Better Auth | Latest (email/password) |
| **Styling** | Tailwind CSS + shadcn/ui | 4.0 + latest |
| **Forms** | React Hook Form + Zod | Latest |
| **PDF** | @react-pdf/renderer | Latest |
| **Excel** | ExcelJS | Latest |
| **Deployment** | Vercel | Edge functions |
| **Testing** | Vitest | Latest |

## File Size Guidelines

Target to keep files under:
- **Components:** < 200 LOC
- **Services:** < 250 LOC
- **Utilities:** < 150 LOC
- **Type files:** Can be longer (grouped types)

## Build & Development

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint --fix

# Testing
pnpm test
pnpm test -- --coverage

# Build for production
pnpm build
pnpm start
```

## Database Commands

```bash
# Generate Drizzle types (if schema changes)
pnpm drizzle-kit generate:pg

# Push schema to database
pnpm drizzle-kit push:pg

# Seed database (if seed script exists)
pnpm db:seed
```

## Key Modules Summary

### Tenant Management
- `getTenantContext()` — Extract tenant from session
- `tenant_members` table — User roles in tenant
- Row-level isolation via `tenantId` filters

### RBAC
- `requireRole(role)` — Check user permission
- `hasPermission(action)` — Check feature access
- Roles: OWNER, ADMIN, MEMBER, VIEWER

### Quote Features
- Services: `quote-service.ts`
- Components: `quote/` directory
- Pricing: `pricing-engine.ts`
- Export: `generate-pdf-quote.tsx`, `generate-excel-quote.ts`

### Documents & Templates
- Services: `template-service.ts`, `document-service.ts`
- Components: `document/` directory
- Engine: `template-engine/` utilities

### Team Management
- Services: `invite-service.ts`
- Components: `settings/team-*`
- Tables: `tenant_members`, `tenant_invites`

## Next Documentation

- [System Architecture](./system-architecture.md) — Technical design, data flows
- [Code Standards](./code-standards.md) — Patterns, conventions, examples
- [Deployment Guide](./deployment-guide.md) — Setup, env vars, commands
- [Development Roadmap](./development-roadmap.md) — Phase tracking

---

**Last Updated:** 2026-03-14 | **Next Review:** 2026-04-14
