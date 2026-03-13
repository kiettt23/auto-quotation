---
title: "Phase 1: Foundation"
status: pending
priority: P1
effort: 3w
---

# Phase 1: Foundation

## Context Links

- [Brainstorm Report](../reports/brainstorm-260313-1336-production-saas-rewrite.md)
- [plan.md](./plan.md) | [Phase 2](./phase-02-core-business.md)

## Overview

Setup Drizzle ORM, full multi-tenant schema, Better Auth, middleware, shared utils. This phase produces the foundation ALL other phases depend on. Nothing else starts until Phase 1 is complete.

## Key Insights

- Drizzle replaces Prisma entirely — remove `prisma/` dir, `@prisma/*` deps
- Better Auth manages its own tables (`user`, `session`, `account`) — we add `tenant`, `tenant_member` on top
- Every business table gets `tenant_id` column + composite unique constraints
- Old `Settings` singleton merges into `tenants` table
- Must define `Result` type pattern, tenant context helper, shared PDF font registration upfront

## Requirements

### Functional
- Drizzle ORM connected to Neon PostgreSQL
- Complete DB schema (all tables) defined in Drizzle
- Better Auth: email/password register, login, logout, session management
- Tenant creation on first registration (auto-create org)
- Auth middleware protecting `/(dashboard)/*` routes
- Tenant context injection (current user + tenant available in server actions)
- Seed script for demo data

### Non-Functional
- Type-safe queries — no `as any` casts
- Schema changes via Drizzle migrations (`drizzle-kit`)
- Connection pooling via `@neondatabase/serverless`

## Architecture

### Data Flow
```
Request -> Next.js Middleware (auth check) -> Route Handler/Server Action
  -> getTenantContext() -> { userId, tenantId, role }
  -> Drizzle query with .where(eq(table.tenantId, ctx.tenantId))
```

### Better Auth Flow
```
Register -> Create user (Better Auth) -> Create tenant -> Create tenant_member (OWNER)
Login -> Better Auth session -> Middleware reads session -> Injects into headers
```

## New Directory/File Structure

```
src/
  db/
    index.ts                          # Drizzle client + connection
    schema/
      index.ts                        # Re-export all schemas
      tenants.ts                      # tenants table
      auth.ts                         # Better Auth tables (user, session, account, verification)
      tenant-members.ts               # tenant_members join table
      categories.ts                   # categories table
      units.ts                        # units table
      products.ts                     # products, pricing_tiers, volume_discounts
      customers.ts                    # customers table
      quotes.ts                       # quotes, quote_items
      document-templates.ts           # document_templates table
      documents.ts                    # documents table
      enums.ts                        # pgEnum definitions (pricing_type, quote_status, member_role, file_type)
    seed.ts                           # Seed script (demo tenant + data)
    migrate.ts                        # Migration runner
  auth/
    index.ts                          # Better Auth server instance
    client.ts                         # Better Auth client instance
  lib/
    tenant-context.ts                 # getTenantContext() helper
    result.ts                         # Result<T> type + helpers
    constants.ts                      # App-wide constants (default terms, VAT, etc.)
    pdf/
      font-registration.ts           # Single font registration source
      common-styles.ts               # Shared PDF styles
    pricing-engine.ts                 # COPY from current (pure functions, no changes needed)
    format-number-to-words.ts         # COPY from current
    format-currency.ts                # COPY from current
    generate-doc-number.ts            # Generalized from generate-quote-number.ts (works for any prefix)
    validations/
      common.ts                       # Shared Zod helpers (tenantId refinement, etc.)
  middleware.ts                       # Next.js middleware (auth guard + tenant header injection)
  app/
    (auth)/
      login/page.tsx                  # Login page (placeholder, fleshed out Phase 4)
      register/page.tsx               # Register page (placeholder)
      layout.tsx                      # Auth layout (centered card)
    (dashboard)/
      layout.tsx                      # Dashboard layout with sidebar (rewrite, English routes)
    api/
      auth/[...all]/route.ts          # Better Auth API route handler
drizzle.config.ts                     # Drizzle Kit config
```

## Full Drizzle Schema

### `src/db/schema/enums.ts`
```ts
import { pgEnum } from "drizzle-orm/pg-core";

export const pricingTypeEnum = pgEnum("pricing_type", ["FIXED", "TIERED"]);
export const quoteStatusEnum = pgEnum("quote_status", ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]);
export const memberRoleEnum = pgEnum("member_role", ["OWNER", "ADMIN", "MEMBER", "VIEWER"]);
export const fileTypeEnum = pgEnum("file_type", ["excel", "pdf"]);
```

