# Codebase Summary

## Project Overview

**autoquotation** is a Next.js 16 + PostgreSQL web application for managing business documents (quotations, warehouse exports, delivery orders). Users can manage multiple companies and generate PDF documents with professional templates.

**Tech Stack**:
- Frontend: Next.js 16.1, React 19, TypeScript, shadcn/ui 3.8.5
- Backend: Next.js Server Actions, TypeScript
- Database: PostgreSQL 14+ with Drizzle ORM 0.45.1
- Authentication: better-auth 1.5.5 (email/password)
- PDF Generation: @react-pdf/renderer 4.3.2 with template registry
- File Storage: @vercel/blob
- Styling: Tailwind CSS 4, radix-ui
- Validation: Zod 4

**Latest Major Change**: UI/UX Redesign (March 2026) + Multi-company refactor (March 2026)

## Directory Structure

```
src/
├── app/                           # Next.js app router
│   ├── (auth)/                    # Unprotected routes
│   │   ├── login/page.tsx         # Sign in page
│   │   ├── register/page.tsx      # Sign up page
│   │   └── layout.tsx             # Auth layout
│   ├── (app)/                     # Protected routes (require userId)
│   │   ├── layout.tsx             # App layout with AppHeader
│   │   ├── page.tsx               # Home → redirects to /documents
│   │   ├── loading.tsx            # Loading skeleton
│   │   ├── companies/             # Multi-company CRUD (master-detail)
│   │   │   ├── page.tsx           # Server component
│   │   │   └── company-page-client.tsx
│   │   ├── customers/             # Customer CRUD (master-detail)
│   │   │   ├── page.tsx
│   │   │   └── customer-page-client.tsx
│   │   ├── products/              # Product CRUD (master-detail)
│   │   │   ├── page.tsx
│   │   │   └── product-page-client.tsx
│   │   ├── documents/             # Document management
│   │   │   ├── page.tsx           # List documents with filters
│   │   │   ├── document-list-client.tsx
│   │   │   ├── document-detail-edit-panel.tsx
│   │   │   ├── new/page.tsx       # Create document
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # View document + PDF preview
│   │   │       └── document-detail-client.tsx
│   │   └── settings/              # Configuration page
│   │       ├── page.tsx
│   │       └── settings-page-client.tsx
│   ├── api/auth/[...all]/        # better-auth routes
│   ├── api/upload-logo/          # File upload handler
│   ├── onboarding/                # First-time user flow
│   └── layout.tsx                 # Root layout (Plus Jakarta Sans font)
├── actions/                       # Server actions
│   ├── customer.actions.ts
│   ├── product.actions.ts
│   ├── category.actions.ts
│   ├── unit.actions.ts
│   ├── document-type.actions.ts
│   ├── document.actions.ts
│   └── company.actions.ts
├── components/
│   ├── layout/                    # Layout components
│   │   ├── app-header.tsx         # Top header with user menu
│   │   ├── app-brand.tsx          # App logo
│   │   ├── app-sidebar.tsx        # Sidebar (if needed)
│   │   ├── mobile-bottom-nav.tsx  # Mobile navigation
│   │   └── nav-items.ts           # Navigation menu items
│   ├── documents/                 # Document-specific
│   │   ├── document-form.tsx
│   │   ├── document-items-table.tsx
│   │   ├── document-pdf-viewer.tsx
│   │   ├── document-pdf-download-button.tsx
│   │   ├── document-type-selector.tsx
│   │   └── document-customer-section.tsx
│   ├── settings/                  # Settings components
│   │   ├── simple-list-manager.tsx
│   │   └── document-type-column-editor.tsx
│   ├── shared/                    # Shared components
│   │   ├── delete-confirm-dialog.tsx
│   │   ├── labeled-field.tsx
│   │   ├── page-header.tsx
│   │   ├── table-pagination.tsx
│   │   ├── table-toolbar.tsx
│   │   └── sidebar-user-card.tsx
│   ├── customers/                 # Customer-specific
│   │   └── customer-table.tsx
│   ├── products/                  # Product-specific
│   │   └── product-table.tsx
│   └── ui/                        # shadcn/ui components
│       ├── alert-dialog.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── date-picker.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── db/
│   ├── index.ts                   # Neon serverless client
│   └── schema/
│       ├── auth.ts                # User table (better-auth)
│       ├── company.ts
│       ├── customer.ts
│       ├── product.ts
│       ├── category.ts
│       ├── unit.ts
│       ├── document-type.ts
│       ├── document.ts
│       └── index.ts
├── lib/
│   ├── auth/
│   │   ├── auth.ts                # better-auth config
│   │   ├── auth-client.ts         # Client auth helper
│   │   ├── get-session.ts         # Get current session
│   │   └── get-user-id.ts         # requireUserId() helper
│   ├── pdf/                       # PDF rendering
│   │   ├── pdf-helpers.ts
│   │   ├── pdf-styles.ts
│   │   ├── template-props.ts
│   │   ├── template-registry.ts   # Template loading
│   │   ├── register-fonts.ts
│   │   ├── preset-config.ts
│   │   └── templates/             # PDF templates
│   │       ├── default-template.tsx
│   │       └── jesang-delivery-template.tsx
│   ├── validations/               # Zod schemas
│   │   ├── company.schema.ts
│   │   ├── customer.schema.ts
│   │   ├── product.schema.ts
│   │   ├── category.schema.ts
│   │   ├── unit.schema.ts
│   │   ├── document-type.schema.ts
│   │   └── document.schema.ts
│   ├── constants/
│   │   └── default-column-presets.ts
│   ├── types/
│   │   ├── column-def.ts
│   │   └── document-data.ts
│   └── utils/
│       ├── cn.ts
│       ├── action-result.ts
│       ├── document-helpers.ts
│       ├── escape-like.ts
│       └── generate-id.ts
├── services/                      # Business logic
│   ├── company.service.ts
│   ├── customer.service.ts
│   ├── product.service.ts
│   ├── category.service.ts
│   ├── unit.service.ts
│   ├── document-type.service.ts
│   ├── document.service.ts
│   └── stats.service.ts           # Dashboard stats
├── hooks/
│   └── use-active-path.ts
├── .env.example                   # Environment template
└── .env.local                     # Local overrides (not committed)

drizzle/                           # Database migrations
└── {timestamp}_*.sql              # Auto-generated by drizzle-kit

```

