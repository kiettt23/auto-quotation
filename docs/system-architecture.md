# System Architecture

## Overview

autoquotation is a Next.js 16 + PostgreSQL web application for managing business documents (quotations, warehouse exports, delivery orders). It implements a multi-company architecture where a single authenticated user manages multiple companies and generates professional PDF documents using a template registry.

**Key Technologies:**
- better-auth for authentication
- @react-pdf/renderer for PDF generation
- Drizzle ORM for type-safe database access
- Next.js Server Actions for backend logic

## Architecture Principles

- **User-Based Data Isolation**: All data (customers, products, categories, units, document types) scoped by `userId`
- **Company-Centric Documents**: Documents belong to a user and reference a specific company
- **CRUD Entity Model**: Companies managed via dedicated page with full CRUD operations
- **Type-Safe Database**: Drizzle ORM with PostgreSQL for schema management

## Data Model

### Core Tables

#### Users (`user`)
- Managed by authentication provider (e.g., Clerk)
- Root entity for data isolation

#### Companies (`company`)
- **Relationship**: One-to-Many (1 user → N companies)
- **Key Fields**:
  - `userId` — FK to user, defines ownership
  - `name`, `address`, `phone`, `taxCode`, `email` — company info
  - `bankName`, `bankAccount` — payment details
  - `logoUrl`, `headerLayout` — PDF rendering
  - `driverName`, `vehicleId` — delivery defaults
  - `deletedAt` — soft delete support

#### Customers (`customer`)
- **Relationship**: One-to-Many (1 user → N customers)
- **Key Fields**:
  - `userId` — FK to user, no longer filtered by company
  - `name`, `address`, `phone`, `email`, `taxCode` — contact info
  - `deliveryAddress`, `deliveryName` — auto-fill on documents
  - `receiverName`, `receiverPhone` — warehouse export data
  - `deletedAt` — soft delete support

#### Products (`product`)
- **Relationship**: One-to-Many (1 user → N products)
- **Key Fields**:
  - `userId` — FK to user
  - `name` — product name
  - `unit` — unit of measurement (FK to unit table)
  - `deletedAt` — soft delete support

#### Categories (`category`)
- **Relationship**: One-to-Many (1 user → N categories)
- **Key Fields**:
  - `userId` — FK to user
  - `name` — category name
  - `deletedAt` — soft delete support

#### Units (`unit`)
- **Relationship**: One-to-Many (1 user → N units)
- **Key Fields**:
  - `userId` — FK to user
  - `name` — unit label (e.g., "Cái", "Tấn", "Lít")
  - `shortLabel` — for document number generation (e.g., "C", "T", "L")
  - `deletedAt` — soft delete support

#### Document Types (`document_type`)
- **Relationship**: One-to-Many (1 user → N types)
- **Key Fields**:
  - `userId` — FK to user
  - `key` — identifier (e.g., "QUOTATION", "DELIVERY_ORDER")
  - `label` — display name (e.g., "Báo giá", "Phiếu giao hàng")
  - `pattern` — template regex for document numbers (e.g., "QUOTATION-{shortLabel}-{number}")
  - **Unique Constraint**: `(userId, key)` — one type per user per key

#### Documents (`document`)
- **Relationship**: Many-to-One (N documents → 1 company)
- **Key Fields**:
  - `userId` — FK to user (for filtering "my documents")
  - `companyId` — FK to company (which company issued the document)
  - `customerId` — FK to customer (optional, for linked documents)
  - `typeId` — FK to document_type (document category)
  - `documentNumber` — sequential ID
  - `data` — JSONB with form data (customer details, items, terms)
  - **Unique Constraint**: `(companyId, documentNumber)` — numbers scoped per company
  - `deletedAt` — soft delete support

## API Layer (Actions)

All server actions (`src/actions`) require `requireUserId()` authentication. Structure:

```
/actions
├── customer.actions.ts     — Customer CRUD
├── product.actions.ts      — Product CRUD
├── category.actions.ts     — Category CRUD
├── unit.actions.ts         — Unit CRUD
├── document-type.actions.ts — Document type CRUD
├── document.actions.ts     — Document CRUD + PDF generation
└── company.actions.ts      — Company CRUD
```

## Service Layer

Services in `src/services` handle business logic:

- **customer.service**: List, get, create, update, delete by userId
- **product.service**: List, get, create, update, delete by userId
- **category.service**: List, get, create, update, delete by userId
- **unit.service**: List, get, create, update, delete by userId
- **document-type.service**: List, get, create, update, delete by userId
- **document.service**:
  - `listDocuments(userId)` — filter by userId
  - `getDocumentById(documentId, userId)` — ownership check
  - `createDocument(userId, { companyId, ... })` — companyId from form
  - `generateDocumentNumber(companyId, typeId)` — scoped per company
