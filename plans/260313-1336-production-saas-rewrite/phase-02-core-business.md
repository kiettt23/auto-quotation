---
title: "Phase 2: Core Business"
status: pending
priority: P1
effort: 3w
---

# Phase 2: Core Business

## Context Links

- [plan.md](./plan.md) | [Phase 1](./phase-01-foundation.md) | [Phase 3](./phase-03-template-engine.md)
- [Current quote actions](../../src/app/(dashboard)/bao-gia/actions.ts) — reference for business logic
- [Current settings actions](../../src/app/(dashboard)/cai-dat/actions.ts) — reference

## Overview

Rewrite all CRUD modules (Quotes, Products, Customers, Dashboard, Settings) using Drizzle + tenant-scoped queries. English routes, Vietnamese UI. Modern SaaS design (Linear/Notion style).

**Depends on:** Phase 1 complete (schema, auth, middleware, tenant context)

## Key Insights

- All queries MUST use `eq(table.tenantId, ctx.tenantId)` — never query without tenant filter
- No `JSON.parse(JSON.stringify(...))` — Drizzle returns proper types
- Split large action files into focused service modules (1 file per domain, max 200 lines)
- Server actions use `Result<T>` pattern from Phase 1
- Revalidation paths change from Vietnamese to English (`/bao-gia` -> `/quotes`)
- Quote number generation now reads from `tenants` table (not singleton settings)
- Share token flow stays same but route changes to `/share/:token`

## Requirements

### Functional
- **Products:** CRUD, search, filter by category, import from Excel, pricing tiers + volume discounts
- **Customers:** CRUD, search, quick-create from quote form
- **Quotes:** CRUD, line items with product search, auto-calc totals, clone, share link, status management, PDF export, Excel export
- **Dashboard:** Stats cards (total quotes, revenue, by status), recent quotes list
- **Settings:** Company info, branding (logo upload), quote template config, defaults (VAT, terms, prefix), category/unit management

### Non-Functional
- Page load < 1s for list pages (paginated, 20 items default)
- Server-side recalculation of all totals (never trust client math)
- Optimistic UI for status changes

## Architecture

### Service Layer Pattern
Each domain gets a service file with tenant-scoped query functions:
```
src/services/quote-service.ts    -> getQuotes(), getQuote(), saveQuote(), deleteQuote(), ...
src/services/product-service.ts  -> getProducts(), getProduct(), saveProduct(), ...
src/services/customer-service.ts -> getCustomers(), saveCustomer(), ...
src/services/settings-service.ts -> getTenantSettings(), updateTenantSettings(), ...
```

Server actions in `actions.ts` files call these services (thin wrappers that call `getTenantContext()` + service).

### Route Structure
```
/(dashboard)/
  page.tsx                         # Dashboard
  quotes/
    page.tsx                       # Quote list
    new/page.tsx                   # Create quote
    [id]/page.tsx                  # Edit quote
    actions.ts                     # Quote server actions
  products/
    page.tsx                       # Product list
    actions.ts                     # Product server actions
  customers/
    page.tsx                       # Customer list
    actions.ts                     # Customer server actions
  settings/
    page.tsx                       # Settings page
    actions.ts                     # Settings server actions
/share/[token]/
  page.tsx                         # Public quote view
```

## New Directory/File Structure

