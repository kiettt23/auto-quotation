# Development Roadmap

## Current Status: MVP Active Development

---

## Phase 1 — Core MVP (COMPLETE)

- [x] User authentication (better-auth, email/password)
- [x] Multi-company management (CRUD, master-detail)
- [x] Customer management (CRUD)
- [x] Product/service catalog (CRUD, categories, units)
- [x] Document creation (quotation, delivery order)
- [x] PDF generation via @react-pdf/renderer
- [x] Template registry (single source of truth, no DB table)
- [x] Document number generation (`{shortLabel}-{year}-{seq}`)
- [x] File upload for company logos (@vercel/blob)

---

## Phase 2 — Multi-Company Refactor (COMPLETE — 2026-03-19)

- [x] Migrate from company-centric to user-centric architecture
- [x] All data scoped by `userId`
- [x] Company dropdown on document form
- [x] Remove `document_type` DB table; replace with template registry
- [x] Settings page cleanup

---

## Phase 3 — UI/UX Redesign (COMPLETE — 2026-03-20)

- [x] Dashboard redesign
- [x] Documents list/detail redesign
- [x] CRUD list pages redesigned
- [x] Sidebar + mobile nav enhanced (user card)

---

## Phase 4 — Design System Standardization (COMPLETE — 2026-03-21)

- [x] Font foundation standardized across all pages
- [x] Companies, customers, products, settings aligned to design system
- [x] Legacy style cleanup

---

## Phase 5 — Autofill & Data Quality (COMPLETE — 2026-03-22)

- [x] `customData` JSONB on company, customer, product tables
- [x] `KeyValueEditor` component for editing `customData`
- [x] Autofill: `customData` merges into `templateFields` / item `customFields`
- [x] Auth page redesign (typography-only brand, centered card)
- [x] Dev seed script with realistic Vietnamese data
- [x] 14 bug fixes (doc number generation, PDF fonts, navigation, etc.)

---

## Phase 6 — Next Priorities (PLANNED)

- [ ] Template-specific autofill documentation/onboarding hint in UI
- [ ] Duplicate document action from list view
- [ ] Document search / filter by date range
- [ ] Export to Excel
- [ ] Customer/product import from CSV
- [ ] Email PDF to customer

---

## Non-Goals (Out of Scope for MVP)

- Multi-user / team collaboration
- Invoice payment tracking
- Inventory management
- Mobile native app
