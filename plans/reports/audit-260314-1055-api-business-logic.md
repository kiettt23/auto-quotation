# API & Business Logic Audit

**Date:** 2026-03-14
**Branch:** rewrite/production-saas
**Reviewer:** code-reviewer agent

---

## Feature Completeness Matrix

| Feature | Create | Read | Update | Delete | List | Notes |
|---------|--------|------|--------|--------|------|-------|
| Quotes | YES | YES | YES (via saveQuote) | YES | YES (paginated, search, sort, filter) | Also: clone, status update, share link, export PDF/Excel |
| Products | YES | YES | YES (via saveProduct) | YES (with usage guard) | YES (paginated, search, category filter) | Also: bulk import from Excel, search for combobox |
| Customers | YES | YES (getCustomerById in service, not exposed as action) | YES (via saveCustomer) | YES (with quote guard) | YES (paginated, search) | Also: search for combobox |
| Templates | YES | YES (service only, no action) | YES | YES | YES (service only, no action) | ADMIN-only. List/Read accessed via server components, not actions |
| Documents | YES | YES (service only) | YES | YES | YES (service only) | List/Read via server components |
| Settings | N/A | YES (via getTenantSettings service) | YES (company, banking, quote template, defaults, branding/logo) | N/A | N/A | ADMIN-only |
| Categories | YES | N/A | YES | YES | YES (service only) | ADMIN-only, managed under settings |
| Units | YES | N/A | YES | YES | YES (service only) | ADMIN-only, managed under settings |
| Invites | YES | N/A | N/A | YES (revoke) | YES (pending) | Invite accept flow exists |
| Dashboard | N/A | YES (stats + recent quotes) | N/A | N/A | N/A | Read-only aggregation |
| Onboarding | YES (company + first product) | N/A | N/A | N/A | N/A | completeOnboarding redirects |

---

## Critical Issues

### 1. **CRITICAL: SQL Injection via ILIKE search parameters**
- **Files:** `quote-service.ts:51-54`, `product-service.ts:54-58`, `customer-service.ts:34-39,97-99`
- **Issue:** Search params passed directly into `ilike()` with `%${params.search}%`. While Drizzle ORM parameterizes values, the `%` and `_` wildcard characters in ILIKE are NOT escaped. A user can craft search strings with `%` or `_` to manipulate pattern matching. This is a **low-severity injection** (no data breach) but can cause unexpected search results.
- **Fix:** Escape `%` and `_` in user input before interpolating into ILIKE pattern.

### 2. **CRITICAL: Document service fetches ALL documents then filters in JS**
- **File:** `document-service.ts:42-48`
- **Issue:** `getDocuments()` does `findMany()` with NO where clause, fetches ALL documents across ALL tenants, then filters by tenant in JavaScript. This is a **data leak risk** if the ORM returns data before filtering, and a **performance bomb** as documents grow.
- **Fix:** Add a proper WHERE clause joining through template.tenantId, or add tenantId directly to documents table.

### 3. **CRITICAL: Missing RBAC on document delete action**
- **File:** `documents/actions.ts:46`
- **Issue:** `deleteDocEntry` does NOT call `requireRole()`. Any authenticated user (including VIEWER) can delete documents.
- **Fix:** Add `requireRole(ctx.role, "MEMBER")` before delete.

### 4. **CRITICAL: Logo upload has no file validation**
- **File:** `settings/actions.ts:113-135`
- **Issue:** `uploadLogo` accepts any file type, any size. No MIME type validation, no file size limit. Attacker could upload malicious files (e.g., SVGs with XSS, enormous files for DoS). Writing to `public/uploads/` also means files are publicly accessible.
- **Fix:** Validate MIME type (image/png, image/jpeg only), enforce max size (e.g., 2MB), sanitize filename.

