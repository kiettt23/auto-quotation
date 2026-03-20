# Phase 5: Settings Cleanup

## Priority: P3 | Status: completed | Effort: 1h

## Overview

Remove company info section from Settings page. Company is now managed at `/companies`. Settings keeps: document types, categories, units.

## Key Insights

- Settings currently has: company info form + doc types + categories + units
- Company info form moves to `/companies` CRUD (Phase 3)
- Doc types currently scoped by companyId → now scoped by userId
- Categories and units also switch to userId scope (done in Phase 2)

## Related Code Files

**Modify:**
- `src/app/(app)/settings/page.tsx` — remove company fetch, remove company prop
- `src/app/(app)/settings/settings-page-client.tsx` — remove company info tab/section
- `src/app/(app)/settings/settings-form.tsx` — likely delete or gut company fields

**Possibly delete:**
- Company-related form components in settings if they exist as separate files

## Implementation Steps

1. Update `settings/page.tsx`:
   - Remove `getCompanyByOwnerId` call
   - Remove `company` from Promise.all
   - Don't pass `company` prop to client component

2. Update `settings-page-client.tsx`:
   - Remove company info section/tab
   - Keep doc types, categories, units sections
   - Remove `company` from props type

3. Clean up `settings-form.tsx`:
   - If it's only for company info → delete the file
   - If it's mixed → remove company fields only

4. Verify doc types, categories, units still work with userId scope (should be handled by Phase 2)

## Todo

- [x] Remove company info from settings page server component
- [x] Remove company info section from settings client component
- [x] Clean up or delete settings-form.tsx
- [x] Verify remaining settings sections work correctly
- [x] Test settings page loads without errors

## Success Criteria

- Settings page has no company info section
- Doc types, categories, units still manageable in Settings
- No broken imports or missing props
- Page renders correctly

## Risk

- Low risk — mostly removing code
- Ensure logo upload UI is available on the new company CRUD page (Phase 3)