## Key Files & Their Roles

### Database Schema (`src/db/schema/`)

All tables implement soft deletes (optional `deletedAt` field). Multi-company refactor added `userId` to most tables.

| File | Table | Key Change |
|------|-------|-----------|
| `auth.ts` | `user` | Root entity from auth provider |
| `company.ts` | `company` | Now `userId` (was `ownerId`), added `driverName`, `vehicleId`, `deletedAt` |
| `customer.ts` | `customer` | Added `userId`, removed `companyId`, added `deliveryName` |
| `product.ts` | `product` | Added `userId`, removed `companyId` |
| `category.ts` | `category` | Added `userId`, removed `companyId` |
| `unit.ts` | `unit` | Added `userId`, removed `companyId` |
| `document-type.ts` | `document_type` | Added `userId`, removed `companyId`, updated unique to `(userId, key)` |
| `document.ts` | `document` | Added `userId`, keeps `companyId` for document scoping |

### Services (`src/services/`)

Business logic layer between actions and database.

**Naming Convention**: `{entity}.service.ts` exports async functions:
- `list{Entity}s(userId)` — all records for user
- `get{Entity}ById(id, userId)` — single record with ownership check
- `create{Entity}(userId, data)` — new record
- `update{Entity}(id, userId, data)` — modify record
- `delete{Entity}(id, userId)` — soft delete

**Special Cases**:
- `document.service.generateDocumentNumber(companyId, typeId)` — scoped by company
- `pdf.service.renderDocument(documentId, userId)` — PDF generation

### Actions (`src/actions/`)

Server-side functions called from client components. All wrapped with `requireUserId()` for auth.

**Pattern**:
```typescript
export async function create{Entity}Action(formData: FormData) {
  const userId = await requireUserId();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const result = await service.create{Entity}(userId, parsed.data);
    revalidatePath(path);
    return { success: true, data: result };
  } catch (error) {
    return { error: message };
  }
}
```

### Pages (`src/app/(app)/`)

Protected routes requiring `requireUserId()`.

#### `/companies` — Company Management
- **page.tsx**: Server component, calls `listCompanies(userId)`
- **company-page-client.tsx**: Client search/state
- **company-table.tsx**: Table display, delete actions
- **company-dialog.tsx**: Create/edit form

