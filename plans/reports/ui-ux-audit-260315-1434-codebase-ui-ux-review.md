# UI/UX Audit — Auto Quotation SaaS
**Date:** 2026-03-15
**Scope:** Full codebase review — layout, forms, tables, empty states, loading, a11y, navigation, share views
**Auditor:** UI/UX Designer agent

---

## Executive Summary

The app is built on a solid foundation (shadcn/ui + Tailwind, Sky/Slate palette, Vietnamese UI copy). Component patterns are largely consistent. However, a cluster of **accessibility gaps**, **mobile UX friction**, and **empty-state / loading-state inconsistencies** create real friction for daily users. No issues are catastrophic, but several are Major and will hurt user trust and task completion rates in a B2B Vietnamese business context.

**Issue count by severity:**
| Severity | Count |
|---|---|
| Critical | 2 |
| Major | 9 |
| Minor | 8 |
| Enhancement | 7 |

---

## Critical Issues

### C-01 — Customer Autocomplete Breaks Layout in Doc Entry Form
**File:** `src/components/doc-entry/doc-entry-field-inputs.tsx:46-53`
**Severity:** Critical
**Impact:** Core data-entry workflow breaks on narrow columns

When a field has `dataSource === "customer"`, the Label and the `CustomerAutocompleteCombobox` button are placed side-by-side in a `flex items-center justify-between` row. But the grid is `sm:grid-cols-2` — on narrow columns (e.g., 375px mobile or narrow desktop sidebar-open), the label text wraps under the button, making the label unreadable and the input orphaned visually.

Furthermore `CustomerAutocompleteCombobox` toggles between a `<Button>` and an inline `<Command>` component — when it expands it breaks out of the grid cell because `<Command>` has no max-width constraint inside a grid cell, pushing the layout horizontally.

**Fix:**
```tsx
// Replace inline expand pattern with a Popover instead:
// Label row: just the Label
// Below it: Input + a search icon button that opens Popover with Command inside
// The Command should be in a Portal / PopoverContent (w-[300px])
```
Use `<Popover>` wrapping `<Command>` (same pattern as product combobox which uses `CommandDialog`). Separate the autocomplete trigger from the label row entirely.

---

### C-02 — No Loading/Disabled State on Delete Confirm Button
**File:** `src/components/doc-entry/doc-entry-table.tsx:148-151`, `src/components/customer/customer-data-table.tsx:144-151`
**Severity:** Critical
**Impact:** Double-submission risk — user can click "Xóa" multiple times in AlertDialog

`isPending` is shared across all row operations (one `useTransition`). The `AlertDialogAction` button has `disabled={isPending}` but if two rows' dialogs were both opened (impossible with one dialog, but the pattern is fragile) or if the button is clicked quickly before React state updates, duplicate deletes can fire. More importantly: the `AlertDialogAction` has no spinner/loading state — user gets no feedback that the delete is in progress.

**Fix:**
```tsx
<AlertDialogAction onClick={() => handleDelete(...)} disabled={isPending}>
  {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
  Xóa
</AlertDialogAction>
```
Add per-row pending state (or at minimum a spinner in the action button).

---

## Major Issues

### M-01 — Mobile Bottom Nav Missing "Sản phẩm" and "Khách hàng"
**File:** `src/components/layout/nav-items.ts:45,50`
**Severity:** Major
**Impact:** On mobile, users cannot navigate to Products or Customers at all

`showInBottomNav: false` for both `/products` and `/customers`. The sidebar is collapsed on mobile. The mobile bottom nav shows only Dashboard, Templates, Documents. There is no path to reach Products or Customers on a phone without knowing the URL.

**Fix:** Either add Products + Customers to bottom nav (max 5 items works well), or add a "More" overflow item that opens a sheet with all nav items. Given 5 nav items + Settings + Logout, a "More" drawer pattern is cleanest.

---

### M-02 — Settings Tab "Danh mục & ĐVT" Truncates on Mobile
**File:** `src/components/settings/settings-page-client.tsx:18`
**Severity:** Major
**Impact:** Tab text unreadable on small screens

`grid-cols-4` for tab list with 4 Vietnamese labels. On 320-375px screens "Danh mục & ĐVT" truncates to "Danh mục &..." and tabs become very narrow. `grid w-full grid-cols-4` forces equal width regardless of label length.

**Fix:**
```tsx
// Replace with flex-wrap or scrollable tabs:
<TabsList className="flex flex-wrap gap-1 h-auto">
  // or use overflow-x-auto + no-wrap
```
Or abbreviate the tab label: "ĐVT & Danh mục" → "Danh mục" (separate tab for Units).

