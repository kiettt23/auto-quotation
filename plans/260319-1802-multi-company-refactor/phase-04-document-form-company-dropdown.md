# Phase 4: Document Form Company Dropdown

## Priority: P2 | Status: completed | Effort: 1.5h

## Overview

Add company selector as first field on document form. Selecting a company auto-fills PDF header info (name, address, taxCode, logo, driverName, vehicleId).

## Key Insights

- Document still has `companyId` FK — required for PDF header + document number generation
- Company dropdown should be a searchable select (same pattern as customer dropdown)
- When company selected: store `companyId` on document, use company data for PDF rendering
- Document `data` JSONB may store snapshot of company info at creation time (for historical accuracy)
- `driverName` and `vehicleId` from selected company auto-fill into form fields

## Related Code Files

**Modify:**
- `src/components/documents/document-form.tsx` — add company dropdown as first field
- `src/app/(app)/documents/new/page.tsx` — pass companies list to form
- `src/app/(app)/documents/[id]/edit/page.tsx` — pass companies list to form
- `src/actions/document.actions.ts` — accept companyId from form (not from middleware)
- `src/services/document.service.ts` — createDocument now receives companyId from caller
- `src/lib/validations/document.schema.ts` — add companyId required field

## Implementation Steps

1. Update document pages to fetch and pass companies:
   ```ts
   const companies = await listCompanies(userId);
   // pass to <DocumentForm companies={companies} ... />
   ```

2. Update `document-form.tsx`:
   - Add company select dropdown as first field (before document type)
   - On company change: auto-fill `driverName`, `vehicleId` fields in form
   - Company info (name, address, etc.) stored in document `data` JSONB for PDF snapshot

3. Update `document.schema.ts`: add `companyId` as required string field

4. Update `document.actions.ts`:
   - `createDocumentAction`: read `companyId` from form data (not from middleware)
   - Pass `companyId` to `createDocument` service
   - Validate that selected companyId belongs to current user

5. Update document service:
   - `createDocument(userId, { companyId, ... })` — userId for ownership, companyId for company FK
   - `generateDocumentNumber(companyId, shortLabel)` — keep scoped per company

6. For PDF rendering: company data already in document `data` JSONB — no extra query needed

## Todo

- [x] Pass companies to document form pages (new + edit)
- [x] Add company dropdown to document-form.tsx
- [x] Auto-fill driverName/vehicleId on company select
- [x] Store company snapshot in document data JSONB
- [x] Update document validation schema
- [x] Update document actions (companyId from form)
- [x] Verify PDF rendering uses company data from document
- [x] Handle case: user has 0 companies → show "create company first" message

## Success Criteria

- Company dropdown appears as first field on document form
- Selecting company auto-fills driver/vehicle fields
- Document saved with correct companyId
- Document numbers scoped per company
- PDF header shows selected company info

## Risk

- Existing documents have companyId from old tenant model — backward compatible, no issue
- User with 0 companies can't create documents — show prompt to create company first
