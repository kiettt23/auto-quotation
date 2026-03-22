# Codebase Summary

## Project Overview

**autoquotation** is a Next.js 16 + PostgreSQL web app for managing business documents (quotations, delivery orders). Users manage multiple companies and generate PDF documents with professional templates.

**Tech Stack**:
- Frontend: Next.js 16.1, React 19, TypeScript, shadcn/ui 3.8.5
- Backend: Next.js Server Actions, TypeScript
- Database: PostgreSQL 14+ with Drizzle ORM 0.45.1
- Authentication: better-auth 1.5.5 (email/password)
- PDF Generation: @react-pdf/renderer 4.3.2 with template registry
- File Storage: @vercel/blob
- Styling: Tailwind CSS 4, radix-ui
- Validation: Zod 4

## Directory Structure

```
src/
├── app/                           # Next.js app router
│   ├── (auth)/                    # Unprotected routes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (app)/                     # Protected routes (require userId)
│   │   ├── layout.tsx             # App layout with AppHeader
│   │   ├── page.tsx               # Home → redirects to /documents
│   │   ├── loading.tsx            # Loading skeleton
│   │   ├── companies/             # Multi-company CRUD (master-detail)
│   │   ├── customers/             # Customer CRUD (master-detail)
│   │   ├── products/              # Product CRUD (master-detail)
│   │   ├── documents/             # Document management
│   │   │   ├── page.tsx           # List with template tabs
│   │   │   ├── document-list-client.tsx
│   │   │   ├── document-detail-edit-panel.tsx
│   │   │   ├── new/page.tsx       # Create document (template selector)
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # View + PDF preview
│   │   │       └── document-detail-client.tsx
│   │   └── settings/              # Categories + Units
│   │       ├── page.tsx
│   │       └── settings-page-client.tsx
│   ├── api/auth/[...all]/         # better-auth routes
│   ├── api/upload-logo/           # File upload handler
│   ├── onboarding/                # First-time user flow
│   └── layout.tsx                 # Root layout (Plus Jakarta Sans font)
├── actions/                       # Server actions
│   ├── company.actions.ts
│   ├── customer.actions.ts
│   ├── product.actions.ts
│   ├── category.actions.ts
│   ├── unit.actions.ts
│   └── document.actions.ts
├── components/
│   ├── layout/                    # Layout components
│   │   ├── app-header.tsx         # Top header with user menu
│   │   ├── app-brand.tsx          # "autoquotation" logo (Poppins)
│   │   ├── mobile-bottom-nav.tsx  # Mobile navigation
│   │   └── nav-items.ts           # Navigation menu items
│   ├── documents/                 # Document-specific
│   │   ├── document-form.tsx      # Create/edit form with template selector
│   │   ├── document-items-table.tsx
│   │   ├── document-pdf-viewer.tsx
│   │   ├── document-pdf-download-button.tsx
│   │   └── document-customer-section.tsx
│   ├── settings/
│   │   └── simple-list-manager.tsx
│   ├── shared/                    # Shared components
│   │   ├── delete-confirm-dialog.tsx
│   │   ├── labeled-field.tsx
│   │   ├── page-header.tsx
│   │   ├── table-pagination.tsx
│   │   ├── table-toolbar.tsx
│   │   └── sidebar-user-card.tsx
│   └── ui/                        # shadcn/ui components
├── db/
│   ├── index.ts                   # Neon serverless client
│   └── schema/
│       ├── auth.ts                # User/session/account/verification
│       ├── company.ts
│       ├── customer.ts
│       ├── product.ts
│       ├── category.ts
│       ├── unit.ts
│       ├── document.ts            # Has templateId + legacy type enum
│       └── index.ts
├── lib/
│   ├── auth/                      # Auth helpers
│   ├── pdf/                       # PDF rendering
│   │   ├── template-registry.ts   # SINGLE SOURCE OF TRUTH for templates
│   │   ├── template-props.ts      # PdfTemplateProps interface
│   │   ├── preset-config.ts       # Legacy title map
│   │   ├── pdf-helpers.ts
│   │   ├── pdf-styles.ts
│   │   ├── register-fonts.ts
│   │   └── templates/
│   │       ├── default-template.tsx         # Quotation layout
│   │       └── jesang-delivery-template.tsx  # Delivery order layout
│   ├── validations/               # Zod schemas
│   │   ├── company.schema.ts
│   │   ├── customer.schema.ts
│   │   ├── product.schema.ts
│   │   ├── category.schema.ts
│   │   ├── unit.schema.ts
│   │   └── document.schema.ts     # Has templateFields (Record)
│   ├── types/
│   │   ├── column-def.ts
│   │   └── document-data.ts       # DocumentData with templateFields
│   └── utils/
│       ├── cn.ts
│       ├── action-result.ts
│       ├── document-helpers.ts    # calculateTotal, formatCurrency, formatDate
│       ├── escape-like.ts
│       └── generate-id.ts
├── services/                      # Business logic
│   ├── company.service.ts
│   ├── customer.service.ts
│   ├── product.service.ts
│   ├── category.service.ts
│   ├── unit.service.ts
│   └── document.service.ts        # Uses templateId, not typeId
└── hooks/
    └── use-active-path.ts
```

