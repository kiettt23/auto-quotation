## Phase 4: Remove Quote-Specific Code

**Priority:** P1 | **Status:** pending | **Effort:** 3h

### Overview

Delete all quote-dedicated pages, components, services, API routes, schema, validations, and lib files. After Phase 3 migration, quotes live as documents — this code is dead weight.

### Requirements

- No broken imports after deletion
- No unused DB tables left
- Compile clean (`pnpm build` passes)

### Files to DELETE

**Pages:**
- `src/app/(dashboard)/quotes/` (entire directory: actions.ts, page.tsx, loading.tsx, new/page.tsx, [id]/page.tsx)

**API routes:**
- `src/app/api/export/excel/[quoteId]/route.ts`
- `src/app/api/export/pdf/[quoteId]/route.ts`

**Components:**
- `src/components/quote/` (entire directory: quote-builder-page.tsx, quote-customer-section.tsx, quote-data-table.tsx, quote-items-table.tsx, quote-list-page-client.tsx, quote-list-toolbar.tsx, quote-preview.tsx, quote-product-search.tsx, quote-public-actions.tsx, quote-status-badge.tsx, quote-summary-section.tsx)
- `src/components/dashboard/recent-quotes-section.tsx`

**Services:**
- `src/services/quote-service.ts`

**DB schema:**
- `src/db/schema/quotes.ts`

**Lib:**
- `src/lib/generate-pdf-quote.tsx` (replaced by preset renderer)
- `src/lib/generate-excel-quote.ts` (replaced by preset renderer)
- `src/lib/generate-quote-number.ts` (replaced by `generate-doc-number.ts`)
- `src/lib/validations/quote-schemas.ts`

**Settings components (quote-specific):**
- `src/components/settings/quote-template-form.tsx`

### Files to MODIFY

**Schema index:**
- `src/db/schema/index.ts` — remove `export * from "./quotes"`

**Enums:**
- `src/db/schema/enums.ts` — keep `quoteStatusEnum` for now (used in migrated fieldData status values; can drop in future cleanup)

**Tenants schema:**
- `src/db/schema/tenants.ts` — remove `quotes` import and relation; keep `quotePrefix`/`quoteNextNumber` columns temporarily (migration already copied them to doc_template)

**Tenants relations:**
- Remove `quotes: many(quotes)` from `tenantsRelations`

**Customers schema:**
- `src/db/schema/customers.ts` — check for quote relation references, remove if present

**Dashboard page:**
- `src/app/(dashboard)/dashboard/page.tsx` — remove recent-quotes-section import; replace with recent-documents section

**Dashboard service:**
- `src/services/dashboard-service.ts` — rewrite to query `doc_entries` instead of `quotes` table for stats

**Settings page:**
- `src/components/settings/settings-page-client.tsx` — remove quote-template-form tab/section
- `src/components/settings/defaults-form.tsx` — remove quote-specific default fields (VAT, validity, shipping) or repurpose for general doc defaults

**App header:**
- `src/components/layout/app-header.tsx` — remove any quote-specific quick actions

**Seed file:**
- `src/db/seed.ts` — remove quote seed data, add Bao Gia template seed instead

**Share page:**
- `src/app/share/[token]/page.tsx` — handled in Phase 6

**Share component:**
- `src/components/share/share-quote-view.tsx` — handled in Phase 6

**Keyboard shortcuts:**
- `src/lib/hooks/use-keyboard-shortcuts.ts` — remove `/quotes` navigation shortcut

**Template engine:**
- `src/lib/template-engine/render-quote-pdf.ts` — KEEP (now called by preset renderer)
- `src/lib/template-engine/render-quote-excel.ts` — KEEP (now called by preset renderer)

### Implementation Steps

1. Delete all files listed above in DELETE section
2. Update all files in MODIFY section to remove dead imports/references
3. Run `pnpm build` — fix any remaining broken imports
4. Run `pnpm lint` — fix any warnings
5. Verify app starts and /documents, /templates, /products, /customers pages work

### Todo List

- [ ] Delete quote pages directory
- [ ] Delete quote API routes
- [ ] Delete quote components directory
- [ ] Delete quote service
- [ ] Delete quote schema
- [ ] Delete quote lib files
- [ ] Delete quote validation schema
- [ ] Delete quote settings component
- [ ] Update schema index
- [ ] Update tenant relations
- [ ] Update dashboard to use documents
- [ ] Update settings page
- [ ] Update seed file
- [ ] Run build and fix breakage
- [ ] Manual smoke test all remaining pages

### Success Criteria

- `pnpm build` succeeds with zero errors
- No file in `src/` imports from deleted paths
- `/quotes` route returns 404
- `/documents` shows migrated quotes
- `/templates` shows Bao Gia preset alongside PGH/PXK
