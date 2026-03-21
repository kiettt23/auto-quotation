# Phase 3: Customers Page → Master-Detail

## Priority: High
## Status: pending
## Depends on: Phase 1

## Overview
Convert Customers from table+dialog to master-detail inline edit.

## Files to Modify
- `src/app/(app)/customers/customer-page-client.tsx` — Rewrite as master-detail
- `src/components/customers/customer-table.tsx` — Replace with list view, remove dialog
- `src/app/(app)/customers/page.tsx` — Server component

## Files to Create
- `src/app/(app)/customers/customer-detail-edit-panel.tsx` — Inline edit panel

## Key Fields
name, address, phone, email, taxCode, deliveryAddress, deliveryName, receiverName, receiverPhone

## Field Groups
1. **Thong tin** — name, address, phone, email, taxCode
2. **Giao hang** — deliveryName, deliveryAddress, receiverName, receiverPhone

## Todo
- [ ] Rewrite customer-page-client.tsx as master-detail
- [ ] Create customer-detail-edit-panel.tsx
- [ ] Remove old table/dialog pattern
- [ ] CRUD actions inline
- [ ] Type-check + visual verify