---

### M-03 — No Error Boundary or Fallback for Failed Page Loads
**File:** `src/app/(dashboard)/dashboard/page.tsx`, all page files
**Severity:** Major
**Impact:** Any server error throws a blank Next.js error page with no Vietnamese copy

No `error.tsx` files exist in the dashboard route group. If `getDashboardStats` or `getDocuments` throws, users see a generic error page.

**Fix:** Add `src/app/(dashboard)/error.tsx` with a friendly Vietnamese error state:
```tsx
"use client";
export default function Error({ reset }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <p className="text-muted-foreground">Có lỗi xảy ra. Vui lòng thử lại.</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
```

---

### M-04 — Document List Empty State Action is Broken
**File:** `src/components/doc-entry/doc-entry-list-client.tsx:69`
**Severity:** Major
**Impact:** Empty state CTA does nothing — `actionHref="#"` navigates to `#`

```tsx
<EmptyState
  ...
  actionHref="#"   // BUG: href="#" scrolls to top, does not open picker dialog
/>
```
The "Tạo tài liệu" button in the empty state should open the `DocEntryTemplatePickerDialog` like the toolbar button does. Instead it links to `#`.

**Fix:**
```tsx
// Pass actionOnClick prop to EmptyState, or render EmptyState with a button onClick:
<EmptyState
  ...
  actionLabel="Tạo tài liệu"
  onAction={() => setPickerOpen(true)}  // add onAction prop to EmptyState
/>
```
Requires adding `onAction?: () => void` to `EmptyState` props alongside `actionHref`.

---

### M-05 — No Confirmation for Share Link Generation
**File:** `src/components/doc-entry/doc-entry-table.tsx:48-58`
**Severity:** Major
**Impact:** Accidental public link creation with no way to revoke

Clicking "Chia sẻ" immediately creates a public share link and copies it to clipboard with no confirmation. For Vietnamese B2B users sharing confidential quotations, this is dangerous UX. There is no "revoke link" option shown.

**Fix:** Show an `AlertDialog` or `Sheet` that:
1. Warns the user the document will be publicly accessible
2. Shows the generated link with a copy button
3. Optionally allows revoking the link

---

### M-06 — Form Accessibility: Labels Not Associated with Inputs
**File:** `src/components/settings/company-info-form.tsx:181-191`, `src/components/settings/defaults-form.tsx:50-51`
**Severity:** Major
**Impact:** Screen readers cannot associate labels with inputs; fails WCAG 2.1 1.3.1

The `FieldInput` helper in `company-info-form.tsx` renders `<Label>` without an `htmlFor` and `<Input>` without an `id`. Labels and inputs are visually adjacent but not programmatically linked.

```tsx
// Current — broken:
function FieldInput({ label, error, ...props }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>   // no htmlFor
      <Input {...props} />      // no id
    </div>
  );
}
```

Similarly in `defaults-form.tsx:50`: `<Label>VAT mặc định (%)</Label>` has no `htmlFor`.

**Fix:**
```tsx
function FieldInput({ label, error, id, name, ...props }) {
  const fieldId = id ?? name ?? label;
  return (
    <div className="space-y-1">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} name={name} {...props} />
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
```

---

### M-07 — Onboarding Hardcodes `bg-green-500` Outside Design System
**File:** `src/components/onboarding/onboarding-wizard.tsx:62,69`
**Severity:** Major
**Impact:** Color inconsistency; ignores semantic color tokens; breaks dark mode if ever added

```tsx
// Hardcoded Tailwind color, not a design token:
"bg-green-500 text-white"      // completed step
"bg-green-500"                  // connector line
```
The design system defines `--color-success: #16A34A` (equivalent to `green-600`, not `green-500`). These colors will diverge if the design system changes.

**Fix:** Add `bg-success text-white` or use `bg-primary` for completed steps (common pattern). Remove hardcoded `bg-green-500`.

---

### M-08 — Table Row Actions: No Keyboard Accessibility for Dropdown + AlertDialog Combination
**File:** `src/components/doc-entry/doc-entry-table.tsx:128-156`, `src/components/customer/customer-data-table.tsx:123-153`
**Severity:** Major
**Impact:** Keyboard-only users cannot trigger delete confirmation; fails WCAG 2.1 2.1.1

Nesting `<AlertDialog>` inside `<DropdownMenuItem>` with `onSelect={(e) => e.preventDefault()}` is a known radix-ui pattern but it breaks keyboard focus flow — after the AlertDialog closes, focus is not returned to the trigger row. Users must Tab from the beginning.

