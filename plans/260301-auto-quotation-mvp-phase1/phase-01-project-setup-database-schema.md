# Phase 01: Project Setup & Database Schema

## Context Links

- [Plan Overview](./plan.md)
- [Design System - File Structure](../reports/design-system-auto-quotation.md#12-file-structure-ui-related)
- [Brainstorm - Data Model](../reports/brainstorm-auto-quotation.md#5-data-model-high-level)

## Overview

- **Priority:** P1 - Foundation (blocks everything)
- **Status:** Pending
- **Effort:** 4h
- **Description:** Initialize Next.js 15 project, configure Prisma with Neon PostgreSQL, define complete database schema, install all UI dependencies, establish file structure.

## Key Insights

- Neon serverless requires `@neondatabase/serverless` driver + `@prisma/adapter-neon` for connection pooling
- Settings table is a singleton (single row) - use upsert pattern
- PricingTier and VolumeDiscount are separate models to support both pricing strategies independently
- Quote stores computed totals (subtotal, discountAmount, vatAmount, total) for fast reads; recalculated on save
- QuoteItem.productId is nullable to support custom line items

## Requirements

### Functional
- Next.js 15 project with TypeScript, Tailwind CSS, App Router, `src/` directory
- PostgreSQL database on Neon free tier with Prisma ORM
- Complete schema covering all MVP entities
- Seed data for default categories and units
- All shadcn/ui components installed and configured
- Design system colors applied to Tailwind config

### Non-Functional
- Type-safe database access via Prisma Client
- Connection pooling for serverless environment
- Schema supports future extensions (new fields) without breaking changes

## Architecture

### Database Schema (ERD)

```
Settings (singleton)
  ├── companyName, address, phone, email, taxCode, website
  ├── bankName, bankAccount, bankOwner
  ├── logoUrl
  ├── primaryColor, greetingText, defaultTerms
  ├── showAmountInWords, showBankInfo, showSignatureBlocks, showFooterNote
  ├── quotePrefix, quoteNextNumber, defaultVatPercent, defaultValidityDays, defaultShipping
  └── createdAt, updatedAt

Category (id, name, createdAt)
  └── products[]

Unit (id, name, createdAt)
  └── products[]

Product
  ├── id, code (unique), name, description, notes
  ├── categoryId -> Category
  ├── unitId -> Unit
  ├── basePrice (Decimal), pricingType (FIXED|TIERED)
  ├── pricingTiers[]
  ├── volumeDiscounts[]
  └── createdAt, updatedAt

PricingTier
  ├── id, productId -> Product
  ├── minQuantity, maxQuantity (nullable = infinity)
  └── price (Decimal)

VolumeDiscount
  ├── id, productId -> Product
  ├── minQuantity
  └── discountPercent (Decimal)

Customer
  ├── id, name, company, phone, email, address, notes
  └── createdAt, updatedAt

Quote
  ├── id, quoteNumber (unique), customerId -> Customer (nullable)
  ├── customerName, customerCompany, customerPhone, customerEmail, customerAddress
  ├── status (DRAFT|SENT|ACCEPTED|REJECTED|EXPIRED)
  ├── validUntil (DateTime)
  ├── globalDiscountPercent, vatPercent, shippingFee, otherFees, otherFeesLabel
  ├── notes, terms
  ├── shareToken (unique, nullable)
  ├── subtotal, discountAmount, vatAmount, total (all Decimal)
  ├── items[]
  └── createdAt, updatedAt

QuoteItem
  ├── id, quoteId -> Quote
  ├── productId -> Product (nullable for custom items)
  ├── sortOrder (Int)
  ├── name, description, unit
  ├── quantity (Int), unitPrice (Decimal), discountPercent (Decimal)
  ├── lineTotal (Decimal)
  └── isCustomItem (Boolean, default false)
```

**Design Decision:** Quote stores denormalized customer fields (customerName, customerCompany, etc.) so the quote snapshot is preserved even if customer data changes later. `customerId` is a soft reference for linking.

### Prisma Enums

```prisma
enum PricingType {
  FIXED
  TIERED
}

enum QuoteStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
}
```

## Related Code Files

### Files to Create

```
auto-quotation/
├── .env.example                    # DATABASE_URL template
├── .env.local                      # Actual Neon connection string (gitignored)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts              # Design system colors
├── tsconfig.json
├── package.json
├── prisma/
│   ├── schema.prisma               # Complete database schema
│   └── seed.ts                     # Seed categories + units + default settings
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Inter font, metadata)
│   │   ├── globals.css             # Tailwind + shadcn CSS variables
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── bao-gia/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tao-moi/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── san-pham/
│   │   │   │   └── page.tsx
│   │   │   ├── khach-hang/
│   │   │   │   └── page.tsx
│   │   │   └── cai-dat/
│   │   │       └── page.tsx
│   │   └── chia-se/
│   │       └── [token]/page.tsx
│   ├── components/
│   │   └── ui/                     # shadcn/ui components (auto-generated)
│   └── lib/
│       ├── db.ts                   # Prisma client singleton with Neon adapter
│       └── utils.ts                # cn() utility from shadcn
└── components.json                 # shadcn/ui config
```

## Implementation Steps

1. **Create Next.js project**
   ```bash
   npx create-next-app@latest auto-quotation --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

2. **Install core dependencies**
   ```bash
   npm install prisma @prisma/client @neondatabase/serverless @prisma/adapter-neon
   npm install zod react-hook-form @hookform/resolvers
   npm install @react-pdf/renderer exceljs @vercel/blob
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   npm install sonner lucide-react
   npm install -D @types/node tsx
   ```

3. **Initialize Prisma**
   ```bash
   npx prisma init --datasource-provider postgresql
   ```

4. **Create Neon database** - Go to neon.tech, create project, copy connection string

5. **Configure Prisma client singleton** (`src/lib/db.ts`)
   - Import `@neondatabase/serverless` Pool
   - Import `@prisma/adapter-neon` PrismaNeon
   - Use global singleton pattern for dev hot-reload

6. **Write schema.prisma** with all models per ERD above
   - Set `@@map` for snake_case table names
   - Add indexes on: Product.code, Quote.quoteNumber, Quote.shareToken, Quote.customerId, QuoteItem.quoteId

7. **Write seed.ts**
   - Default categories: Thiet bi mang, Thiet bi vien thong, Camera & Giam sat, Cap & Phu kien, Dich vu, Giai phap
   - Default units: Cai, Bo, Met, Cuon, Goi, Gio
   - Default Settings singleton with: quotePrefix "BG-{YYYY}-", defaultVatPercent 10, defaultValidityDays 30, primaryColor "#0369A1"

8. **Run migration**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

9. **Install shadcn/ui**
   ```bash
   npx shadcn@latest init
   ```
   Configure: New York style, Slate base, CSS variables enabled

10. **Install shadcn components**
    ```bash
    npx shadcn@latest add sidebar table dialog sheet command form input select button badge card tabs tooltip separator dropdown-menu alert-dialog popover calendar skeleton sonner textarea checkbox label scroll-area
    ```

11. **Configure Tailwind design system** in `tailwind.config.ts`
    - Primary: #0369A1, Accent: #F97316, Background: #F8FAFC
    - Add `tabular-nums` utility
    - Configure Inter font family

12. **Configure globals.css** with CSS variables matching design system report section 1

13. **Create placeholder page files** for all routes (empty components with route name)

14. **Create .env.example**
    ```
    DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
    BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
    ```

15. **Verify:** `npm run dev` starts without errors, Prisma Studio shows tables

## Todo List

- [ ] Create Next.js 15 project with TypeScript + Tailwind + App Router
- [ ] Install all npm dependencies (prisma, dnd-kit, react-pdf, exceljs, etc.)
- [ ] Initialize Prisma with Neon PostgreSQL adapter
- [ ] Write complete schema.prisma with all 9 models + enums + indexes
- [ ] Create Prisma client singleton (src/lib/db.ts) with Neon adapter
- [ ] Write seed.ts with default categories, units, and settings
- [ ] Run initial migration and seed
- [ ] Initialize shadcn/ui and install all required components
- [ ] Configure Tailwind with design system colors and typography
- [ ] Set up globals.css with CSS variables
- [ ] Create all route placeholder files per file structure
- [ ] Create .env.example
- [ ] Verify dev server starts cleanly

## Success Criteria

- `npm run dev` starts without errors
- `npx prisma studio` shows all 9 tables with correct columns
- Seed data present: 6 categories, 6 units, 1 settings row
- All shadcn/ui components importable
- Design system colors visible in CSS variables
- All route paths resolve (even if placeholder content)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Neon connection issues | Blocks all DB work | Test connection string immediately; have local PostgreSQL as fallback |
| Prisma + Neon adapter incompatibility | Schema migration fails | Pin compatible versions; check Prisma docs for Neon adapter |
| shadcn/ui version conflicts | Component install fails | Use latest shadcn CLI; resolve peer deps |

## Next Steps

- Phase 02: App Shell & Layout (depends on this phase for route structure and shadcn components)
- Phase 07: Pricing Engine (depends on schema types for Product, PricingTier, VolumeDiscount)
