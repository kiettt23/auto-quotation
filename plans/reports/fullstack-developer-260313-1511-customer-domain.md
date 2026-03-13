# Phase Implementation Report

## Executed Phase
- Phase: phase-02-customer-domain
- Plan: none (inline spec)
- Status: completed

## Files Modified / Created
| File | Action | ~Lines |
|------|--------|--------|
| `src/lib/validations/customer-schemas.ts` | rewrite | 14 |
| `src/services/customer-service.ts` | create | 120 |
| `src/app/(dashboard)/customers/actions.ts` | create | 52 |
| `src/app/(dashboard)/customers/page.tsx` | create | 34 |
| `src/app/(dashboard)/customers/loading.tsx` | create | 16 |
| `src/components/customer/customer-page-client.tsx` | rewrite | 46 |
| `src/components/customer/customer-toolbar.tsx` | rewrite | 59 |
| `src/components/customer/customer-data-table.tsx` | rewrite | 163 |
| `src/components/customer/customer-dialog.tsx` | rewrite | 110 |

## Tasks Completed
- [x] `customerFormSchema` with zod/v4, backward-compat `customerSchema` alias
- [x] `customer-service.ts`: getCustomers (paginated + search), searchCustomers (top-10), getCustomerById, saveCustomer (create/update), deleteCustomer (guards quotes)
- [x] `customers/actions.ts`: server actions wrapping service with Result type + revalidatePath
- [x] `customers/page.tsx`: server component, searchParams, graceful error fallback
- [x] `customers/loading.tsx`: table skeleton
- [x] All four components rewritten — imports updated from `/khach-hang/actions` to `/customers/actions`, `_count.quotes` replaced with `quoteCount` from new service type

## Key Design Decisions
- `CustomerWithQuoteCount` exported from service — single source of truth for components
- `deleteCustomer` throws on quote presence (business rule), action converts to Result err
- `customerSchema` alias kept for backward compat with `khach-hang` route still using old actions
- Routes in data-table updated to `/customers` and `/quotes` (English slugs consistent with new structure)

## Tests Status
- Type check: not run (no Bash access) — imports verified manually, no stale Prisma/lib/db references
- Unit tests: n/a (no test files in scope)

## Issues Encountered
- None. Existing `/khach-hang` route left untouched as required.

## Next Steps
- Run `pnpm build` to confirm no type errors
- Other phases (quotes, products) may need `searchCustomers` action from `/customers/actions` for quote-builder combobox
