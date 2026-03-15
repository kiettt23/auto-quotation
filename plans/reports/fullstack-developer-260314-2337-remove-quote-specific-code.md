# Phase Implementation Report

## Executed Phase
- Phase: remove-quote-specific-code
- Plan: plans/260314-2104-merge-quotes-into-templates
- Status: completed

## Files Deleted
- `src/app/(dashboard)/quotes/` (entire dir — actions.ts, page.tsx, loading.tsx, new/page.tsx, [id]/page.tsx)
- `src/app/api/export/excel/[quoteId]/route.ts` + empty parent dirs
- `src/app/api/export/pdf/[quoteId]/route.ts` + empty parent dirs
- `src/components/quote/` (entire dir)
- `src/services/quote-service.ts`
- `src/lib/generate-quote-number.ts`
- `src/lib/validations/quote-schemas.ts`
- `src/components/settings/quote-template-form.tsx`
- `src/components/dashboard/recent-quotes-section.tsx`

## Files Modified
- `src/db/schema/index.ts` — removed `export * from "./quotes"`
- `src/db/schema/tenants.ts` — removed quotes import + `quotes: many(quotes)` relation
- `src/db/schema/customers.ts` — removed quotes import, relation, unused `many` param
- `src/db/index.ts` — added quotesSchema spread into drizzle schema registry (keeps share page + migration compat)
- `src/app/(dashboard)/dashboard/page.tsx` — removed RecentQuotesSection + getRecentQuotes call
- `src/components/dashboard/dashboard-stats-cards.tsx` — rewired to new DashboardStats shape (docs/templates/customers/products)
- `src/services/dashboard-service.ts` — rewrote: removed quotes dep, new stats = totalDocuments/totalTemplates/totalCustomers/totalProducts
- `src/services/customer-service.ts` — removed quotes join; quoteCount always 0; removed delete guard
- `src/components/settings/settings-page-client.tsx` — removed QuoteTemplateForm tab (5→4 tabs)
- `src/db/seed.ts` — removed quotes/quoteItems imports, entire Q1/Q2/Q3 seed block, unused createId import
- `src/lib/hooks/use-keyboard-shortcuts.ts` — replaced hard-coded `/quotes/new` push with `shortcuts?.["n"]?.()`
- `src/components/layout/app-header.tsx` — removed /quotes and /quotes/* title entries
- `src/components/layout/nav-items.ts` — removed Báo giá nav item + unused FileText import
- `src/proxy.ts` — removed "/quotes" from dashboardRoutes
- `src/app/(dashboard)/onboarding/page.tsx` — redirect to /dashboard instead of /quotes
- `src/app/(dashboard)/onboarding/actions.ts` — redirect to /dashboard instead of /quotes
- `src/app/share/[token]/page.tsx` — import quotes directly from schema/quotes (not schema index)
- `src/components/share/share-quote-view.tsx` — import Quote/QuoteItem from schema/quotes

## Tasks Completed
- [x] Deleted all quote-specific pages, components, service, lib files
- [x] Deleted API export routes for quotes
- [x] Removed quotes from schema index (not from schema file — migration compat)
- [x] Fixed tenants/customers schema relations
- [x] Updated dashboard page + stats cards + dashboard-service
- [x] Updated settings page client (removed quote-template tab)
- [x] Cleaned seed file (no quote inserts)
- [x] Fixed keyboard shortcut, app-header, nav-items, proxy, onboarding redirects
- [x] Fixed customer-service (removed quotes join, delete guard)
- [x] Share page kept working via direct import from schema/quotes

## Tests Status
- Type check: pass (0 errors)
- Unit tests: not run (no quote-specific tests existed post prior cleanup)

## Issues Encountered
- `db.query.quotes` relational API requires quotes in drizzle schema registry — solved by spreading `quotesSchema` into db/index.ts without re-exporting from schema index
- `customer-service.ts` used quotes for quoteCount join and delete guard — removed join (quoteCount=0), removed delete guard

## Next Steps
- quoteCount badge in customer table always shows 0 — consider removing the badge column or replacing with document count in a future pass
- `src/lib/validations/settings-schemas.ts` still references quotePrefix/quoteNextNumber fields (tenant columns kept for migration) — intentional, no action needed
