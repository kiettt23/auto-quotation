# Code Review — Design System Implementation
**Date:** 2026-03-21
**Branch:** staging
**Reviewer:** code-reviewer agent

---

## Scope

| File | LOC | Notes |
|------|-----|-------|
| `src/app/layout.tsx` | 37 | Font swap |
| `src/app/globals.css` | 124 | CSS token update + a11y |
| `src/app/(app)/companies/company-page-client.tsx` | 425 | Master-detail rewrite |
| `src/app/(app)/customers/customer-page-client.tsx` | 298 | Master-detail rewrite |
| `src/app/(app)/products/product-page-client.tsx` | 316 | Master-detail rewrite |
| `src/app/(app)/settings/settings-page-client.tsx` | 111 | Vertical tabs |

---

## Overall Assessment

The master-detail pattern is well-executed and consistent across all three CRUD pages. Logic is clean and readable. The main actionable concern is the **`LabeledField` duplication** across 4 files — this is the single most impactful fix. Secondary issues are minor accessibility gaps and a stale comment in globals.css.

---

## Critical Issues

None.

---

## High Priority

### 1. `LabeledField` duplicated across 4 files
`LabeledField` is defined identically (identical JSX and className strings) in:
- `company-page-client.tsx` (line 18)
- `customer-page-client.tsx` (line 18)
- `product-page-client.tsx` (line 28)
- `document-detail-edit-panel.tsx` (line 35)

This violates DRY. If the label style ever needs to change (font size, color, spacing), it requires 4 edits.

**Fix:** Extract to `src/components/shared/labeled-field.tsx` and import in all 4 files.

```tsx
// src/components/shared/labeled-field.tsx
export function LabeledField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-0.5 block text-[11px] font-medium text-slate-400">
        {label}
      </span>
      {children}
    </div>
  );
}
```

---

## Medium Priority

### 2. Stale comment in `globals.css` — font name mismatch
Line 55: the design-system block comment still says `Font: DM Sans` but Plus Jakarta Sans is now in use.

```css
/* Fix: */
* Font: Plus Jakarta Sans
```

### 3. `plusJakartaSans` in `layout.tsx` not configured as CSS variable
`poppins` is configured with `variable: "--font-poppins"` and used as `poppins.variable` on `<body>`. `plusJakartaSans` uses `.className` directly instead.

This is inconsistent. The `globals.css` `--font-sans` var references the string `'Plus Jakarta Sans'` — this works, but means the font loading is not tracked by Next.js font subsetting for the `--font-sans` token. Consider making it consistent:

```tsx
// layout.tsx
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",  // add this
});

// body className
className={`${plusJakartaSans.variable} ${poppins.variable} antialiased`}
```

And update `globals.css`:
```css
--font-sans: var(--font-sans), 'Plus Jakarta Sans', sans-serif;
```

### 4. `handleDelete` missing `isPending` guard (Companies page)
`company-page-client.tsx` lines 249-258: `handleDelete` does not set `isPending` and has no loading state. A double-click after the `confirm()` can fire two delete requests.

`customer-page-client.tsx` and `product-page-client.tsx` have the same issue.

**Fix:** Set `setIsPending(true)` in `handleDelete` and disable the delete button while pending, same as `handleSave`.

### 5. `confirm()` is not accessible
`confirm()` native dialogs block the main thread and cannot be styled or localized. In a Vietnamese SaaS app, this is especially jarring since the browser's dialog chrome is in the OS language.

**Fix:** Replace with a shadcn `AlertDialog` or a simple inline confirmation toggle. This is low-effort with the existing shadcn setup.

### 6. `useRouter` imported but `handleSaved`/`handleDeleted` could be inline (Companies)
`company-page-client.tsx` defines standalone `handleSaved` (line 73) and `handleDeleted` (line 77) functions that simply call `router.refresh()` or set state + refresh. `customer-page-client.tsx` and `product-page-client.tsx` already use inline arrow functions for the same props — inconsistency within the pattern.