**Fix:** Move the AlertDialog state outside the dropdown. Use a row-level state `deletingId` and render a single AlertDialog outside the table, triggered by a `useState` flag. This is the recommended pattern for tables with destructive actions.

---

### M-09 — Share View Uses Raw HTML `<table>` Instead of Design System
**File:** `src/components/share/share-document-view.tsx:54-74`, `src/components/share/share-quote-view.tsx:88-111`
**Severity:** Major
**Impact:** Public-facing views use different visual language than the app; `text-gray-*` hardcoded colors vs design token `text-muted-foreground`

Both share views use raw `<table>`, `<thead>`, hardcoded `text-gray-500`, `bg-gray-50`, `text-gray-400` — none of these respect the design system's `--muted-foreground` token. If the palette ever changes, share views will look mismatched.

**Fix:** Either use the design system `Table` components in share views, or extract a `ShareTable` component that uses CSS variables (`text-[color:var(--muted-foreground)]`) instead of static gray values. At minimum, replace `text-gray-*` with semantic equivalents (`text-muted-foreground`, `bg-muted`).

---

## Minor Issues

### m-01 — Loading Skeleton Doesn't Match Actual Content Shape
**File:** `src/app/(dashboard)/documents/loading.tsx`
**Severity:** Minor

`Skeleton className="h-10 w-full"` for the toolbar area does not reflect the actual toolbar (Select + Button side by side). Creates jarring layout shift on load.

**Fix:** Match skeleton to real layout — two skeletons side by side for toolbar:
```tsx
<div className="flex justify-between">
  <Skeleton className="h-10 w-[220px]" />
  <Skeleton className="h-10 w-[120px]" />
</div>
```

---

### m-02 — `font-feature-settings: "tnum"` Applied Globally
**File:** `src/app/globals.css:98`
**Severity:** Minor

Tabular numbers (`tnum`) on the `body` affects all text, including Vietnamese body copy. While helpful for numbers in tables, it can slightly alter spacing in paragraph text. Better scoped to numeric contexts only.

**Fix:** Remove from `body`, apply only to numeric elements: `className="tabular-nums"` on specific elements (already done in some places). Remove global `font-feature-settings`.

---

### m-03 — `DocEntryTable` Shares Single `isPending` for All Operations
**File:** `src/components/doc-entry/doc-entry-table.tsx:46`
**Severity:** Minor

One `isPending` shared by share, delete, and future operations. If share is in progress, delete button on every row is disabled. Operations should have independent pending state.

---

### m-04 — Customer Table Column Header "Số BG" is Unexplained
**File:** `src/components/customer/customer-data-table.tsx:83`
**Severity:** Minor

"Số BG" (Số Báo Giá) abbreviation is not obvious for new users. Should be "Số tài liệu" or at minimum have a tooltip explaining the abbreviation, especially since the system has migrated away from "báo giá" terminology to "tài liệu".

---

### m-05 — No Pagination Shown When `totalPages <= 1`
**File:** `src/components/customer/customer-data-table.tsx:164`
**Severity:** Minor

When there are, e.g., exactly 10 customers and page size is 10, `totalPages === 1` hides pagination entirely — but `total` count is also hidden. User sees no indication of how many customers there are.

**Fix:** Always show the total count even when pagination is hidden:
```tsx
<p className="text-sm text-muted-foreground">{total} khách hàng</p>
```

---

### m-06 — `DocEntryTableRegionEditor` Has No Row Count Limit Warning
**File:** `src/components/doc-entry/doc-entry-table-region-editor.tsx`
**Severity:** Minor

Users can add unlimited rows to a document table. For Excel export this may cause template overflow. No warning or soft limit is shown.

---

### m-07 — `MoreHorizontal` Button Missing `aria-label`
**File:** `src/components/doc-entry/doc-entry-table.tsx:101`, `src/components/customer/customer-data-table.tsx:114`
**Severity:** Minor

```tsx
<Button variant="ghost" size="icon" className="size-8">
  <MoreHorizontal className="size-4" />
</Button>
```
Icon-only buttons without `aria-label` are invisible to screen readers.

**Fix:**
```tsx
<Button variant="ghost" size="icon" className="size-8" aria-label="Tùy chọn">
```

---

### m-08 — `DocEntryFormPage` Page Title "Chỉnh sửa: BG-XXXX" Not in `<title>` Tag
**File:** `src/components/doc-entry/doc-entry-form-page.tsx:138-139`
**Severity:** Minor