```
src/
  services/
    quote-service.ts               # Quote CRUD (tenant-scoped Drizzle queries)
    product-service.ts             # Product CRUD + pricing tiers + volume discounts
    customer-service.ts            # Customer CRUD
    settings-service.ts            # Tenant settings read/update
    dashboard-service.ts           # Dashboard stats aggregation
  app/
    (dashboard)/
      page.tsx                     # Dashboard (stats + recent quotes)
      layout.tsx                   # Updated in Phase 1, may need nav item adjustments
      loading.tsx                  # Skeleton
      error.tsx                    # Error boundary
      quotes/
        page.tsx                   # Quote list
        loading.tsx
        new/page.tsx               # Create/edit quote (builder)
        [id]/page.tsx              # Edit existing quote
        actions.ts                 # Server actions (thin: getTenantContext + service call)
      products/
        page.tsx                   # Product list
        loading.tsx
        actions.ts
      customers/
        page.tsx                   # Customer list
        loading.tsx
        actions.ts
      settings/
        page.tsx                   # Settings (tabs: company, branding, quote template, defaults, categories/units)
        loading.tsx
        actions.ts
    share/
      [token]/page.tsx             # Public quote view (no auth needed)
  components/
    quote/
      quote-list-page-client.tsx   # Rewrite: client-side list with filters
      quote-data-table.tsx         # Table component
      quote-list-toolbar.tsx       # Search + filters
      quote-builder-page.tsx       # Rewrite: form with product search, items table
      quote-items-table.tsx        # Drag-sortable items
      quote-customer-section.tsx   # Customer picker/input
      quote-summary-section.tsx    # Totals display
      quote-preview.tsx            # Preview card
      quote-status-badge.tsx       # Status badge
      quote-product-search.tsx     # Combobox product search
      quote-public-actions.tsx     # Public share page actions (download PDF)
    product/
      product-page-client.tsx      # Rewrite
      product-data-table.tsx
      product-toolbar.tsx
      product-dialog.tsx           # Create/edit dialog
      product-pricing-fields.tsx   # Tiered pricing + volume discount editors
      product-import-wizard.tsx    # Excel import (3-step)
      import-file-upload-step.tsx
      import-column-mapping-step.tsx
      import-preview-step.tsx
    customer/
      customer-page-client.tsx     # Rewrite
      customer-data-table.tsx
      customer-toolbar.tsx
      customer-dialog.tsx
    settings/
      settings-page-client.tsx     # Rewrite with tabs
      company-info-form.tsx
      quote-template-form.tsx
      defaults-form.tsx
      categories-units-manager.tsx
    dashboard/
      dashboard-stats-cards.tsx
      recent-quotes-section.tsx
      stat-card.tsx
  lib/
    validations/
      quote-schemas.ts             # Rewrite for Drizzle types (no Decimal hacks)
      product-schemas.ts           # Rewrite
      customer-schemas.ts          # Rewrite
      settings-schemas.ts          # Rewrite (now updates tenants table)
    generate-pdf-quote.tsx         # Rewrite: uses shared font registration, tenant branding
    generate-excel-quote.ts        # Rewrite: uses tenant branding
    import-excel-parser.ts         # Rewrite: tenant-aware
  app/
    api/
      export/
        pdf/[quoteId]/route.ts     # Rewrite: tenant-scoped
        excel/[quoteId]/route.ts   # Rewrite: tenant-scoped
      import/
        parse/route.ts             # Rewrite: tenant-scoped
        execute/route.ts           # Rewrite: tenant-scoped
```

## Implementation Steps

### Step 1: Create service layer files

**`src/services/quote-service.ts`** (~180 lines)
- `getQuotes(tenantId, params)` — paginated list with filters (status, search, customerId, date range, sort). Uses Drizzle `select().from(quotes).where(and(eq(quotes.tenantId, tenantId), ...filters))`. Return `{ quotes, total, page, totalPages }`.
- `getQuoteById(tenantId, id)` — single quote with items. Use Drizzle relations or join.
- `getQuoteByShareToken(token)` — for public share page (no tenantId filter, token is globally unique).
- `saveQuote(tenantId, data, quoteId?)` — create or update. Recalculate totals server-side using `calculateQuoteTotals` from pricing-engine. For new quotes: read `tenants.quoteNextNumber`, generate number via `generateDocNumber()`, increment counter. Use transaction.
- `cloneQuote(tenantId, quoteId)` — duplicate quote with new number.
- `deleteQuote(tenantId, quoteId)` — delete items + quote in transaction.
- `updateQuoteStatus(tenantId, quoteId, status)` — status update.
- `generateShareLink(tenantId, quoteId)` — create share token.

**`src/services/product-service.ts`** (~150 lines)
- `getProducts(tenantId, params)` — paginated with search, category filter. Include category + unit names.
- `getProductById(tenantId, id)` — with pricing tiers + volume discounts.
- `searchProducts(tenantId, query)` — for quote builder combobox. Return top 20 with category, unit, tiers, discounts.
- `saveProduct(tenantId, data, productId?)` — create/update product + upsert tiers + discounts in transaction.
- `deleteProduct(tenantId, productId)` — check if used in quote items first.
- `importProducts(tenantId, products[])` — bulk create from Excel import.

**`src/services/customer-service.ts`** (~80 lines)
- `getCustomers(tenantId, params)` — paginated with search.
- `searchCustomers(tenantId, query)` — for quote builder, top 10.
- `saveCustomer(tenantId, data, customerId?)` — create/update.
- `deleteCustomer(tenantId, customerId)` — check if used in quotes first.

**`src/services/settings-service.ts`** (~60 lines)
- `getTenantSettings(tenantId)` — read tenant record.
- `updateCompanyInfo(tenantId, data)` — update company fields on tenant.
- `updateBranding(tenantId, data)` — update logo_url, primary_color.
- `updateQuoteTemplate(tenantId, data)` — update greeting_text, default_terms, display options.
- `updateDefaults(tenantId, data)` — update VAT, validity, shipping, prefix.
- `uploadLogo(tenantId, formData)` — upload to Vercel Blob, update tenant.logo_url.