### `src/db/schema/tenants.ts`
```ts
// Fields: id (cuid), name, slug (unique), logo_url, primary_color,
// company_name, address, phone, email, tax_code, website,
// bank_name, bank_account, bank_owner,
// greeting_text, default_terms,
// show_amount_in_words, show_bank_info, show_signature_blocks, show_footer_note, footer_note,
// quote_prefix, quote_next_number, default_vat_percent (numeric(5,2)), default_validity_days, default_shipping (numeric(15,0)),
// created_at, updated_at
// This merges the old Settings singleton — each tenant has its own config.
```

### `src/db/schema/auth.ts`
Follow Better Auth's Drizzle adapter schema exactly. Tables: `user`, `session`, `account`, `verification`.
- `user` has: id, name, email, emailVerified, image, createdAt, updatedAt
- Add custom fields to user: none needed (tenant linkage via tenant_members)

### `src/db/schema/tenant-members.ts`
```ts
// Fields: id, user_id (FK user), tenant_id (FK tenants), role (memberRoleEnum), created_at
// Unique constraint on (user_id, tenant_id)
// A user can belong to multiple tenants
```

### `src/db/schema/categories.ts`
```ts
// Fields: id, tenant_id (FK tenants, NOT NULL), name, sort_order (default 0), created_at
// Index on tenant_id
```

### `src/db/schema/units.ts`
```ts
// Fields: id, tenant_id (FK tenants, NOT NULL), name, created_at
// Index on tenant_id
```

### `src/db/schema/products.ts`
```ts
// products: id, tenant_id, code, name, description, notes, category_id (FK), unit_id (FK),
//   base_price (numeric(15,0)), pricing_type (pricingTypeEnum), created_at, updated_at
// Unique constraint on (tenant_id, code) — code unique per tenant
// Indexes: tenant_id, category_id, (tenant_id + code)

// pricing_tiers: id, product_id (FK products, cascade), min_quantity, max_quantity (nullable),
//   price (numeric(15,0))
// Index: product_id

// volume_discounts: id, product_id (FK products, cascade), min_quantity,
//   discount_percent (numeric(5,2))
// Index: product_id
```

### `src/db/schema/customers.ts`
```ts
// Fields: id, tenant_id, name, company, phone, email, address, notes, created_at, updated_at
// Index: tenant_id
```

### `src/db/schema/quotes.ts`
```ts
// quotes: id, tenant_id, quote_number, customer_id (FK customers, set null),
//   customer_name, customer_company, customer_phone, customer_email, customer_address,
//   status (quoteStatusEnum), valid_until,
//   global_discount_percent (numeric(5,2)), vat_percent (numeric(5,2)),
//   shipping_fee (numeric(15,0)), other_fees (numeric(15,0)), other_fees_label,
//   subtotal (numeric(15,0)), discount_amount (numeric(15,0)), vat_amount (numeric(15,0)), total (numeric(15,0)),
//   notes, terms, share_token (unique),
//   created_at, updated_at
// Unique: (tenant_id, quote_number)
// Indexes: tenant_id, customer_id, share_token, status

// quote_items: id, quote_id (FK quotes, cascade), product_id (FK products, set null),
//   sort_order, name, description, unit,
//   quantity, unit_price (numeric(15,0)), discount_percent (numeric(5,2)), line_total (numeric(15,0)),
//   is_custom_item (boolean)
// Index: quote_id
```

### `src/db/schema/document-templates.ts`
```ts
// Fields: id, tenant_id, name, description, file_type (fileTypeEnum),
//   file_base64 (text), sheet_name, placeholders (jsonb), table_region (jsonb, nullable),
//   is_builtin (boolean, default false), doc_prefix, doc_next_number,
//   created_at, updated_at
// Index: tenant_id
```

### `src/db/schema/documents.ts`
```ts
// Fields: id, tenant_id, template_id (FK document_templates, cascade),
//   doc_number, field_data (jsonb), table_rows (jsonb),
//   created_at, updated_at
// Unique: (tenant_id, doc_number)
// Index: tenant_id, template_id
```

## Implementation Steps

### Step 1: Create branch and install deps
1. `git checkout -b rewrite/production-saas`
2. Remove Prisma: `pnpm remove prisma @prisma/client @prisma/adapter-neon @prisma/engines`
3. Delete `prisma/` directory, `src/generated/` directory
4. Install Drizzle: `pnpm add drizzle-orm @neondatabase/serverless`
5. Install Drizzle Kit: `pnpm add -D drizzle-kit`
6. Install Better Auth: `pnpm add better-auth`
7. Update `package.json` scripts:
   - `"db:generate": "drizzle-kit generate"`
   - `"db:migrate": "drizzle-kit migrate"`
   - `"db:push": "drizzle-kit push"`
   - `"db:seed": "tsx --env-file=.env src/db/seed.ts"`
   - `"db:studio": "drizzle-kit studio"`
   - `"build": "next build"` (remove prisma generate)

