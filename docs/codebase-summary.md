# Codebase Summary - Auto Quotation

Generated: 2026-03-03

## Overview

Auto Quotation is a Next.js 15 application for creating professional quotations. The codebase is organized around three main concerns: API routes, React components, and utility libraries. Total source files: 129 TypeScript/TSX files.

## Directory Structure

### `/src/app` - Next.js App Router (60 files)

**Route Organization:**

```
(dashboard)/ - Protected dashboard area
├── bao-gia/           - Quote management (list, create, edit)
├── san-pham/          - Product management
├── khach-hang/        - Customer management
├── cai-dat/           - Company settings
└── page.tsx           - Dashboard home

api/ - API endpoints
├── export/pdf/[quoteId]   - PDF generation endpoint
├── export/excel/[quoteId] - Excel generation endpoint
├── import/parse           - Excel file parsing
└── import/execute         - Excel data import execution

chia-se/[token] - Public share page for quotes
```

**Key Files:**
- `layout.tsx` - Root layout with navigation
- `(dashboard)/error.tsx` - Error boundary for dashboard
- `(dashboard)/page.tsx` - Dashboard overview

### `/src/components` - React Components (40 files)

**Component Organization:**

```
ui/ - Base shadcn/ui components (button, dialog, table, etc.)

dashboard/ - Dashboard-specific
├── dashboard-header.tsx
├── dashboard-sidebar.tsx
└── dashboard-stats.tsx

quote/ - Quote builder and display
├── quote-builder.tsx
├── quote-items-table.tsx
├── quote-preview.tsx
├── quote-settings-dialog.tsx
└── quote-actions.tsx

product/ - Product management
├── product-data-table.tsx
├── product-dialog.tsx
└── product-import-wizard.tsx

customer/ - Customer management
├── customer-data-table.tsx
├── customer-dialog.tsx
└── customer-page-client.tsx

settings/ - Company settings
├── settings-form.tsx
├── logo-uploader.tsx
└── settings-tabs.tsx

layout/ - Layout components
├── navbar.tsx
├── sidebar.tsx
└── main-layout.tsx
```

**Key Pattern:** Most pages use a `*-page-client.tsx` component for client-side logic (hooks, state) with server components handling data fetching.

### `/src/lib` - Utilities & Helpers (25 files)

**Functional Modules:**

| Module | Purpose | Key Functions |
|--------|---------|---|
| `db.ts` | Database client initialization | Creates Prisma client with Neon adapter |
| `pricing-engine.ts` | Price calculations | Tiered pricing, discounts, VAT, totals |
| `generate-pdf-quote.tsx` | PDF generation | @react-pdf/renderer templates |
| `generate-excel-quote.ts` | Excel export | ExcelJS workbook creation |
| `import-excel-parser.ts` | Excel parsing | Validates and parses product import files |
| `format-currency.ts` | Currency formatting | Formats numbers with VND notation |
| `format-number-to-words.ts` | Number to text | Converts amounts to Vietnamese words |
| `generate-quote-number.ts` | Quote numbering | Auto-generates unique quote numbers |
| `utils.ts` | General utilities | Class merging, type helpers |

**Validation Schemas (Zod):**
- `customer-schemas.ts` - Customer form validation
- `product-schemas.ts` - Product form validation
- `quote-schemas.ts` - Quote form validation
- `settings-schemas.ts` - Settings form validation

**Tests (`__tests__/`):**
- Unit tests for pricing engine, currency formatting, quote numbering
- Schema validation tests
- Import parser tests

### `/prisma` - Database (3 files)

- `schema.prisma` - Data model definition
- `seed.ts` - Database seeding (10 FPT Internet packages)
- `migrations/` - Database migration history

### `/public` - Static Assets

- `fonts/` - Roboto font variants for PDF rendering
  - Roboto-Regular.ttf
  - Roboto-Bold.ttf

## Key Patterns

### Server-Client Architecture

**Server Components (default):**
- Page components fetch data directly from database
- API routes handle data mutations
- Example: `src/app/(dashboard)/bao-gia/page.tsx`

**Client Components:**
- Use 'use client' directive for interactive features
- Contain forms, dialogs, tables with sorting/filtering
- Handle local state and user interactions
- Example: `src/components/quote/quote-items-table.tsx`

### Data Flow

```
1. Server Page Component
   ↓ (fetches data via Prisma)
2. Renders Server & Client Components
   ↓ (passes data as props)
3. Client Component
   ↓ (form submission via Server Action or API)
4. API Route / Server Action
   ↓ (database mutation)
5. Revalidation & UI Update
```

### Form Handling

**Stack:** React Hook Form + Zod + shadcn/ui