The h1 shows the doc number but Next.js `metadata` is not updated dynamically for client components — browser tab still shows the generic page title. Not critical but affects multi-tab workflows common in business use.

---

## Enhancement Opportunities

### E-01 — StatCard Has No Trend Indicator or Link
**File:** `src/components/dashboard/stat-card.tsx`
Cards show total counts but no trend (vs last month) and are not clickable links to the relevant section. Adding `href` to StatCard (link to `/documents`, `/customers`, etc.) would improve discoverability.

---

### E-02 — Document List Lacks Search
**File:** `src/components/doc-entry/doc-entry-list-client.tsx`
Only template-based filter exists. No text search by doc number. For businesses with 50+ documents, this becomes a daily friction point. Add a debounced search input that filters by `docNumber`.

---

### E-03 — Template Picker Dialog Could Show Template Description
**File:** `src/components/doc-entry/doc-entry-template-picker-dialog.tsx`
The Select dropdown shows only template name and entry count. A preview of field structure or description would help users pick the right template faster.

---

### E-04 — Share View Has No "Download PDF" Action
**File:** `src/components/share/share-document-view.tsx`, `share-quote-view.tsx`
The public share page shows the document but gives the recipient no way to download/print. Adding a "Tải xuống PDF" button (linking to `/api/doc-export/pdf/[id]` or a print stylesheet) would greatly improve the recipient experience.

---

### E-05 — Onboarding Step Labels Not Visible (Icon Only on Small Screens)
**File:** `src/components/onboarding/onboarding-wizard.tsx:58-73`
Progress indicator shows step number circles + connecting lines. Step titles (`STEPS[].title`) are never rendered — only icons in step 3. Consider rendering step titles below each circle for orientation.

---

### E-06 — No Dark Mode Support
**File:** `src/app/globals.css`
Only light mode variables are defined. No `:root.dark` or `@media (prefers-color-scheme: dark)` block. For a SaaS tool used throughout the day, dark mode is increasingly expected. The token structure is already in place — adding a dark palette would be straightforward.

---

### E-07 — `CustomerAutocompleteCombobox` Minimum Query Length is 1
**File:** `src/components/shared/customer-autocomplete-combobox.tsx:36`
```tsx
if (q.length < 1) { setResults([]); return; }
```
This means empty string shows nothing, but a single character fires a server search. A minimum of 2 characters is more network-efficient and reduces noise results.

---

## Priority Fix Order

| Priority | Issue | Effort | Impact |
|---|---|---|---|
| 1 | M-04 — Empty state broken CTA | Low | High |
| 2 | C-02 — Delete button no loading state | Low | High |
| 3 | M-06 — Label/input not associated (a11y) | Low | High |
| 4 | m-07 — Missing aria-label on icon buttons | Low | Medium |
| 5 | M-01 — Mobile nav missing Products/Customers | Medium | High |
| 6 | C-01 — Customer autocomplete breaks layout | Medium | High |
| 7 | M-03 — No error boundary | Low | High |
| 8 | M-05 — Share link no confirmation | Medium | High |
| 9 | M-02 — Settings tabs truncate on mobile | Low | Medium |
| 10 | M-08 — Nested AlertDialog keyboard focus | Medium | Medium |
| 11 | M-07 — Hardcoded green-500 in onboarding | Low | Low |
| 12 | M-09 — Share view raw table, hardcoded colors | Low | Low |
| 13 | E-02 — Doc list search | Medium | High |
| 14 | E-04 — Share view PDF download | Low | High |
| 15 | All other enhancements | Varies | Medium |

---

## Design System Notes

The token setup in `globals.css` is well-structured (Sky/Slate palette, semantic color vars, consistent radius scale). No issues with the design system itself. The `field.tsx` component is a full-featured field system but is **not used anywhere in the app** — all forms use raw `<Label>` + `<Input>` + manual error `<p>`. Consider migrating forms to use `<Field>`, `<FieldLabel>`, `<FieldError>` for consistency and built-in accessibility.

Inter as the base font supports Vietnamese characters well. No font fallback issues identified.

---

## Unresolved Questions

1. Is dark mode on the roadmap? If yes, the color token structure already supports it — worth planning now.
2. What is the target device breakdown for Vietnamese users? If >40% mobile, M-01 (mobile nav) should be Priority 1.
3. Does the share link have an expiry mechanism on the UI side? The DB schema has `shareTokenExpiresAt` but no UI expiry picker was found.
4. The `CustomerDataTable` column header says "Số BG" (Số Báo Giá) — is this intentional residue from the quotes system or should it be updated to reflect the new "tài liệu" terminology?
