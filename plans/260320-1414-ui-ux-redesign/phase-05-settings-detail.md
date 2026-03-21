# Phase 5: Settings & Document Detail Pages

## Priority: P2 | Status: pending | Effort: 2h

## Overview
Apply design system to settings page and document detail/form pages.

## Key Changes

### 1. Settings page
**File:** `src/app/(app)/settings/settings-page-client.tsx`

Current: shadcn Tabs with TabsList. Mostly fine, needs color update.

Changes:
- Use `<PageHeader>` with title "Cai dat"
- Update TabsTrigger active color: indigo instead of default
- Card wrapper for each tab content: `rounded-xl border border-slate-200 bg-white p-6`
- SimpleListManager items: update any blue references to indigo
- No structural changes needed — settings is already well-designed

### 2. Document detail page
**File:** `src/app/(app)/documents/[id]/document-detail-client.tsx`

Changes:
- Page header with doc number + back button
- Action buttons: gradient "Sua" CTA, outline "Nhan ban", outline "Xuat PDF"
- Document info in card layout with `rounded-xl border bg-white`
- Type badge with dot color matching mockup pattern
- Update any blue color references to indigo

### 3. Document form pages
**Files:**
- `src/app/(app)/documents/new/page.tsx`
- `src/app/(app)/documents/[id]/edit/page.tsx`
- `src/components/documents/document-form.tsx`

Changes:
- Form card wrapper: `rounded-xl border bg-white p-6`
- Input focus rings: indigo instead of blue
- Submit button: gradient CTA
- Section headers within form: `text-sm font-semibold text-slate-900`
- Overall: color accent swap, no structural changes

### 4. Global color sweep
Search-replace remaining blue-50/blue-600/blue-500 references across all components to indigo equivalents:
- `bg-blue-50` -> `bg-indigo-50`
- `text-blue-600` -> `text-indigo-600`
- `bg-blue-600` -> `bg-indigo-600` (or gradient)
- `border-blue-*` -> `border-indigo-*`
- `shadow-blue-*` -> `shadow-indigo-*`

## Modified Files
- `src/app/(app)/settings/settings-page-client.tsx`
- `src/app/(app)/documents/[id]/document-detail-client.tsx`
- `src/app/(app)/documents/new/page.tsx`
- `src/app/(app)/documents/[id]/edit/page.tsx`
- `src/components/documents/document-form.tsx`
- Various components for blue->indigo sweep

## Todo
- [ ] Update settings page with PageHeader + card wrappers + indigo tabs
- [ ] Update document detail with new header + action buttons
- [ ] Update document form styling
- [ ] Global blue->indigo color sweep
- [ ] Test all pages for visual consistency
- [ ] Verify mobile responsive on settings tabs

## Success Criteria
- All pages use indigo accent consistently
- No remaining blue-600/blue-50 references in app components
- Settings and detail pages match overall design language
