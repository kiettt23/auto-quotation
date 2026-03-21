# Phase 4: CRUD List Pages (Products, Customers, Companies)

## Priority: P2 | Status: pending | Effort: 2h

## Overview
Apply consistent table card + toolbar pattern from Phase 3 shared components to all CRUD list pages.

## Key Changes

All 3 pages currently share identical layout: title + search input + table + dialog. Apply new design:

### Pattern for each page:
```
PageHeader (title + gradient "Them X" CTA)
TableCard (rounded-xl border bg-white)
  TableToolbar (search only, no tabs for these pages)
  shadcn Table (existing table component, update styles)
  TablePagination
Dialog (existing, no changes needed)
```

### 1. Products — `src/app/(app)/products/product-page-client.tsx`
- Use `<PageHeader>` with title "San pham" + CTA "Them san pham"
- Wrap existing `<ProductTable>` in table card div
- Add `<TableToolbar>` (search only, tabs=[]) above table
- Add `<TablePagination>` below table
- Remove standalone `<Input>` search
- CTA button: gradient style matching dashboard

### 2. Customers — `src/app/(app)/customers/customer-page-client.tsx`
- Same pattern as products
- Title: "Khach hang", CTA: "Them khach hang"

### 3. Companies — `src/app/(app)/companies/company-page-client.tsx`
- Same pattern as products
- Title: "Cong ty", CTA: "Them cong ty"

### 4. Update existing table components
Update table styles across:
- `src/components/products/product-table.tsx`
- `src/components/customers/customer-table.tsx`
- `src/app/(app)/companies/company-table.tsx`

Style updates:
- Table header: `text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50`
- Table cell: `text-[13px] border-t border-slate-100`
- Row hover: `hover:bg-slate-50/50`
- Add inline actions where applicable (edit/delete visible, not in dropdown)

## Modified Files
- `src/app/(app)/products/product-page-client.tsx`
- `src/app/(app)/customers/customer-page-client.tsx`
- `src/app/(app)/companies/company-page-client.tsx`
- `src/components/products/product-table.tsx` (style updates)
- `src/components/customers/customer-table.tsx` (style updates)
- `src/app/(app)/companies/company-table.tsx` (style updates)

## Todo
- [ ] Update product-page-client with PageHeader + TableCard + TableToolbar
- [ ] Update customer-page-client same pattern
- [ ] Update company-page-client same pattern
- [ ] Update table component styles (header, cells, hover)
- [ ] Add pagination to each page
- [ ] Add inline actions to table rows
- [ ] Test all 3 pages responsive

## Success Criteria
- All list pages visually consistent with documents page
- Shared components (PageHeader, TableToolbar, TablePagination) reused
- No backend changes