Pattern:
```tsx
// 1. Define Zod schema
const productSchema = z.object({
  name: z.string().min(1, "Name required"),
  // ...
});

// 2. React Hook Form with resolver
const form = useForm<z.infer<typeof productSchema>>({
  resolver: zodResolver(productSchema),
});

// 3. Submit via Server Action
async function onSubmit(data) {
  const result = await createProduct(data);
}
```

### Quote Calculation Flow

```
Quote Item Level:
- quantity × unitPrice = subtotal
- subtotal × (1 - discountPercent) = itemTotal

Quote Level:
- Sum all itemTotals = subtotal
- subtotal × (1 - globalDiscountPercent) = afterGlobalDiscount
- afterGlobalDiscount + shipping + otherFees = subtotalWithFees
- subtotalWithFees × (1 + vatPercent) = total
```

See `src/lib/pricing-engine.ts` for implementation.

## Database Schema Highlights

**Key Relationships:**

```
Settings (singleton)
├── (no relations, global config)

Category ──→ Product
Unit ──────→ Product
Product ────→ PricingTier (volume-based pricing)
         ────→ VolumeDiscount (quantity discounts)
         ────→ QuoteItem

Customer ──→ Quote
Product ──→ QuoteItem
Quote ─────→ QuoteItem (cascade delete)
```

**Pricing Flexibility:**

Products support:
- **Fixed pricing:** Single `basePrice`
- **Tiered pricing:** Multiple price points by quantity range (PricingTier)
- **Volume discounts:** Automatic discount application by quantity threshold

**Quote Denormalization:**

Quote stores snapshot of customer details:
- `customerName`, `customerCompany`, `customerPhone`, etc.
- Prevents data loss if customer record is deleted
- Maintains quote integrity for historical records

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration, external packages |
| `prisma.config.ts` | Prisma configuration (Neon adapter) |
| `components.json` | shadcn/ui component settings |
| `tailwind.config.js` | Tailwind CSS customization |
| `tsconfig.json` | TypeScript configuration |
| `eslint.config.mjs` | Linting rules |
| `postcss.config.mjs` | PostCSS plugins |

## Key Features Implementation

### Quote Builder (`src/components/quote/`)

- Drag-and-drop item reordering with @dnd-kit
- Add products from catalog or create custom items
- Inline editing of quantity, price, discounts
- Real-time total calculation
- Period selector for subscription-based services

### Excel Import (`src/lib/import-excel-parser.ts`)

Validates Excel files with columns:
- Product Code
- Product Name
- Category
- Unit
- Price
- Description (optional)

### PDF Export (`src/lib/generate-pdf-quote.tsx`)

Features:
- Company branding (logo, colors)
- Professional layout with sections
- Pricing breakdown table
- Signature blocks
- Footer with payment terms

### Email Integration (Phase 2 Roadmap)

Planned with Resend for:
- Quote notifications
- Share link delivery
- Status updates

## Testing

Tests located in `src/lib/__tests__/`:

```bash
pnpm test  # Run with Vitest
```

Coverage areas:
- Pricing calculations (engine edge cases)
- Currency & number formatting
- Schema validation
- Quote number generation
- Excel import parsing
- Customer/product/quote schemas

## Performance Considerations

**Database Optimizations:**
- Indexes on frequently queried columns (productId, customerId, quoteNumber)
- Neon serverless PostgreSQL for cost efficiency
- Connection pooling via Neon adapter

**Frontend Optimizations:**
- Image optimization with Next.js Image component
- Font preloading (Roboto for PDF)
- Server-side rendering for initial load
- Lazy loading of modals and dialogs

**Export Performance:**
- PDF generation happens server-side (avoids client memory issues)
- Excel generation uses streaming (ExcelJS)
- Both return file downloads immediately

## Security Notes

- **Share tokens:** Cryptographically random tokens for quote sharing
- **No authentication:** Phase 2 will add Better Auth
- **Server actions:** CSRF tokens built into Next.js
- **Input validation:** Zod schemas prevent invalid data

## Development Setup

**Required:**
- Node.js 18+
- pnpm package manager
- PostgreSQL database

**Optional:**
- Vercel account (for Blob storage and deployment)
- Prisma Studio (visual database editor)

See [README.md](../README.md) for detailed setup instructions.

## Module Statistics

- **Components:** 40+ reusable React components
- **API Routes:** 4 endpoint groups (PDF, Excel, Import)
- **Database Models:** 11 tables across 3 domains (Settings, Products, Quotes)
- **Utility Functions:** 25+ helper functions
- **Test Coverage:** 8+ test suites with 100+ test cases
- **Lines of Code:** ~15,000 LOC (excluding node_modules and generated files)

## Future Enhancements

As per Phase 2 roadmap:
- User authentication (Better Auth)
- Email notifications (Resend)
- Quote view tracking
- Advanced reporting
- Bulk quote operations
- API for third-party integrations