```tsx
// Companies: currently
function handleSaved() { router.refresh(); }
function handleDeleted() { setSelectedId(null); router.refresh(); }

// Should match customer/product pattern:
onSaved={() => router.refresh()}
onDeleted={() => { setSelectedId(null); router.refresh(); }}
```

---

## Low Priority

### 7. Global `:focus-visible` override is very broad
`globals.css` line 121-123 applies `ring-2 ring-indigo-500 ring-offset-2` to every `:focus-visible` element site-wide. This overrides the built-in shadcn focus ring on `Button`, `Input`, `Select`, etc., which may cause conflicts with components that have their own ring colors (e.g., destructive buttons).

Not a blocker, but worth monitoring if focus rings look wrong on red/muted elements.

### 8. Empty state text is slightly inconsistent
- Companies empty: `"Chưa có công ty nào"` / `"Nhấn + để thêm công ty đầu tiên"` (more descriptive)
- Customers empty: `"Chưa có khách hàng"` / `"Nhấn + để thêm"` (truncated)
- Products empty: `"Chưa có sản phẩm"` / `"Nhấn + để thêm"` (truncated)

Minor, but if a shared `EmptyState` component is eventually extracted, this inconsistency will need resolving.

### 9. `textarea` in product form bypasses shadcn styling
`product-page-client.tsx` line 304-309: raw `<textarea>` with manual Tailwind classes, while all other inputs use `<Input>` from shadcn. The focus styles are hand-rolled (`focus:border-indigo-500 focus:ring-1`) and don't use the `:focus-visible` base rule from globals.css.

Either wrap in a `<Textarea>` shadcn component (if available) or at minimum use `focus-visible:` prefix instead of `focus:` to stay consistent with the global a11y style.

### 10. Avatar initials: no guard for empty name
`c.name.charAt(0).toUpperCase()` — if `name` is an empty string (possible for new records before save), this renders an empty avatar. Low risk but a fallback character like `"?"` would be cleaner.

---

## Positive Observations

- Pattern consistency across all 3 CRUD pages is excellent — same flex ratios (`flex-[3]`/`flex-[2]`), same animation curve, same toolbar structure.
- `isDirty` computed properly from all fields — Save button correctly disabled when no changes.
- `useMemo` on filtered list is correct and efficient.
- Settings vertical tabs uses `as const` + derived `TabId` type — clean and type-safe.
- Error and success toasts are consistently surfaced from server action results.
- `fieldset`/`legend` semantic HTML in form groups is good for screen readers.
- Font loading with `latin-ext` subset is correct for Vietnamese text.

---

## Recommended Actions

1. **Extract `LabeledField`** to `src/components/shared/labeled-field.tsx` — 4 files to update (HIGH)
2. **Add `isPending` guard to `handleDelete`** across all 3 CRUD pages (MEDIUM)
3. **Fix stale font comment** in globals.css (LOW, 1 line)
4. **Align `plusJakartaSans` to use CSS variable** for consistency with Poppins setup (MEDIUM)
5. **Replace `confirm()`** with AlertDialog in a follow-up — acceptable now, plan for UX polish sprint (MEDIUM)
6. **Align `handleSaved`/`handleDeleted`** in companies to match inline style used by customer/product (LOW)

---

## Metrics

- Type Coverage: High — all props typed, `as const` used in settings tabs
- Linting Issues: 0 apparent syntax errors; `LabeledField` duplication is a DRY violation only
- Accessibility: `fieldset`/`legend` good; `confirm()` and close button (no `aria-label`) are gaps

---

## Unresolved Questions

- Should `LabeledField` support an optional `required` indicator (renders `*` in label) to replace the current string-level `"Tên công ty *"` approach? Centralizing this would enforce consistent required-field styling.
- Is a shadcn `<Textarea>` component available or planned? Determines whether raw `<textarea>` in products should be wrapped now or later.
