# Phase 2: Auth Middleware Refactor

## Priority: P1 | Status: completed | Effort: 1.5h

## Overview

Replace `requireCompanyId()` with `requireUserId()` across all actions and pages. Remove `CompanyProvider` context. Simplify app layout.

## Key Insights

- `requireCompanyId()` used in 14 files (all actions + pages)
- `requireUserId()` is just `requireSession()` then return `session.user.id` — simpler
- `CompanyProvider` context no longer needed (no single company to provide)
- App layout currently redirects to onboarding if no company — change: user can enter app without company, create companies later

## Related Code Files

**Delete:**
- `src/lib/auth/get-company-id.ts` — entire file
- `src/lib/auth/company-context.tsx` — entire file

**Create:**
- `src/lib/auth/get-user-id.ts` — `requireUserId()` helper

**Modify (actions — replace `requireCompanyId()` → `requireUserId()`):**
- `src/actions/customer.actions.ts`
- `src/actions/product.actions.ts`
- `src/actions/category.actions.ts`
- `src/actions/unit.actions.ts`
- `src/actions/document-type.actions.ts`
- `src/actions/document.actions.ts`
- `src/actions/company.actions.ts`

**Modify (pages — replace `requireCompanyId()` → `requireUserId()`):**
- `src/app/(app)/layout.tsx` — remove CompanyProvider, remove company redirect
- `src/app/(app)/page.tsx` — use userId
- `src/app/(app)/products/page.tsx`
- `src/app/(app)/customers/page.tsx`
- `src/app/(app)/documents/page.tsx`
- `src/app/(app)/documents/new/page.tsx`
- `src/app/(app)/documents/[id]/page.tsx`
- `src/app/(app)/documents/[id]/edit/page.tsx`
- `src/app/(app)/settings/page.tsx`
- `src/app/api/upload-logo/route.ts`

**Modify (services — change `companyId` param → `userId`):**
- `src/services/customer.service.ts` — all functions: companyId → userId
- `src/services/product.service.ts`
- `src/services/category.service.ts`
- `src/services/unit.service.ts`
- `src/services/document-type.service.ts`
- `src/services/document.service.ts` — special: keep companyId for create/filter, add userId
- `src/services/company.service.ts` — rewrite for CRUD (list, get, create, update, delete by userId)

## Implementation Steps

1. Create `src/lib/auth/get-user-id.ts`:
   ```ts
   export async function requireUserId(): Promise<string> {
     const session = await requireSession();
     return session.user.id;
   }
   ```

2. Update all services: rename `companyId` parameter to `userId`, update Drizzle queries to filter by `userId` column instead of `companyId`

3. Special handling for `document.service.ts`:
   - `listDocuments(userId)` — filter by `document.userId`
   - `createDocument(userId, { companyId, ... })` — companyId comes from form dropdown
   - `getDocumentById(documentId, userId)` — filter by userId
   - `generateDocumentNumber(companyId, shortLabel)` — keep companyId (numbers scoped per company)

4. Update all actions: replace `requireCompanyId()` → `requireUserId()`

5. Update all pages: replace `requireCompanyId()` → `requireUserId()`

6. Update app layout:
   - Remove `CompanyProvider` wrapper
   - Remove company check + onboarding redirect
   - Keep session check only

7. Delete `get-company-id.ts` and `company-context.tsx`

8. Update `company.service.ts` for multi-company CRUD:
   - `listCompanies(userId)` — list all companies for user
   - `getCompanyById(companyId, userId)` — get single company
   - `createCompany(userId, data)` — already exists, update field names
   - `updateCompany(companyId, userId, data)` — add userId check
   - `deleteCompany(companyId, userId)` — soft delete

## Todo

- [x] Create `get-user-id.ts`
- [x] Update all 7 services (companyId → userId in queries)
- [x] Update all 7 action files
- [x] Update all 9 page files
- [x] Update app layout (remove CompanyProvider)
- [x] Delete `get-company-id.ts`
- [x] Delete `company-context.tsx`
- [x] Compile check — `npx next build` or type check
- [x] Verify no remaining references to `requireCompanyId` or `useCompany`

## Success Criteria

- Zero references to `requireCompanyId`, `CompanyProvider`, `useCompany` in codebase
- All services filter by `userId` (except document.companyId for document-number generation)
- App loads without requiring a company
- Type-checks pass

## Risk

- Many files touched simultaneously — high chance of missed references
- `useCompany()` hook may be used in client components beyond what Grep found — search thoroughly