**`src/services/dashboard-service.ts`** (~60 lines)
- `getDashboardStats(tenantId)` — count quotes by status, sum totals, count customers, count products.
- `getRecentQuotes(tenantId, limit)` — latest 5 quotes with status.

### Step 2: Create server action files

Each `actions.ts` is a thin wrapper:
```ts
"use server";
import { getTenantContext } from "@/lib/tenant-context";
import { ok, err, Result } from "@/lib/result";
import * as quoteService from "@/services/quote-service";

export async function getQuotes(params: GetQuotesParams): Promise<Result<QuoteListResult>> {
  try {
    const ctx = await getTenantContext();
    const data = await quoteService.getQuotes(ctx.tenantId, params);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Loi khong xac dinh");
  }
}
```

Create `actions.ts` in: `quotes/`, `products/`, `customers/`, `settings/`.

### Step 3: Rewrite validation schemas

**`src/lib/validations/quote-schemas.ts`**
- Same shape as current but remove Prisma Decimal workarounds
- All numbers are plain `z.number()` (Drizzle numeric columns map to string, convert in service layer)
- Add `tenantId` to form schema? No — tenantId comes from context, not form.

**`src/lib/validations/product-schemas.ts`**
- Product form: code, name, description, notes, categoryId, unitId, basePrice, pricingType, pricingTiers[], volumeDiscounts[]

**`src/lib/validations/customer-schemas.ts`**
- Customer form: name, company, phone, email, address, notes

**`src/lib/validations/settings-schemas.ts`**
- Split into: companyInfoSchema, brandingSchema, quoteTemplateSchema, defaultsSchema, categorySchema, unitSchema

### Step 4: Rewrite PDF/Excel export

**`src/lib/generate-pdf-quote.tsx`**
- Import fonts from `@/lib/pdf/font-registration` (Phase 1)
- Import styles from `@/lib/pdf/common-styles` (Phase 1)
- Accept `tenant` object (logo, company info, branding) instead of reading Settings
- Accept `quote` with items
- Generate PDF using `@react-pdf/renderer`
- Use `formatCurrency`, `numberToVietnameseWords` from shared libs

**`src/lib/generate-excel-quote.ts`**
- Same pattern: accept tenant + quote data
- Use ExcelJS to generate workbook
- Apply tenant branding (logo, company name)

### Step 5: Rewrite export API routes

**`src/app/api/export/pdf/[quoteId]/route.ts`**
- `getTenantContext()` -> fetch quote (tenant-scoped) -> fetch tenant settings -> generate PDF -> return response

**`src/app/api/export/excel/[quoteId]/route.ts`**
- Same pattern for Excel

### Step 6: Rewrite import API routes

**`src/app/api/import/parse/route.ts`** and **`execute/route.ts`**
- Add tenant context
- Import products are scoped to tenant

### Step 7: Create page components

**Dashboard `src/app/(dashboard)/page.tsx`**
- Server component. Call `getDashboardStats()` and `getRecentQuotes()` via actions.
- Render `DashboardStatsCards` + `RecentQuotesSection`.

**Quotes list `src/app/(dashboard)/quotes/page.tsx`**
- Server component with search params for pagination/filters.
- Call `getQuotes()` action with params.
- Render `QuoteListPageClient` with data.

**Quote builder `src/app/(dashboard)/quotes/new/page.tsx`** and **`[id]/page.tsx`**
- `new/page.tsx`: empty builder form.
- `[id]/page.tsx`: load quote data, pass to builder.
- Client component `QuoteBuilderPage` handles: customer section, product search + item add, items table (drag sort), summary section, save/export actions.

**Products list `src/app/(dashboard)/products/page.tsx`**
- Server component. Fetch products + categories + units.
- Render `ProductPageClient`.

**Customers list `src/app/(dashboard)/customers/page.tsx`**
- Server component. Fetch customers.
- Render `CustomerPageClient`.

**Settings `src/app/(dashboard)/settings/page.tsx`**
- Server component. Fetch tenant settings + categories + units.
- Render `SettingsPageClient` (tabs component).

**Public share `src/app/share/[token]/page.tsx`**
- No auth required. Fetch quote by share token.
- Display quote read-only with tenant branding.
- Download PDF/Excel buttons.

### Step 8: Rewrite UI components