### 5. **CRITICAL: Race condition on quote/doc number generation**
- **Files:** `quote-service.ts:174-228`, `document-service.ts:89-94`
- **Issue:** Quote number generation reads `quoteNextNumber`, then increments in the same transaction. However, two concurrent requests could read the same number before either commits. The increment in `document-service.ts` is NOT even inside the same transaction as the insert.
- **Fix:** Use `SET quoteNextNumber = quoteNextNumber + 1 RETURNING` or a database sequence/advisory lock.

---

## Warnings (High Priority)

### 6. **Inconsistent error handling patterns across actions**
- Quotes, products, customers, settings actions use `ok()/err()` Result pattern
- Templates and documents actions use `throw new Error()` pattern
- This means template/document action errors will surface as unhandled exceptions on the client, not graceful error messages

### 7. **Customer action `saveCustomer` accepts typed data without Zod validation**
- **File:** `customers/actions.ts:33`
- **Issue:** Accepts `CustomerFormData` type directly. Unlike quotes and products which parse `unknown` through Zod, customer save trusts the client-provided type. Server actions receive `unknown` from the wire; TypeScript types provide zero runtime safety.
- **Fix:** Accept `unknown`, parse through `customerFormSchema.safeParse()`.

### 8. **Settings actions accept typed data without Zod runtime validation**
- **File:** `settings/actions.ts:17,29,41,53`
- **Issue:** All settings update actions accept pre-typed form data. Same problem as customers -- no runtime validation at the server action boundary.

### 9. **Onboarding `saveCompanyStep` does raw DB access, bypassing service layer**
- **File:** `onboarding/actions.ts:12-27,30-51`
- **Issue:** Directly imports `db` and table schemas instead of using a service. Inconsistent with the rest of the architecture. Also no Zod validation on inputs.

### 10. **`saveCategory`/`saveUnit` in settings-service don't check if update succeeded**
- **File:** `settings-service.ts:132-145,162-180`
- **Issue:** If `id` doesn't match any row, `updated` will be undefined. The function returns undefined without error, silently failing.

### 11. **Product create is not fully transactional**
- **File:** `product-service.ts:186-213`
- **Issue:** Product insert happens outside the transaction, then pricing tiers/volume discounts are inserted in a separate transaction. If the second transaction fails, you have an orphaned product with no tiers.

---

## Medium Priority

### 12. **Template actions use `unknown` for placeholders and tableRegion**
- **Files:** `templates/actions.ts:18-19`, `documents/actions.ts:14-15`
- **Issue:** `placeholders: unknown` and `tableRegion: unknown` pass through to DB without validation. Arbitrary JSON can be stored.

### 13. **`completeOnboarding` has no try/catch**
- **File:** `onboarding/actions.ts:54-60`
- **Issue:** If DB update fails, the error propagates as unhandled. Other actions wrap in try/catch.

### 14. **Tenant context always picks FIRST membership**
- **File:** `tenant-context.ts:30-31`
- **Issue:** Multi-tenant users always get their first tenant. No mechanism to switch tenants. This is by design for now but limits future multi-tenant support.

### 15. **`deleteCustomer` doesn't scope quote count check to tenant**
- **File:** `customer-service.ts:166-169`
- **Issue:** Counts ALL quotes referencing this customerId across all tenants. In practice likely fine since customerIds are unique, but it's inconsistent with the tenant-scoping pattern.

### 16. **Dashboard `getDashboardStats` fetches ALL quote rows for a tenant**
- **File:** `dashboard-service.ts:40-44`
- **Issue:** Selects status + total for every quote, then aggregates in JS. Should use SQL `GROUP BY` / `SUM` for efficiency at scale.

---

## Low Priority

### 17. **`isCustomItem` stored as string "true"/"false" not boolean**
- **File:** `quote-service.ts:124`
- **Issue:** `isCustomItem: item.isCustomItem ? "true" : "false"` -- presumably schema uses text, but boolean would be cleaner.

### 18. **Unused export: `sql` re-exported from quote-service**
- **File:** `quote-service.ts:332` -- `export { sql }` is a code smell.

