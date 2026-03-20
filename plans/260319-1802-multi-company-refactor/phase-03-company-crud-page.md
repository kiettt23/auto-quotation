# Phase 3: Company CRUD Page

## Priority: P2 | Status: completed | Effort: 2h

## Overview

Create `/companies` page with list/create/edit/delete — same pattern as `/customers` and `/products`.

## Key Insights

- Follow exact same pattern as customers page (proven pattern in codebase)
- Company fields: name (required), address, phone, taxCode, email, bankName, bankAccount, logoUrl, headerLayout, driverName, vehicleId
- Logo upload already exists at `src/app/api/upload-logo/route.ts` — reuse
- Add "Công ty" to nav-items between "Khách hàng" and "Cài đặt"

## Related Code Files

**Create:**
- `src/app/(app)/companies/page.tsx` — server page, list companies
- `src/app/(app)/companies/company-list.tsx` — client component, table/cards
- `src/app/(app)/companies/company-form-dialog.tsx` — create/edit dialog
- `src/components/companies/company-form.tsx` — shared form fields

**Modify:**
- `src/components/layout/nav-items.ts` — add Companies nav item
- `src/services/company.service.ts` — add listCompanies, deleteCompany
- `src/actions/company.actions.ts` — rewrite: CRUD actions (create, update, delete, list)
- `src/lib/validations/company.schema.ts` — add driverName, vehicleId fields
- `src/app/onboarding/page.tsx` — adjust: onboarding creates first company, then redirect

## Implementation Steps

1. Update `company.schema.ts` — add `driverName`, `vehicleId` to both create and update schemas

2. Update `company.service.ts`:
   - `listCompanies(userId)` — list all by userId
   - `getCompanyById(companyId, userId)` — with userId ownership check
   - `createCompany(userId, data)` — include new fields
   - `updateCompany(companyId, userId, data)` — include new fields
   - `deleteCompany(companyId, userId)` — soft delete (add deletedAt to company table)

3. Rewrite `company.actions.ts`:
   - `createCompanyAction(formData)` — no longer prevents duplicates
   - `updateCompanyAction(companyId, formData)` — standard update
   - `deleteCompanyAction(companyId)` — soft delete

4. Create company page + components following customers pattern:
   - Server page fetches `listCompanies(userId)`
   - Client list component with search, cards/table
   - Dialog with form for create/edit
   - Logo upload integration (reuse existing upload-logo route)

5. Add nav item: `{ href: "/companies", label: "Công ty", icon: Building2 }`

6. Update onboarding: still creates first company, redirect to `/` after

## Todo

- [x] Update company validation schema
- [x] Update company service (full CRUD)
- [x] Rewrite company actions
- [x] Create companies page (server)
- [x] Create company list component (client)
- [x] Create company form dialog
- [x] Add nav item
- [x] Update onboarding flow
- [x] Add `deletedAt` to company schema if not present

## Success Criteria

- User can create multiple companies
- CRUD operations work (list, create, edit, delete)
- Logo upload works per company
- Nav shows "Công ty" link
- Onboarding still works for first-time users

## Risk

- Company `deletedAt` column doesn't exist yet — need to add in Phase 1 migration
- Logo upload route currently uses `requireCompanyId()` — must update in Phase 2 first
