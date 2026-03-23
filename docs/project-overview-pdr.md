# Project Overview

## What is autoquotation?

A web app for Vietnamese SMEs to create, manage, and export business documents (quotations, delivery orders) as professional PDFs. One user manages multiple companies, shared customers/products, and generates documents with company branding.

**Status:** Active Development (March 2026)
**Architecture:** User-centric, multi-company, template-driven

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1, React 19, TypeScript |
| UI | shadcn/ui 3.8.5, Tailwind CSS 4, radix-ui |
| Database | PostgreSQL 14+ (Neon serverless), Drizzle ORM 0.45.1 |
| Auth | better-auth 1.5.5 (email/password) |
| PDF | @react-pdf/renderer 4.3.2 |
| Storage | @vercel/blob |
| Validation | Zod 4 |
| Package Manager | pnpm |

## Core Features

### 1. Multi-Company Management
One user → N companies. Each company has its own branding (logo, header layout), contact info, and delivery defaults.

### 2. Document Management
- Create/edit/duplicate/delete documents
- Template-based: user selects template when creating (quotation or delivery order)
- Company-scoped sequential numbering (e.g. BG-2026-001)
- Auto-fill from customer and company data
- Per-document column customization
- Inline edit via detail panel (no separate edit page)

### 3. Template Registry (Single Source of Truth)
All document type config lives in code (`template-registry.ts`), NOT in database:
- Columns (ColumnDef[]) for form + PDF
- showTotal, signatureLabels, badge colors
- Extra form fields (stored in `data.templateFields`)
- PDF component reference

**Current templates:** Quotation (BG), Delivery Order (PGH)

### 4. PDF Generation
- @react-pdf/renderer generates PDFs client-side
- Company branding (logo, header layout)
- Template-specific layouts (DefaultTemplate, JesangDeliveryTemplate)
- Download via browser

### 5. Customer & Product Management
- User-scoped (shared across all companies)
- Customer: name, address, delivery info, receiver
- Product: name, unit, price, specification, category

### 6. Settings
- Categories (product grouping)
- Units (measurement units)
- No document type settings (handled by template registry)

## Data Model

### Tables (10)

| Table | Scope | Purpose |
|-------|-------|---------|
| `user` | Global | Auth root entity |
| `account`, `session`, `verification` | Global | better-auth managed |
| `company` | Per user | Business entities with branding |
| `customer` | Per user | Contact database |
| `product` | Per user | Saleable items |
| `category` | Per user | Product grouping |
| `unit` | Per user | Measurement units |
| `document` | Per user + company | Business documents (JSONB data) |

### Document JSONB Structure
```
data: {
  customerName, customerAddress, receiverName, receiverPhone,  // shared
  date, notes,                                                  // shared
  items: [{ productName, quantity, unitPrice, amount, ... }],  // shared
  templateFields: { deliveryName, driverName, vehicleId, ... }, // template-specific (NESTED)
  columns: [{ key, label, type, width, ... }]                  // per-doc override
}
```

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| No `document_type` table | Template registry in code = simpler, no DB sync needed |
| `templateFields` nested | Prevents field pollution across templates |
| Legacy `type` enum kept | Backward compat for existing data, maps to templateId |
| User-scoped data | Simpler than tenant model, covers SME use case |
| Client-side PDF | No server load, instant preview |
| Soft deletes | Audit trail, easy recovery |

## Key Flows

### Creating a Document
1. User selects company → auto-fills company defaults
2. User selects template (quotation/delivery) → loads columns + extra fields
3. User fills customer info (or selects from DB)
4. User adds items (or selects from products)
5. Submit → server validates → generates doc number → saves to DB
6. Redirects to PDF preview

### Adding a New Template
1. Add entry to `registry` array in `template-registry.ts`
2. Define: id, name, shortLabel, columns, showTotal, signatureLabels, color, extraFormFields
3. If new layout needed: create PDF component in `src/lib/pdf/templates/`
4. If existing layout works: point to `DefaultTemplate`
5. Done — UI auto-discovers from registry

## Constraints & Limitations

- **No team collaboration** — single user per account
- **No document versioning** — edits overwrite
- **Client-side PDF** — slow for large batch exports
- **2 templates only** — quotation + delivery order
- **No API** — UI only (no REST/GraphQL)
- **Staging DB only** — production needs separate setup

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (Neon) |
| `BLOB_READ_WRITE_TOKEN` | @vercel/blob for logos |
| `BETTER_AUTH_SECRET` | Session encryption |
