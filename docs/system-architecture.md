# System Architecture

## Overview

autoquotation is a Next.js 16 + PostgreSQL web app for managing business documents (quotations, delivery orders). Single authenticated user manages multiple companies and generates PDF documents via a template registry.

**Tech Stack:** Next.js 16.1, React 19, TypeScript, shadcn/ui, Drizzle ORM, better-auth, @react-pdf/renderer, Tailwind CSS 4, Zod 4

## Architecture Principles

- **User-Based Data Isolation**: All data scoped by `userId`
- **Company-Centric Documents**: Documents belong to a user and reference a specific company
- **Template Registry as Single Source of Truth**: All document type config (columns, showTotal, signatureLabels, colors, extraFormFields) defined in code, not DB
- **No document_type table**: Removed — template-registry.ts replaces it entirely

## Data Model

### Core Tables (10 total)

| Table | Relationship | Key Fields |
|-------|-------------|------------|
| `user` | Root entity | Managed by better-auth |
| `account` | Auth accounts | Managed by better-auth |
| `session` | Auth sessions | Managed by better-auth |
| `verification` | Auth verification | Managed by better-auth |
| `company` | 1 user → N companies | `userId`, `name`, `address`, `phone`, `taxCode`, `logoUrl`, `headerLayout`, `driverName`, `vehicleId` |
| `customer` | 1 user → N customers | `userId`, `name`, `address`, `deliveryAddress`, `deliveryName`, `receiverName`, `receiverPhone` |
| `product` | 1 user → N products | `userId`, `name`, `unitPrice`, `specification`, `categoryId`, `unitId` |
| `category` | 1 user → N categories | `userId`, `name` |
| `unit` | 1 user → N units | `userId`, `name` |
| `document` | N docs → 1 company | `userId`, `companyId`, `customerId`, `templateId`, `type` (legacy), `documentNumber`, `data` (JSONB) |

### Document JSONB `data` Structure

```typescript
interface DocumentData {
  date?: string;              // Custom date override
  customerName?: string;
  customerAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  notes?: string;
  columns?: ColumnDef[];      // Per-document column override
  items?: DocumentDataItem[];
  templateFields?: Record<string, string>; // Template-specific fields (nested, not flat)
}
```

**Important**: Template-specific fields (e.g. `deliveryName`, `driverName`, `vehicleId`) are stored under `templateFields` to avoid polluting shared data. Never store them as flat top-level fields.

## Template Registry (`src/lib/pdf/template-registry.ts`)

**Single source of truth** for document types. No DB table — all config in code.

### Adding a New Template

1. Add entry to `registry` array in `template-registry.ts`:
   - `id`, `name`, `description`, `shortLabel` (for doc numbers)
   - `columns: ColumnDef[]` — item table columns for form + PDF
   - `showTotal` — whether to show totals row
   - `signatureLabels` — PDF signature block labels
   - `color` — badge colors for document list UI
   - `extraFormFields` — template-specific form fields (stored in `data.templateFields`)
   - `component` — React PDF component (lazy-loaded)
2. If layout differs from existing: create PDF component in `src/lib/pdf/templates/`
3. If layout matches existing: reuse `DefaultTemplate` component
4. Update legacy type maps if needed (`legacyTypeToTemplateId`, `templateIdToLegacyType`)

### Current Templates

| ID | Name | Short | PDF Component |
|----|------|-------|---------------|
| `quotation` | Báo giá | BG | `DefaultTemplate` |
| `delivery-order` | Phiếu giao hàng | PGH | `JesangDeliveryTemplate` |

### Key Functions

- `getTemplateList()` — all templates (without component, safe for serialization)
- `getTemplateEntry(id)` — single template by ID
- `getTemplateColumns(id)` — columns for a template
- `getExtraFormFields(id)` — extra form fields for a template
- `getTemplateComponent(id)` — React PDF component

## API Layer

### Actions (`src/actions/`)

All require `requireUserId()` authentication. Return `ActionResult<T>`.

```
├── company.actions.ts      — Company CRUD
├── customer.actions.ts     — Customer CRUD
├── product.actions.ts      — Product CRUD
├── category.actions.ts     — Category CRUD
├── unit.actions.ts         — Unit CRUD
└── document.actions.ts     — Document CRUD
```

### Services (`src/services/`)

Business logic between actions and DB. Pattern: `list`, `getById`, `create`, `update`, `delete`.

- `document.service.createDocument(userId, { companyId, templateId, data })` — generates doc number from template shortLabel
- `document.service.duplicateDocument(id, userId)` — copies doc with new number

## Pages & Routes

| Route | Description |
|-------|-------------|
| `(app)/` | Redirects to `/documents` |
| `(app)/documents/` | Document list (master-detail) with template tabs |
| `(app)/documents/new/` | Create document — template selector + form |
| `(app)/documents/[id]/` | Document detail + PDF preview |
| `(app)/companies/` | Company CRUD (master-detail) |
| `(app)/customers/` | Customer CRUD (master-detail) |
| `(app)/products/` | Product CRUD (master-detail) |
| `(app)/settings/` | Categories + Units management |
| `(auth)/login/` | Sign in |
| `(auth)/register/` | Sign up |

### Document List Tabs

Generated dynamically from template registry. Filter by `doc.templateId`. No hardcoded tab values.

### Settings Page

Only has Categories and Units tabs. No "Document Types" tab (removed — template registry replaces it).

## PDF Generation Flow

1. User creates/views document
2. `doc.templateId` resolves template from registry
3. Template component receives `PdfTemplateProps` (company, data, columns, signatureLabels)
4. Template-specific fields read from `data.templateFields`
5. @react-pdf/renderer generates PDF in browser

## Authentication

- better-auth 1.5.5 with email/password
- `requireSession()` / `requireUserId()` helpers
- All queries filtered by `userId` at DB level

## Key Patterns

### Per-Document Column Override

Documents can override template default columns via `data.columns`. Used for user-customized item tables. If not set, falls back to template defaults.

### Template Extra Fields

Template-specific form fields (e.g. delivery address, driver name) are:
1. Defined in template registry as `extraFormFields`
2. Rendered dynamically in document form
3. Stored in `data.templateFields` (nested Record, not flat)
4. Read by PDF templates from `data.templateFields`

### Legacy Type Compatibility

`document.type` column (enum: QUOTATION, DELIVERY_ORDER) kept for backward compat. New documents use `templateId`. Mapping functions exist in template-registry.ts.
