# Phase 4: Products Page → Master-Detail

## Priority: High
## Status: pending
## Depends on: Phase 1

## Overview
Convert Products from table+dialog to master-detail inline edit.

## Files to Modify
- `src/app/(app)/products/product-page-client.tsx` — Rewrite as master-detail
- `src/components/products/product-table.tsx` — Replace with list view, remove dialog
- `src/app/(app)/products/page.tsx` — Server component, passes categories + units

## Files to Create
- `src/app/(app)/products/product-detail-edit-panel.tsx` — Inline edit panel

## Key Fields
name, specification, categoryId, unitId, price

## Field Groups
1. **Thong tin** — name, specification, categoryId (select), unitId (select), price

## Notes
- Products are simpler than other entities — fewer fields, single group
- Need category + unit select dropdowns (data passed from server)
- Price formatting with formatCurrency

## Todo
- [ ] Rewrite product-page-client.tsx as master-detail
- [ ] Create product-detail-edit-panel.tsx
- [ ] Remove old table/dialog pattern
- [ ] CRUD actions inline
- [ ] Type-check + visual verify
