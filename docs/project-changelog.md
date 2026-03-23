# Project Changelog

## [Unreleased] — 2026-03-23 (Schema Cleanup & Infra Simplification)

### Added
- `README.md` — project overview and setup instructions
- `docs/template-creation-guide.md` — full pattern for adding new templates (registry, columns, customData autofill, combobox keys, label-to-key mapping)
- `KeyValueEditor`: `keyOptions` prop — passes template column keys to combobox for structured key selection

### Changed
- `document.templateId` is now NOT NULL — all documents must reference a template
- `KeyValueEditor` combobox key selection sourced from template columns via `keyOptions` prop
- Document form redirect on create goes to `/documents` (not `/documents/[id]`)
- Duplicate document action refreshes page instead of redirecting
- Print button opens PDF in new browser tab

### Removed
- `document.type` column (enum: QUOTATION, DELIVERY_ORDER) — legacy field dropped
- `document.status` column — dropped
- `legacyTypeToTemplateId()` and `templateIdToLegacyType()` functions from `template-registry.ts`
- `documentTypeEnum` and `DocumentType` type

### Infrastructure
- Single branch: `main` (staging branch deleted)
- Single DB: `ep-polished-scene` (prod only)
- Single env file: `.env` (`.env.local` no longer used)

---

## [Unreleased] — 2026-03-23 (customData Combobox)

### Added
- `mapCustomDataToColumnKeys()` in `src/lib/utils/document-helpers.ts` — maps product customData keys (Vietnamese labels e.g. "Số Lô") to column keys (camelCase e.g. `lotNo`) via case-insensitive label matching; applied in `document-items-table.tsx` and `document-detail-edit-panel.tsx`
- `BUILTIN_KEYS` set in `template-registry.ts` — defines system/builtin column keys (stt, productName, specification, unit, quantity, unitPrice, amount, note) excluded from product combobox
- `getAllCustomColumnKeys()` in `template-registry.ts` — returns all non-system, non-builtin custom column keys across all templates for use in KeyValueEditor combobox
- `KeyValueEditor` key input now uses shadcn Popover combobox — options sourced from `getAllCustomColumnKeys()`, user selects readable label, value stored with label as key
- `docs/template-creation-guide.md` — comprehensive guide for adding new templates

---

## [Unreleased] — 2026-03-22

### Added
- `customData` JSONB column (`Record<string, string | number>`) on `company`, `customer`, `product` tables — flexible key-value storage for template-specific autofill
- `KeyValueEditor` component (`src/components/shared/key-value-editor.tsx`) — uncontrolled, ref-based editor for `customData` fields in entity detail panels
- Autofill logic: `customer.customData` and `company.customData` merge into `data.templateFields`; `product.customData` merges into item `customFields`
- `src/db/seed.ts` — dev seed script with realistic Vietnamese business data (companies, customers, products)

### Changed
- Auth pages (`/login`, `/register`) redesigned: typography-only brand, centered card layout
- Autofill on customer/company/product selection now pulls from `customData` JSONB

### Fixed
- 14 bugs resolved: document number generation, duplicate navigation entries, PDF font registration, and others
- `cursor-pointer` applied to `TabsTrigger` components

### Removed
- Old plan files under `plans/` directory cleaned up

---

## [0.4.0] — 2026-03-21 (Design System Standardization)

### Changed
- Standardized font foundation across all pages
- Companies, customers, products, settings pages aligned to design system
- Cleanup of legacy style inconsistencies

---

## [0.3.0] — 2026-03-20 (UI/UX Redesign)

### Changed
- Dashboard redesign
- Documents list/detail redesign
- CRUD list pages redesigned
- Settings/detail pages updated
- Sidebar and mobile navigation enhanced (user card, improved styling)

---

## [0.2.0] — 2026-03-19 (Multi-Company Refactor)

### Changed
- Architecture migrated from company-centric to user-centric
- All data now scoped by `userId`
- Company CRUD page added (master-detail)
- Document form: company dropdown replaces single-company assumption
- Settings page cleanup (removed document_type table; template registry replaces it)
- `document_type` DB table removed — `template-registry.ts` is single source of truth

---

## [0.1.0] — Initial MVP

- Quotation and delivery order document management
- PDF generation via @react-pdf/renderer
- better-auth email/password authentication
- Multi-company support with Neon PostgreSQL