### Deleted Files (no longer exist)

These files were removed during the merge-doctype-into-template refactor:
- `src/db/schema/document-type.ts` — replaced by template-registry.ts
- `src/services/document-type.service.ts` — no longer needed
- `src/actions/document-type.actions.ts` — no longer needed
- `src/components/documents/document-type-selector.tsx` — replaced by inline template selector
- `src/components/settings/document-type-column-editor.tsx` — columns now in registry
- `src/lib/constants/default-column-presets.ts` — columns now in registry
- `src/lib/validations/document-type.schema.ts` — no longer needed
- `src/services/stats.service.ts` — removed
- `src/components/layout/app-sidebar.tsx` — desktop sidebar removed

## Key Patterns

### Template Registry (CRITICAL)

`src/lib/pdf/template-registry.ts` is the **single source of truth** for all document type configuration. There is NO `document_type` database table.

**To add a new template:**
1. Add entry to `registry` array with: id, name, shortLabel, columns, showTotal, signatureLabels, color, extraFormFields
2. Point `component` to existing PDF template or create new one in `src/lib/pdf/templates/`
3. Add legacy type mapping if needed
4. That's it — UI auto-discovers templates from registry

**Current templates:** `quotation` (BG), `delivery-order` (PGH)

### DocumentData.templateFields

Template-specific extra fields (e.g. deliveryName, driverName) stored nested under `data.templateFields: Record<string, string>`. NOT as flat top-level fields. This prevents field pollution across templates.

### Per-Document Column Override

`data.columns?: ColumnDef[]` allows per-document column customization. Falls back to template defaults if not set.

### Document Number Generation

Format: `{shortLabel}-{year}-{sequence}` (e.g. BG-2026-001). Scoped per company. shortLabel from template registry.

## Data Flow: Creating a Document

```
User fills form → document-form.tsx (selects template, company, customer, items)
  ↓
buildPayload() → { companyId, templateId, customerName, items, templateFields, ... }
  ↓
createDocumentAction(payload) [server action]
  ↓
requireSession() → userId
  ↓
createDocumentSchema.safeParse() → validates including templateFields
  ↓
createDocument(userId, { companyId, templateId, data: { ...rest, items } })
  ↓
generateDocumentNumber(companyId, shortLabel) → "BG-2026-001"
  ↓
db.insert(document) with userId, companyId, templateId, type (legacy), data (JSONB)
  ↓
revalidatePath → UI refreshes
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (Neon format) |
| `BLOB_READ_WRITE_TOKEN` | @vercel/blob for file uploads |
| `BETTER_AUTH_SECRET` | better-auth session encryption |

## Common Tasks

### Add New Template
See "Template Registry" section above. Only modify `template-registry.ts` + optionally create PDF component.

### Add New Entity
1. Schema: `src/db/schema/{entity}.ts` with `userId`
2. Service: `src/services/{entity}.service.ts`
3. Actions: `src/actions/{entity}.actions.ts`
4. Validation: `src/lib/validations/{entity}.schema.ts`
5. Page: `src/app/(app)/{entities}/page.tsx`
6. Nav: `src/components/layout/nav-items.ts`
