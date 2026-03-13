# Final Security Audit Report

**Branch:** `rewrite/production-saas`
**Date:** 2026-03-13
**LOC audited:** ~16,369 across 80+ files

## Overall Assessment

Codebase is well-structured with consistent tenant isolation and RBAC patterns. Three issues found and two fixed directly.

---

## Critical Issues (FIXED)

### 1. Unauthenticated API routes - analyze endpoints
**Files:** `src/app/api/doc-template/analyze/route.ts`, `src/app/api/doc-template/analyze-pdf/route.ts`
**Risk:** Any unauthenticated user could POST base64 files to these endpoints, using server resources for parsing.
**Fix applied:** Added `await getTenantContext()` auth guard to both routes.

### 2. Share page leaks full tenant object to client
**File:** `src/app/share/[token]/page.tsx`, `src/components/share/share-quote-view.tsx`
**Risk:** Full `Tenant` record serialized as RSC prop to public page — exposes `taxCode`, `bankAccount`, `bankOwner`, `quotePrefix`, `quoteNextNumber`, internal config.
**Fix applied:** Query now selects only `companyName`, `name`, `logoUrl`, `primaryColor`, `phone`. Component type narrowed to `ShareTenant`.

---

## High Priority (Document Only)

### 3. Files exceeding 200 lines
| File | Lines |
|------|-------|
| `src/components/ui/sidebar.tsx` | 727 |
| `src/lib/pdf-layouts/pgh-delivery-order-layout.tsx` | 514 |
| `src/services/product-service.ts` | 398 |
| `src/services/quote-service.ts` | 332 |
| `src/components/doc-template/doc-template-configure-step.tsx` | 322 |
| `src/components/doc-template/doc-template-pdf-canvas-viewer.tsx` | 291 |
| `src/components/pgh/pgh-form-page.tsx` | 285 |
| `src/components/doc-template/doc-template-builder-page.tsx` | 265 |
| `src/components/quote/quote-data-table.tsx` | 245 |
| `src/components/product/product-data-table.tsx` | 233 |
| `src/lib/generate-pdf-quote.tsx` | 226 |
| `src/components/quote/quote-items-table.tsx` | 224 |
| `src/components/product/product-dialog.tsx` | 216 |
| `src/components/product/product-pricing-fields.tsx` | 211 |
| `src/lib/generate-excel-quote.ts` | 209 |
| `src/components/customer/customer-data-table.tsx` | 206 |

UI library files (`sidebar.tsx`, `dropdown-menu.tsx`, `field.tsx`, `calendar.tsx`) excluded — generated/vendored.

**Recommendation:** Prioritize splitting `pgh-delivery-order-layout.tsx` (514 lines) and `product-service.ts` (398 lines) in future sprints.

### 4. `as any` casts
- `src/components/doc-template/doc-template-builder-page.tsx:158,171` — `placeholders as any`
- Minor risk; placeholders type mismatch between form state and API payload. Should be typed properly when refactoring that component.

---

## Security Checklist

| Check | Status |
|-------|--------|
| SQL Injection (raw SQL) | PASS - All queries use Drizzle ORM parameterized |
| XSS (dangerouslySetInnerHTML) | PASS - None found |
| Broken Auth (middleware) | PASS - Cookie check on all dashboard routes |
| Tenant Isolation (services) | PASS - All 8 services filter by tenantId |
| RBAC on write actions | PASS - All mutations use requireRole() |
| Secrets in source | PASS - No API keys or credentials found |
| console.log in prod | PASS - Only in seed.ts (dev tool) |
| JSON.parse on user input | PASS - Only on localStorage (client-side, try-catch wrapped) |
| Unauthenticated API routes | FIXED - analyze endpoints now guarded |
| Share page data leakage | FIXED - narrowed to public-safe fields |

---

## Positive Observations

- Consistent `ok()/err()` Result pattern across all actions
- Every action validates with Zod before DB writes
- Server-side total recalculation in quote-service prevents price manipulation
- Clean separation: services (data), actions (auth+validation), components (UI)
- Middleware properly redirects with callbackUrl for post-login redirect

---

## Build Verification

Build passes after fixes. No TypeScript or lint errors.