- **company.service**:
  - `listCompanies(userId)` — all companies for user
  - `getCompanyById(companyId, userId)` — ownership check
  - `createCompany(userId, data)` — new company
  - `updateCompany(companyId, userId, data)` — modify company
  - `deleteCompany(companyId, userId)` — soft delete

## Pages & Routes

### App Layout (`(app)/layout.tsx`)
- Protects all routes with `requireUserId()`
- No CompanyProvider context (removed in refactor)
- Navigation bar with company selector (if companies exist)

### Home Page (`(app)/page.tsx`)
- Redirects to `/documents` (no separate dashboard)
- Users land directly on document list for quick access

### Companies (`(app)/companies/page.tsx`)
- List all companies for user
- Create, edit, delete operations
- Logo upload per company
- New navigation item "Công ty"

### Customers (`(app)/customers/page.tsx`)
- List all customers for user
- CRUD operations
- Delivery info (address, name, receiver)

### Products (`(app)/products/page.tsx`)
- List all products for user
- CRUD operations
- Category assignment

### Settings (`(app)/settings/page.tsx`)
- Document types (custom names/patterns)
- Categories (product grouping)
- Units (measurement units)
- **Removed**: Company info section (now at `/companies`)

### Documents

#### List (`(app)/documents/page.tsx`)
- List all documents for user
- Filter/search by customer, company, date range
- View, edit, delete, export to PDF

#### Create (`(app)/documents/new/page.tsx`)
- Company dropdown (first field, required)
- Auto-fill PDF header from company data
- Auto-fill customer info if selected
- Auto-fill delivery info from customer

#### Detail (`(app)/documents/[id]/page.tsx`)
- View document details
- Render PDF preview
- Link to edit page

#### Edit (Inline Panel)
- Edit documents via `document-detail-edit-panel.tsx`
- Rendered as inline panel in document detail view
- Prevent company/number change
- No separate /edit page

## Authentication & Authorization

### User Authentication
- Uses better-auth 1.5.5 with email/password strategy
- Session stored in database (managed by better-auth)
- `getSession()` helper in `src/lib/auth/get-session.ts`
- `requireUserId()` helper in `src/lib/auth/get-user-id.ts`
- App layout enforces auth redirect on protected routes

### Data Access Control
- All queries filtered by `userId` at database level
- Service functions perform ownership checks before returning data
- Users cannot access other users' data
- Company deletion is soft (deletedAt timestamp)
- Documents scoped by both `userId` and `companyId`

## PDF Generation

Uses @react-pdf/renderer with template registry pattern:

**Template System** (`src/lib/pdf/`)
- `template-registry.ts` — Registry of available templates (default, jesang-delivery)
- Each template is a React component receiving `PdfTemplateProps`
- Templates define optional `extraFormFields` and `itemColumns` for customization
- Lazy-loaded via `getTemplateComponent()` helper

**Rendering Flow**
1. Document form selects template type
2. Template registry loads matching component
3. Service calls template with document data
4. @react-pdf/renderer generates PDF in browser
5. User downloads via browser's download mechanism

**Current Templates**
- `DefaultTemplate` — Modern layout with header, customer section, items table, terms
- `JesangDeliveryTemplate` — Bilingual delivery order with custom columns and 5-signature section

## Migration from Tenant Model

Previous architecture used `companyId` as primary isolation. Changes:

| Aspect | Before | After |
|--------|--------|-------|
| Isolation key | `companyId` | `userId` (for most tables) |
| Company model | Single per user (1:1) | Multiple per user (1:N) |
| Document scoping | `(companyId, documentNumber)` | Same (documents still reference company) |
| User context | CompanyProvider context | Just userId from session |
| Auth check | requireCompanyId() | requireUserId() |
| Company CRUD | Settings page only | Dedicated `/companies` page |

## Key Flows

### Creating a Document
1. User selects company (dropdown)
2. User selects/creates customer
3. User fills items, terms, notes
4. Server action calls `document.service.createDocument(userId, { companyId, customerId, ... })`
5. Service generates documentNumber scoped by company
6. Document created with both userId and companyId

### Setting Up New Company
1. Navigate to `/companies` page
2. Click "Add Company"
3. Fill basic info: name, address, contact
4. Optional: upload logo, set driverName/vehicleId
5. Company created and available in document form

### Querying User Data
All queries follow pattern:
```typescript
// Example: Get user's customers
const customers = await customerService.listCustomers(userId);
// Filter applied in database: WHERE customer.user_id = $1
```

## Performance Considerations

- Indexes on `userId` columns for fast filtering
- Unique constraint on `(companyId, documentNumber)` for document lookups
- Unique constraint on `(userId, key)` for document types
- JSONB `data` column avoids N+1 queries for document fields

## Security

- All actions protected by `requireUserId()`
- No global admin functions (users see only their data)
- Soft deletes preserve audit trail
- No company cross-contamination in queries
