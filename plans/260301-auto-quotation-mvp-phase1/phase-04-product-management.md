# Phase 04: Product Management

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Product List](../reports/wireframes-auto-quotation.md#5-quan-ly-san-pham)
- [Wireframe - Product Dialog](../reports/wireframes-auto-quotation.md#6-dialog-themsua-san-pham)
- [Design System - Data Table](../reports/design-system-auto-quotation.md#6-data-table-pattern)

## Overview

- **Priority:** P1 - Products are the core data for quotes
- **Status:** Pending
- **Effort:** 5h
- **Description:** Product catalog CRUD with data table, category filtering, search, pagination, and add/edit dialog supporting fixed pricing, tiered pricing, and volume discounts.

## Key Insights

- Product code is unique - used for import upsert matching
- Two pricing models: FIXED (single basePrice) or TIERED (PricingTier rows with min/max quantity ranges)
- Volume discounts are independent from pricing type - apply to both FIXED and TIERED
- Tiered pricing: user defines ranges (1-5: 4.2M, 6-20: 3.9M, 21+: 3.6M)
- Volume discount: user defines thresholds (10+ qty: 5%, 50+ qty: 10%)
- Data table uses TanStack Table (via shadcn data-table pattern)
- Server-side pagination (20 per page) to handle potentially 300+ products

## Requirements

### Functional
- Product list with columns: Ma, Ten san pham, Danh muc, Gia ban, DVT, Actions
- Filter by category (dropdown) + text search (name, code)
- Server-side pagination (20 per page)
- Column sorting (at minimum: name, category, price)
- Add product: dialog with code, name, category, unit, description, pricing type + pricing config, volume discounts, notes
- Edit product: same dialog, pre-filled
- Delete product: confirmation dialog, check if used in any QuoteItem
- Row actions dropdown: Edit, Delete

### Non-Functional
- Debounced search (300ms)
- URL-synced filters (category, search, page) for shareable/bookmarkable state
- Responsive: table on desktop, card layout on mobile (optional for MVP - table with horizontal scroll acceptable)

## Architecture

### Component Tree

```
src/app/(dashboard)/san-pham/page.tsx (Server Component)
├── Fetches products with pagination, filters
├── Fetches categories for filter dropdown
└── ProductPageClient
    ├── ProductToolbar
    │   ├── CategoryFilter (Select dropdown)
    │   ├── SearchInput (debounced)
    │   └── Buttons: [Import Excel] [+ Them san pham]
    ├── ProductDataTable (TanStack Table)
    │   ├── Columns: code, name, category, price, unit, actions
    │   ├── Row actions: Edit, Delete
    │   └── Pagination controls
    └── ProductDialog (Add/Edit)
        ├── BasicInfoFields (code, name, category, unit, description)
        ├── PricingTypeSelector (radio: FIXED | TIERED)
        ├── FixedPriceInput (if FIXED)
        ├── TieredPricingTable (if TIERED - dynamic rows)
        ├── VolumeDiscountTable (dynamic rows)
        └── NotesField
```

### Server Actions

```
src/app/(dashboard)/san-pham/actions.ts
├── getProducts({ page, pageSize, categoryId, search, sortBy, sortOrder })
│   └── Returns { products[], total, page, pageSize }
├── createProduct(data)
│   └── Creates Product + PricingTiers + VolumeDiscounts in transaction
├── updateProduct(id, data)
│   └── Updates Product, replaces PricingTiers + VolumeDiscounts in transaction
└── deleteProduct(id)
    └── Checks QuoteItem references, soft-block if used
```

## Related Code Files

### Files to Create

```
src/
├── app/(dashboard)/san-pham/
│   ├── page.tsx                         # Server component with data fetching
│   └── actions.ts                       # Server Actions for product CRUD
├── components/product/
│   ├── product-page-client.tsx          # Client wrapper for product page
│   ├── product-toolbar.tsx              # Filter bar + action buttons
│   ├── product-data-table.tsx           # TanStack Table for products
│   ├── product-columns.tsx              # Column definitions
│   ├── product-dialog.tsx               # Add/Edit dialog form
│   ├── tiered-pricing-fields.tsx        # Dynamic rows for tiered pricing
│   └── volume-discount-fields.tsx       # Dynamic rows for volume discounts
└── lib/validations/
    └── product-schemas.ts               # Zod schemas for product forms
```

## Implementation Steps

1. **Define zod schemas** (`src/lib/validations/product-schemas.ts`)
   ```typescript
   pricingTierSchema = z.object({
     minQuantity: z.number().int().min(1),
     maxQuantity: z.number().int().min(1).nullable(), // null = infinity
     price: z.number().min(0),
   })

   volumeDiscountSchema = z.object({
     minQuantity: z.number().int().min(1),
     discountPercent: z.number().min(0).max(100),
   })

   productSchema = z.object({
     code: z.string().min(1, "Ma san pham bat buoc"),
     name: z.string().min(1, "Ten san pham bat buoc"),
     categoryId: z.string().min(1, "Chon danh muc"),
     unitId: z.string().min(1, "Chon don vi tinh"),
     description: z.string().optional(),
     notes: z.string().optional(),
     pricingType: z.enum(["FIXED", "TIERED"]),
     basePrice: z.number().min(0).optional(), // required if FIXED
     pricingTiers: z.array(pricingTierSchema).optional(), // required if TIERED
     volumeDiscounts: z.array(volumeDiscountSchema).optional(),
   })
   ```

2. **Create Server Actions** (`src/app/(dashboard)/san-pham/actions.ts`)
   - `getProducts`: Prisma query with `where` (categoryId, name/code contains search), `orderBy`, `skip/take` for pagination. Include category and unit relations.
   - `createProduct`: Validate schema, check code uniqueness, create Product with nested `pricingTiers.create` and `volumeDiscounts.create`
   - `updateProduct`: Validate, check code uniqueness (exclude self), use transaction: delete old tiers/discounts, update product, create new tiers/discounts
   - `deleteProduct`: Check if any QuoteItem references this productId; if yes, return error with count of quotes using it

3. **Build product page** (`src/app/(dashboard)/san-pham/page.tsx`)
   - Read search params: `page`, `category`, `search`, `sort`, `order`
   - Call `getProducts` with parsed params
   - Fetch all categories for filter dropdown
   - Render ProductPageClient with data

4. **Build ProductToolbar**
   - Category dropdown (shadcn Select): "Tat ca danh muc" default + category list
   - Search input with Search icon, debounced 300ms, updates URL params
   - "Import Excel" button (navigates to Phase 05 wizard)
   - "+ Them san pham" button (opens ProductDialog in create mode)
   - Use `useRouter()` + `useSearchParams()` to sync filters with URL

5. **Build ProductDataTable with TanStack Table**
   - Define columns (`product-columns.tsx`):
     - Ma: sortable, `font-mono text-sm`
     - Ten san pham: sortable, show description as subtitle if exists
     - Danh muc: category.name badge
     - Gia ban: formatted VND, show "Bac thang" label if TIERED
     - DVT: unit.name
     - Actions: DropdownMenu with Edit, Delete
   - Server-side pagination: prev/next buttons + page numbers
   - Page size fixed at 20

6. **Build ProductDialog**
   - Dialog (shadcn) with ScrollArea for long form
   - react-hook-form with zodResolver(productSchema)
   - Basic fields: code, name, category (Select), unit (Select), description (Textarea)
   - Pricing type: RadioGroup ("Gia co dinh" / "Gia bac thang")
   - Conditional rendering:
     - FIXED: single price Input (formatted VND)
     - TIERED: TieredPricingFields component
   - VolumeDiscountFields component (always available)
   - Notes textarea
   - Submit: calls createProduct or updateProduct based on mode

7. **Build TieredPricingFields**
   - useFieldArray for dynamic rows
   - Each row: minQuantity (Input), maxQuantity (Input, empty = unlimited), price (Input)
   - Add row button, remove row button per row
   - Validate: ranges must not overlap, must cover from 1

8. **Build VolumeDiscountFields**
   - useFieldArray for dynamic rows
   - Each row: minQuantity (Input), discountPercent (Input with % suffix)
   - Add row button, remove row button per row
   - Validate: thresholds must be ascending

9. **Format price display**
   - Use `formatCurrency` from Phase 07 (or inline helper initially)
   - Show VND with dot separator: 5.500.000

## Todo List

- [ ] Define zod schemas for product, pricing tiers, and volume discounts
- [ ] Create getProducts server action with filtering, sorting, pagination
- [ ] Create createProduct server action with nested pricing tiers/discounts
- [ ] Create updateProduct server action with transaction-based tier replacement
- [ ] Create deleteProduct server action with reference checking
- [ ] Build product page.tsx (server component)
- [ ] Build ProductToolbar with category filter, search, action buttons
- [ ] Build ProductDataTable with TanStack Table columns and pagination
- [ ] Build ProductDialog for add/edit with pricing type toggle
- [ ] Build TieredPricingFields with dynamic rows
- [ ] Build VolumeDiscountFields with dynamic rows
- [ ] Wire up URL-synced filters and pagination
- [ ] Test CRUD: create with fixed/tiered pricing, edit, delete, search, filter

## Success Criteria

- Product list displays with all columns, formatted prices
- Category filter narrows results correctly
- Search finds products by name and code
- Pagination works (20 per page, prev/next navigation)
- Add product: creates with FIXED price or TIERED pricing tiers
- Add product: creates with volume discounts
- Edit product: pre-fills all fields including tiers and discounts
- Delete product: confirms, blocks if used in quotes
- Form validation shows inline errors for required fields

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| TanStack Table complexity | Slow to implement | Use shadcn data-table example as starting point |
| Dynamic form fields (tiers) complex | Buggy UX | Use react-hook-form useFieldArray; test with 1, 2, 5 tiers |
| Product code uniqueness check | Race condition | Use Prisma unique constraint; handle error gracefully |
| Large product count (300+) | Slow initial load | Server-side pagination already planned |

## Next Steps

- Phase 05: Excel Import Wizard creates products via the same createProduct action
- Phase 08: Quote Builder searches products from this catalog
