# Phase 1: Font & Foundation

## Priority: Critical
## Status: pending

## Overview
Replace DM Sans with Plus Jakarta Sans, simplify typography scale, standardize border-radius, add focus/a11y states. No shared component extraction — just token-level changes.

## Files to Modify

### Font swap
- `src/app/layout.tsx` — Replace DM_Sans import with Plus_Jakarta_Sans from next/font/google. Keep Poppins as-is.
- `src/app/globals.css` — Update --font-sans CSS variable if needed

### Typography scale cleanup (apply new 5-step scale)
Scan all files for `text-[10px]` → change to `text-[11px]` (merge into xs token)
Keep `text-[13px]` as sm token (already widely used)
Remove `text-[12px]` occurrences (use text-xs which is 12px, or text-[13px])

### Border-radius cleanup
Replace `rounded-[10px]` → `rounded-xl` (search input in table-toolbar, document-list-client)

### Focus/a11y
- `src/app/globals.css` — Add global focus-visible styles for buttons, inputs, selects, links

## Implementation Steps

1. Install Plus Jakarta Sans via next/font/google in layout.tsx
2. Replace `dmSans` variable with `plusJakartaSans`
3. Update body className
4. Search & replace text-[10px] → text-[11px] across all files
5. Search & replace rounded-[10px] → rounded-xl
6. Add focus-visible ring styles to globals.css
7. Run type-check + visual verify

## Todo
- [ ] Swap DM Sans → Plus Jakarta Sans in layout.tsx
- [ ] Update globals.css font variable
- [ ] Normalize typography: text-[10px] → text-[11px]
- [ ] Normalize border-radius: rounded-[10px] → rounded-xl
- [ ] Add focus-visible a11y styles
- [ ] Type-check passes
- [ ] Visual verification