### Step 2: Create `drizzle.config.ts`
```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

### Step 3: Create `src/db/schema/enums.ts`
Define all 4 pgEnums as shown above.

### Step 4: Create `src/db/schema/tenants.ts`
Define tenants table with all fields from old Settings + org fields (name, slug). Use `pgTable("tenants", { ... })`. Import enums. Use `cuid2` for id via `$defaultFn(() => createId())` or use `text("id").$defaultFn(...)`. Use `numeric("default_vat_percent", { precision: 5, scale: 2 })` for decimals.

### Step 5: Create `src/db/schema/auth.ts`
Follow Better Auth Drizzle adapter docs exactly. Define `user`, `session`, `account`, `verification` tables. Better Auth requires specific column names — use their schema generator or follow docs precisely.

### Step 6: Create `src/db/schema/tenant-members.ts`
Link users to tenants with role enum. Add unique index on (userId, tenantId).

### Step 7: Create remaining schema files
Create `categories.ts`, `units.ts`, `products.ts` (with pricing_tiers, volume_discounts), `customers.ts`, `quotes.ts` (with quote_items), `document-templates.ts`, `documents.ts`. Every business table has `tenantId: text("tenant_id").notNull().references(() => tenants.id)`.

### Step 8: Create `src/db/schema/index.ts`
Re-export everything: `export * from "./enums"; export * from "./tenants"; ...`

### Step 9: Create `src/db/index.ts`
```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
export type Database = typeof db;
```

### Step 10: Create `src/auth/index.ts`
```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
});
```

### Step 11: Create `src/auth/client.ts`
```ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL });
export const { signIn, signUp, signOut, useSession } = authClient;
```

### Step 12: Create `src/app/api/auth/[...all]/route.ts`
```ts
import { auth } from "@/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth);
```

### Step 13: Create `src/middleware.ts`
- Import `auth` from `@/auth`
- Use `auth.api.getSession()` or Better Auth's middleware helper
- Protect all `/(dashboard)/*` routes — redirect to `/login` if no session
- For authenticated requests, set `x-user-id` and determine active tenant (from cookie or default tenant_member)
- Set `x-tenant-id` header
- Allow `/api/auth/*`, `/(auth)/*`, `/share/*` without auth

### Step 14: Create `src/lib/tenant-context.ts`
```ts
import { headers } from "next/headers";
import { db } from "@/db";
import { tenantMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type TenantContext = { userId: string; tenantId: string; role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" };

export async function getTenantContext(): Promise<TenantContext> {
  const h = await headers();
  const userId = h.get("x-user-id");
  const tenantId = h.get("x-tenant-id");
  if (!userId || !tenantId) throw new Error("Unauthorized");
  // Verify membership
  const member = await db.select().from(tenantMembers)
    .where(and(eq(tenantMembers.userId, userId), eq(tenantMembers.tenantId, tenantId)))
    .limit(1);
  if (!member[0]) throw new Error("Not a member of this tenant");
  return { userId, tenantId, role: member[0].role };
}
```

### Step 15: Create `src/lib/result.ts`
```ts
export type Result<T> = { success: true; data: T } | { success: false; error: string };
export function ok<T>(data: T): Result<T> { return { success: true, data }; }
export function err<T>(error: string): Result<T> { return { success: false, error }; }
```

### Step 16: Create `src/lib/constants.ts`
Move default values from old Settings model: default greeting text, default terms, default VAT, default validity days, default quote prefix. These become fallback values when tenant has empty fields.

### Step 17: Create `src/lib/pdf/font-registration.ts`
Extract font registration from existing `generate-pdf-quote.tsx` and `pgh-delivery-order-layout.tsx`. Single source: export `registerFonts()` function and font family constants. Other PDF renderers import from here.

### Step 18: Create `src/lib/pdf/common-styles.ts`
Shared PDF style objects (colors, spacing, fonts) used by both quote PDF and other PDF layouts.

### Step 19: Copy business logic files
- Copy `pricing-engine.ts` as-is to `src/lib/pricing-engine.ts`
- Copy `format-number-to-words.ts` as-is
- Copy `format-currency.ts` as-is
- Rename `generate-quote-number.ts` -> `generate-doc-number.ts`, generalize function name to `generateDocNumber(prefix, nextNumber)` (same logic, broader name)

### Step 20: Create `src/lib/validations/common.ts`
Shared Zod helpers: `tenantIdSchema`, `paginationSchema`, `idSchema`.

### Step 21: Create auth pages (placeholders)
- `src/app/(auth)/layout.tsx` — centered layout
- `src/app/(auth)/login/page.tsx` — login form using `signIn` from auth client
- `src/app/(auth)/register/page.tsx` — register form using `signUp`, then create tenant + tenant_member

### Step 22: Update dashboard layout
- `src/app/(dashboard)/layout.tsx` — sidebar with English route links
- Navigation items: Dashboard (`/`), Quotes (`/quotes`), Products (`/products`), Customers (`/customers`), Templates (`/templates`), Documents (`/documents`), Settings (`/settings`)

### Step 23: Create seed script `src/db/seed.ts`
- Create demo tenant (name: "Demo Company", slug: "demo")
- Create demo user (email: demo@example.com, password: demo1234)
- Create tenant_member (OWNER)
- Create sample categories, units, products (with tiers/discounts), customers, quotes

### Step 24: Run initial migration
- `pnpm db:generate` -> generates SQL migration
- `pnpm db:push` -> push to Neon DB
- `pnpm db:seed` -> populate demo data
- Verify with `pnpm db:studio`

### Step 25: Verify auth flow
- Start dev server
- Register new account -> should auto-create tenant
- Login -> should redirect to dashboard
- Access dashboard -> middleware should inject tenant context
- Verify `getTenantContext()` works in a test server action

## TODO Checklist

- [ ] Create branch `rewrite/production-saas`
- [ ] Remove Prisma, install Drizzle + Better Auth
- [ ] Create `drizzle.config.ts`
- [ ] Define all enums in `src/db/schema/enums.ts`
- [ ] Define `tenants` table
- [ ] Define Better Auth tables (`user`, `session`, `account`, `verification`)
- [ ] Define `tenant_members` table
- [ ] Define `categories`, `units` tables
- [ ] Define `products`, `pricing_tiers`, `volume_discounts` tables
- [ ] Define `customers` table
- [ ] Define `quotes`, `quote_items` tables
- [ ] Define `document_templates`, `documents` tables
- [ ] Create schema index re-export
- [ ] Create Drizzle client (`src/db/index.ts`)
- [ ] Create Better Auth server (`src/auth/index.ts`)
- [ ] Create Better Auth client (`src/auth/client.ts`)
- [ ] Create auth API route (`src/app/api/auth/[...all]/route.ts`)
- [ ] Create middleware (`src/middleware.ts`)
- [ ] Create `getTenantContext()` helper
- [ ] Create `Result<T>` type
- [ ] Create constants file
- [ ] Create shared font registration
- [ ] Create shared PDF styles
- [ ] Copy business logic (pricing, currency, number-to-words)
- [ ] Create generalized `generateDocNumber()`
- [ ] Create shared Zod helpers
- [ ] Create auth layout + login/register pages
- [ ] Update dashboard layout (English routes, sidebar)
- [ ] Create seed script
- [ ] Run migration + seed
- [ ] Verify auth flow end-to-end

## Success Criteria

- `pnpm db:push` succeeds — all tables created
- `pnpm db:seed` succeeds — demo data populated
- Register -> Login -> Dashboard flow works
- `getTenantContext()` returns correct user/tenant in server actions
- All old business logic files preserved and importable
- No Prisma references remain in codebase

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Better Auth schema conflicts with custom tables | Follow their Drizzle adapter docs exactly, test early |
| Middleware perf (DB call per request for tenant) | Use session cookie cache (5 min), avoid DB lookup on every request |
| Decimal handling in Drizzle | Use `numeric` type, test with pricing engine early |

## Agent Instructions

**File ownership:** `src/db/*`, `src/auth/*`, `src/middleware.ts`, `src/lib/tenant-context.ts`, `src/lib/result.ts`, `src/lib/constants.ts`, `src/lib/pdf/*`, `src/lib/generate-doc-number.ts`, `src/lib/validations/common.ts`, `src/app/(auth)/*`, `src/app/api/auth/*`, `drizzle.config.ts`, `drizzle/*`

**DO NOT touch:** `src/app/(dashboard)/*/page.tsx` (except layout.tsx), `src/components/*` (except creating new shared ones)

**Copy but don't modify:** `src/lib/pricing-engine.ts`, `src/lib/format-number-to-words.ts`, `src/lib/format-currency.ts` — these are proven pure functions.

**Testing:** After completing, run `pnpm build` to verify no type errors. Run seed. Test auth flow manually.

**Critical:** The schema defined here is the contract ALL other phases depend on. Get the column names, types, and relations right. Other agents will import from `@/db/schema`.
