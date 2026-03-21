# Phase 2: Companies Page → Master-Detail

## Priority: High
## Status: pending
## Depends on: Phase 1

## Overview
Convert Companies from table+dialog to master-detail inline edit. Mirror Documents page pattern exactly.

## Files to Modify
- `src/app/(app)/companies/company-page-client.tsx` — Rewrite: master-detail layout, selection state, filter tabs
- `src/app/(app)/companies/company-table.tsx` — Replace with list view (not table), remove dialog
- `src/app/(app)/companies/page.tsx` — Server component, may need to pass additional data

## Files to Create
- `src/app/(app)/companies/company-detail-edit-panel.tsx` — Inline edit panel with fields: name, address, phone, email, taxCode, bankName, bankAccount, driverName, vehicleId

## Files to Delete
- Company dialog component (if separate file, or remove from table)

## Key Fields (from DB schema)
name, address, phone, email, taxCode, bankName, bankAccount, logoUrl, headerLayout, driverName, vehicleId

## Field Groups
1. **Thong tin** — name, address, phone, email, taxCode
2. **Ngan hang** — bankName, bankAccount
3. **Van chuyen** — driverName, vehicleId

## Pattern Reference
Copy layout structure from `src/app/(app)/documents/document-list-client.tsx`:
- flex h-[calc(100vh-48px)] px-10 py-6
- Master flex-[3], detail flex-[2]
- Sliding filter tabs (if applicable — companies may not need type filter)
- List rows: icon badge + name + address subtitle
- Detail: action header + fieldset groups + separator

## Todo
- [ ] Rewrite company-page-client.tsx as master-detail
- [ ] Create company-detail-edit-panel.tsx
- [ ] Remove old table/dialog pattern
- [ ] CRUD actions: save, delete inline
- [ ] Add new company flow (empty panel)
- [ ] Type-check + visual verify