### 19. **Content-Disposition filenames not sanitized**
- **Files:** All export route handlers
- **Issue:** Quote numbers used directly in filenames. If a quote number contains special chars, the header could be malformed.

---

## TODO/FIXME/HACK Found

**None.** No TODO, FIXME, or HACK comments found in any `src/**/*.ts` files.

---

## Files Reviewed

### Server Actions (7 files)
- `src/app/(dashboard)/quotes/actions.ts` (127 lines)
- `src/app/(dashboard)/products/actions.ts` (83 lines)
- `src/app/(dashboard)/customers/actions.ts` (55 lines)
- `src/app/(dashboard)/templates/actions.ts` (62 lines)
- `src/app/(dashboard)/documents/actions.ts` (50 lines)
- `src/app/(dashboard)/settings/actions.ts` (136 lines)
- `src/app/(dashboard)/onboarding/actions.ts` (60 lines)

### API Routes (7 files)
- `src/app/api/auth/[...all]/route.ts` (5 lines)
- `src/app/api/export/pdf/[quoteId]/route.ts` (81 lines)
- `src/app/api/export/excel/[quoteId]/route.ts` (83 lines)
- `src/app/api/doc-export/pdf/[documentId]/route.ts` (50 lines)
- `src/app/api/doc-export/excel/[documentId]/route.ts` (48 lines)
- `src/app/api/doc-template/analyze/route.ts` (63 lines)
- `src/app/api/doc-template/analyze-pdf/route.ts` (38 lines)

### Services (8 files)
- `src/services/quote-service.ts` (333 lines)
- `src/services/product-service.ts` (399 lines)
- `src/services/customer-service.ts` (179 lines)
- `src/services/template-service.ts` (127 lines)
- `src/services/document-service.ts` (150 lines)
- `src/services/settings-service.ts` (187 lines)
- `src/services/invite-service.ts` (97 lines)
- `src/services/dashboard-service.ts` (90 lines)

### Lib/Utility (4 files)
- `src/lib/result.ts` (24 lines)
- `src/lib/rbac.ts` (27 lines)
- `src/lib/tenant-context.ts` (45 lines)
- `src/lib/pricing-engine.ts` (114 lines)

**Total: 26 files, ~2,768 LOC reviewed**

---

## Positive Observations

1. **Consistent tenant scoping** -- nearly all queries include tenantId guard
2. **Server-side total recalculation** -- quote totals never trust client values
3. **Result type pattern** -- clean discriminated union for error handling (where used)
4. **Ownership verification** -- product update/delete checks tenant ownership before mutation
5. **Referential integrity guards** -- product delete checks quote usage, customer delete checks quotes
6. **All actions have "use server"** -- no missing directives
7. **Auth on all API routes** -- every route calls `getTenantContext()` for auth
8. **Transaction usage** -- quote save/clone properly use DB transactions
9. **Clean separation** -- services contain business logic, actions handle auth + validation + revalidation
10. **No TODO/FIXME/HACK debt** -- codebase is clean of deferred work

---

## Recommended Actions (Priority Order)

1. **Fix document service data leak** (#2) -- add WHERE clause, stop fetching all docs
2. **Add RBAC to document delete** (#3) -- one-line fix
3. **Validate logo uploads** (#4) -- MIME type + size check
4. **Fix race condition on number generation** (#5) -- use atomic increment
5. **Add Zod validation to customer & settings actions** (#7, #8) -- accept `unknown`, parse
6. **Unify error handling** (#6) -- templates/documents actions should use ok/err pattern
7. **Make product create fully transactional** (#11)
8. **Escape ILIKE wildcards** (#1)
9. **Use SQL aggregation for dashboard** (#16)
10. **Validate template placeholders/tableRegion** (#12)

---

## Unresolved Questions

1. Is there a shared public quote view route (for `shareToken`)? Not found in API routes -- may be a page component.
2. Is invite email sending implemented? `createInvite` returns the URL but no email dispatch found.
3. Are there rate limits on any API routes or server actions?
4. Is there CSRF protection beyond what Next.js server actions provide by default?