Rewrite all components under `src/components/quote/`, `product/`, `customer/`, `settings/`, `dashboard/`. Key changes:
- Remove all Prisma type imports -> use Drizzle inferred types or plain interfaces
- Remove `JSON.parse(JSON.stringify(...))` patterns
- Update import paths (English routes for navigation/links)
- Use tenant branding where applicable (logo, primary color)
- Modern SaaS styling: clean cards, subtle shadows, proper spacing

### Step 9: Delete old Vietnamese route pages
Remove: `src/app/(dashboard)/bao-gia/`, `san-pham/`, `khach-hang/`, `cai-dat/`, `mau-chung-tu/`, `chung-tu/`, `pgh/`
Remove: `src/app/chia-se/`
Remove: old `src/lib/db.ts` (Prisma client)

## TODO Checklist

- [ ] Create `src/services/quote-service.ts`
- [ ] Create `src/services/product-service.ts`
- [ ] Create `src/services/customer-service.ts`
- [ ] Create `src/services/settings-service.ts`
- [ ] Create `src/services/dashboard-service.ts`
- [ ] Create `src/app/(dashboard)/quotes/actions.ts`
- [ ] Create `src/app/(dashboard)/products/actions.ts`
- [ ] Create `src/app/(dashboard)/customers/actions.ts`
- [ ] Create `src/app/(dashboard)/settings/actions.ts`
- [ ] Rewrite validation schemas (quote, product, customer, settings)
- [ ] Rewrite `generate-pdf-quote.tsx` (tenant-aware, shared fonts)
- [ ] Rewrite `generate-excel-quote.ts` (tenant-aware)
- [ ] Rewrite export API routes (PDF + Excel)
- [ ] Rewrite import API routes (parse + execute)
- [ ] Create dashboard page + components
- [ ] Create quotes list page + components
- [ ] Create quote builder page + components
- [ ] Create products page + components
- [ ] Create customers page + components
- [ ] Create settings page + components
- [ ] Create public share page
- [ ] Delete old Vietnamese route dirs
- [ ] Delete old `src/lib/db.ts`
- [ ] Verify all pages load with demo data
- [ ] Verify quote CRUD flow end-to-end
- [ ] Verify PDF/Excel export with tenant branding

## Success Criteria

- All CRUD operations work with tenant isolation
- Quote create -> edit -> export PDF/Excel -> share link flow complete
- Product import from Excel works
- Dashboard shows correct stats
- Settings update reflects in quote exports (logo, terms, VAT)
- No cross-tenant data leaks (test with 2 demo tenants)
- No `JSON.parse(JSON.stringify)` anywhere
- All old Vietnamese routes removed

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Drizzle query syntax learning curve | Reference Drizzle docs, test queries in seed script first |
| Component rewrite scope is large | Parallel agents: Quote Agent, Product Agent, Customer Agent can work simultaneously with strict file ownership |
| PDF export regression | Compare output visually with old PDF before marking done |

## Agent Instructions

**File ownership split for parallel agents:**
- **Quote Agent:** `src/services/quote-service.ts`, `src/app/(dashboard)/quotes/*`, `src/components/quote/*`, `src/lib/validations/quote-schemas.ts`, `src/lib/generate-pdf-quote.tsx`, `src/lib/generate-excel-quote.ts`, `src/app/api/export/*`, `src/app/share/*`
- **Product Agent:** `src/services/product-service.ts`, `src/app/(dashboard)/products/*`, `src/components/product/*`, `src/lib/validations/product-schemas.ts`, `src/lib/import-excel-parser.ts`, `src/app/api/import/*`
- **Customer Agent:** `src/services/customer-service.ts`, `src/app/(dashboard)/customers/*`, `src/components/customer/*`, `src/lib/validations/customer-schemas.ts`
- **Settings/Dashboard Agent:** `src/services/settings-service.ts`, `src/services/dashboard-service.ts`, `src/app/(dashboard)/settings/*`, `src/app/(dashboard)/page.tsx`, `src/components/settings/*`, `src/components/dashboard/*`, `src/lib/validations/settings-schemas.ts`

**Assumes from Phase 1:** `db` client, all schema tables, `getTenantContext()`, `Result<T>`, `generateDocNumber()`, shared font registration, pricing engine, format utils.

**Import convention:** `import { db } from "@/db"`, `import { quotes, quoteItems } from "@/db/schema"`, `import { getTenantContext } from "@/lib/tenant-context"`, `import { ok, err } from "@/lib/result"`.

**DO NOT modify:** Anything in `src/db/schema/*`, `src/auth/*`, `src/middleware.ts`. If schema needs changes, flag it for consolidation.
