# Code Review: Multi-Company Refactor

**Date:** 2026-03-19
**Branch:** staging vs main
**Scope:** ~378 files changed, 7398+/38191- (full rewrite from tenant-based to user-based multi-company model)

## Overall Assessment

**PASS with minor issues.** The refactor is clean and well-structured. Security model (userId ownership checks) is consistently applied across all services and actions. Migration is correct. No leftover tenant/CompanyProvider references found.

---

## Critical Issues

**None found.**

---

## High Priority

### 1. createDocument does NOT validate companyId ownership at service level
- **Location:** `src/services/document.service.ts:87-131`
- **Issue:** `createDocument` trusts the caller-supplied `companyId` without verifying the company belongs to `userId`. The action layer (`document.actions.ts:37-41`) does validate this, but the service itself is unguarded.
- **Risk:** If any future caller uses `createDocument` directly (API route, another service), it bypasses ownership check.
- **Fix:** Add ownership check in service, or document that validation is caller's responsibility. Current state is acceptable since all entry points go through actions.
- **Severity:** Medium-High (defense-in-depth gap)

### 2. Deleted company still usable in documents
- **Location:** `document.actions.ts:37-38` calls `listCompanies(userId)` which filters `isNull(company.deletedAt)`
- **Status:** Actually correct -- `listCompanies` excludes soft-deleted companies, so user cannot select a deleted company for new documents. Existing documents referencing deleted companies remain accessible (correct behavior -- historical records).
- **Verdict:** No issue.

### 3. Document number generation race condition
- **Location:** `src/services/document.service.ts:46-65`
- **Issue:** `generateDocumentNumber` uses `count(*)` then `+1` -- concurrent creates for same company+prefix can produce duplicates. The `uq_document_number` unique constraint on `(companyId, documentNumber)` will throw on collision.
- **Fix:** Use `FOR UPDATE` locking, or catch unique violation and retry, or use a sequence.
- **Severity:** Medium (low traffic app, but will error under concurrent use)

---

## Medium Priority

### 4. No redirect to onboarding when 0 companies
- **Location:** `src/app/(app)/layout.tsx` -- checks auth but does NOT check if user has companies
- **Issue:** User with 0 companies (all deleted, or new user who navigated directly to `/`) sees empty data with no guidance. Onboarding page at `/onboarding` exists but only redirects away if companies exist -- no reverse redirect from app layout.
- **Fix:** In `(app)/layout.tsx`, add: `const companies = await listCompanies(userId); if (!companies.length) redirect("/onboarding");`

### 5. `deleteDocumentType` uses hard delete, not soft delete
- **Location:** `src/services/document-type.service.ts:65-71`
- **Issue:** `deleteDocumentType` uses `db.delete()` (hard delete). Documents referencing this type via `typeId` FK will have dangling references (no FK constraint in migration on `type_id`).
- **Risk:** Low since `typeId` has no FK `ON DELETE` behavior defined in migration, but `getDocumentTypeById` calls for those documents will return null.

### 6. `upload-logo` imports `requireUserId` but doesn't use it
- **Location:** `src/app/api/upload-logo/route.ts:3`
- **Issue:** Unused import of `requireUserId`. Uses `requireSession` directly instead.
- **Fix:** Remove unused import.

---

## Low Priority

### 7. Inconsistent parameter order in services
- `getCompanyById(companyId, userId)` vs `getCustomerById(userId, customerId)` vs `getDocumentById(documentId, userId)`
- Not a bug, but increases chance of argument swap errors. Consider standardizing to `(userId, entityId)` everywhere.

### 8. `seedDefaultDocumentTypes` called on company creation, not user creation
- **Location:** `company.actions.ts:44`
- **Issue:** Every `setupCompanyAction` call seeds document types, but `createCompanyAction` does not. If user deletes all companies and creates a new one via settings, they won't get default document types re-seeded.
- **Risk:** Low, document types are per-user not per-company, so they persist.

---

## Security Checklist

| Check | Status |
|-------|--------|
| All services filter by `userId` | PASS |
| All actions call `requireUserId()` or `requireSession()` | PASS |
| No tenant/companyId leaks across users | PASS |
| Company ownership validated on document creation | PASS (action layer) |
| Company ownership validated on update/delete | PASS (service layer) |
| No remaining `requireCompanyId`/`useCompany`/`CompanyProvider` refs | PASS |
| Upload-logo validates company ownership | PASS (via `updateCompany` ownership check) |
| Input validation (zod schemas) on all actions | PASS |

---

## Positive Observations

- Clean separation: actions handle auth + validation, services handle DB queries
- Consistent soft-delete pattern across entities
- Ownership check in every update/delete query (WHERE userId = ...)
- Migration handles data migration correctly (populates userId from company.userId)
- Document retains `companyId` FK correctly for business context while auth uses `userId`

---

## Recommended Actions

1. **Add company ownership check to onboarding redirect** in `(app)/layout.tsx` (Medium)
2. **Consider retry logic** for document number generation race condition (Medium)
3. **Remove unused import** in upload-logo route (Low)
4. **Standardize parameter order** in service functions (Low, future cleanup)

---

## Unresolved Questions

1. Is the migration `0001_multi_company_refactor.sql` already applied to staging DB? If not, need to run it before testing.
2. Should `deleteDocumentType` be soft-delete to preserve document references?
3. Is there a plan for the `type` (enum) to `typeId` (FK) migration on existing documents?