#### `/{customers|products}/` — CRUD Pages
Similar structure:
- Server page fetches data
- Client page handles search, create/edit dialogs
- Table component with edit/delete buttons

#### `/documents/` — Document Management
- **page.tsx**: List with filters (company, date range, search)
- **new/page.tsx**: Create form with company dropdown (auto-fills company defaults)
- **[id]/page.tsx**: View document, render PDF preview
- **[id]/edit/page.tsx**: Modify document details

#### `/settings/` — Configuration
- Document type management (custom names, patterns)
- Category management
- Unit management
- **Removed**: Company info section (now in `/companies`)

### Validations (`src/lib/validations/`)

Zod schemas for form validation. Updated in refactor to reflect schema changes.

**Example - Company Schema**:
```typescript
const createCompanySchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  driverName: z.string().optional(),     // New in refactor
  vehicleId: z.string().optional(),      // New in refactor
  // ... other fields
});
```

## Data Flow Examples

### Creating a Document
```
User fills form → document-form.tsx
  ↓
submitDocumentAction(formData)  [server action]
  ↓
requireUserId() → get userId
  ↓
documentSchema.safeParse()
  ↓
document.service.createDocument(userId, { companyId, customerId, ... })
  ↓
db.insert(document).values({userId, companyId, ...})
  ↓
revalidatePath("/documents")
  ↓
success response → update UI
```

### Listing User's Customers
```
customers/page.tsx [server component]
  ↓
requireUserId() → get userId
  ↓
customer.service.listCustomers(userId)
  ↓
db.select().from(customer).where(eq(customer.userId, userId))
  ↓
returns [] customer[]
  ↓
Pass to CustomerListClient component
  ↓
Render table with edit/delete buttons
```

## Conversion Notes: Tenant → Multi-Company

Changes in March 2026 refactor:

### Before (Tenant Model)
- 1 user = 1 company (1:1)
- `requireCompanyId()` fetched single company
- `CompanyProvider` context distributed companyId
- Company managed in settings page only
- All data filtered by `companyId`

### After (Multi-Company Model)
- 1 user = N companies (1:N)
- `requireUserId()` just returns session.user.id
- No context provider (no single company)
- Company is full CRUD entity at `/companies`
- Most data filtered by `userId`, documents by both `userId` and `companyId`

### Migration Impact
- 7 database tables updated
- 7 service files refactored (companyId → userId)
- 14 action files updated
- 9 page files updated
- App layout simplified (removed CompanyProvider)
- 2 auth helper files deleted

## Environment Variables

Required in `.env` or `.env.local`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon format) |
| `BLOB_READ_WRITE_TOKEN` | @vercel/blob token for file uploads |
| `BETTER_AUTH_SECRET` | Secret key for better-auth session encryption |

## Building & Running

```bash
# Install dependencies
pnpm install

# Generate database types
npx drizzle-kit generate

# Push migrations (be careful with production!)
npx drizzle-kit push

# Run dev server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint
```

## Testing

Currently no automated tests. Recommend adding:
- Unit tests for services (using Jest)
- Integration tests for actions
- E2E tests for critical flows (using Playwright)

## Common Tasks

### Add a New Entity
1. Create schema in `src/db/schema/{entity}.ts` with `userId` field
2. Create service in `src/services/{entity}.service.ts`
3. Create actions in `src/actions/{entity}.actions.ts`
4. Create validation schema in `src/lib/validations/{entity}.schema.ts`
5. Create page in `src/app/(app)/{entities}/page.tsx`
6. Add nav item in `src/components/layout/nav-items.ts`

### Update Document Form
- Form component usually at `src/app/(app)/documents/new/page.tsx` or component
- Update validation in `src/lib/validations/document.schema.ts`
- Update action in `src/actions/document.actions.ts`
- May need to update PDF rendering in `src/services/pdf.service.ts`

### Add PDF Template
1. Create React component in `src/lib/pdf/templates/{name}-template.tsx`
2. Component receives `PdfTemplateProps` (document, company, template config)
3. Use @react-pdf/renderer components (Document, Page, View, Text, Image)
4. Register in `src/lib/pdf/template-registry.ts` with extra form fields
5. Template appears in document form type selector

### Add Company-Scoped Data
- Some data (like document numbers) is scoped by company, not just user
- Use `(companyId, fieldName)` unique constraints
- Filter queries with both `companyId` and `userId` when needed
