# Phase 6: Cleanup

## Priority: Medium
## Status: pending
## Depends on: Phases 2-5

## Overview
Remove deprecated components, unused files, update docs.

## Files to Delete
- `src/components/shared/page-header.tsx` — replaced by master-detail (no page titles)
- `src/components/shared/table-toolbar.tsx` — replaced by inline filter tabs
- `src/components/shared/table-pagination.tsx` — unused, never integrated
- `src/app/(app)/dashboard-client.tsx` — dashboard removed, / redirects to /documents
- `src/components/dashboard/recent-documents-table.tsx` — dashboard component
- `src/components/dashboard/stat-card-grid.tsx` — dashboard component
- `src/services/stats.service.ts` — dashboard stats service
- `src/components/layout/app-sidebar.tsx` — not used in layout
- `src/components/layout/sidebar-user-card.tsx` — sidebar child
- `src/components/layout/mobile-bottom-nav.tsx` — verify if still needed
- `src/app/(app)/loading.tsx` — verify if still needed

## Files to Update
- `src/components/layout/nav-items.ts` — verify all nav items still valid
- `docs/design-guidelines.md` — update with finalized design system tokens

## Verification
- Grep for imports of deleted files to ensure no broken references
- Type-check passes
- All pages render correctly

## Todo
- [ ] Delete unused components
- [ ] Grep for broken imports
- [ ] Update design-guidelines.md
- [ ] Final type-check
- [ ] Visual verification all pages
