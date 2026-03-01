# Phase 08: Quote Builder (Core Screen)

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Quote Builder](../reports/wireframes-auto-quotation.md#4-quote-builder---tao-bao-gia-core-screen)
- [Wireframe - Product Search Command](../reports/wireframes-auto-quotation.md#4-quote-builder---tao-bao-gia-core-screen)
- [Wireframe - Mobile Quote Builder](../reports/wireframes-auto-quotation.md#12-mobile-views-375px)
- [Design System - Quote Builder Responsive](../reports/design-system-auto-quotation.md#3-spacing--layout)

## Overview

- **Priority:** P0 - THE core screen, the entire app's value proposition
- **Status:** Pending
- **Effort:** 8h
- **Description:** Split-view quote creation screen with customer selection, product search (command palette), inline-editable items table with drag-to-reorder, pricing summary with real-time calculations, and save as draft.

## Key Insights

- Most complex screen - deserves the most effort and careful planning
- Split-view: form (55%) left + live preview (45%) right on desktop; tab switch on mobile
- Product search uses shadcn Command component (Ctrl+K) with fuzzy search, grouped by category
- Items table: inline editable quantity, unit price (pre-filled but overridable), discount %
- @dnd-kit/sortable for drag-to-reorder items
- All calculations happen client-side in real-time using pricing-engine from Phase 07
- Custom line items: user can add rows without linking to a product (manual name/price)
- Form managed with react-hook-form + useFieldArray for items array
- Save creates/updates Quote + QuoteItems in single transaction

## Requirements

### Functional
- **Customer section:** Search existing customers (Command) OR fill new customer fields inline
- **Product search:** Command palette (Ctrl+K), fuzzy search, grouped by category, show price
- **Items table:**
  - Columns: drag handle, product name, unit, quantity (input), unit price (input), discount % (input), line total (calculated)
  - Drag-to-reorder via @dnd-kit/sortable
  - Add product from search (auto-fills name, unit, price)
  - Add custom line item (manual entry)
  - Remove item on hover/click
  - Inline edit: quantity, unit price, discount %
- **Summary section:** Global discount %, VAT %, shipping fee, other fees (with label input)
- **Terms & conditions:** Textarea pre-filled from Settings defaults
- **Validity date:** Date picker, default = today + Settings.defaultValidityDays
- **Actions:** "Luu nhap" saves as DRAFT
- **Real-time calculation:** All totals update instantly as user changes any value
- **Edit mode:** Navigate to `/bao-gia/[id]` to edit existing quote, pre-fill all fields
- **Customer pre-fill:** If `?customerId=X` in URL, auto-select that customer

### Non-Functional
- Smooth drag-and-drop (no jank)
- Debounced product search (300ms)
- Form preserves state during session (no accidental loss)
- Save completes within 2 seconds

## Architecture

### Component Tree

```
src/app/(dashboard)/bao-gia/tao-moi/page.tsx (Server Component)
├── Fetch Settings defaults, categories
└── QuoteBuilderPage (Client Component)
    ├── QuoteBuilderForm (left panel, 55%)
    │   ├── CustomerSection
    │   │   ├── CustomerSearchCommand (search existing)
    │   │   └── CustomerInlineFields (name, company, phone, email)
    │   ├── QuoteItemsSection
    │   │   ├── ProductSearchCommand (Ctrl+K overlay)
    │   │   ├── SortableItemsList (@dnd-kit)
    │   │   │   └── QuoteItemRow[] (inline editable)
    │   │   └── AddButtons: [+ Them SP] [+ Them dong tuy chinh]
    │   ├── QuoteSummaryInputs
    │   │   ├── GlobalDiscountInput
    │   │   ├── VatInput
    │   │   ├── ShippingFeeInput
    │   │   └── OtherFeesInput (amount + label)
    │   ├── TermsSection (textarea)
    │   ├── ValidityDatePicker
    │   └── ActionButtons: [Luu nhap]
    └── QuotePreviewPanel (right panel, 45%)
        └── QuotePreview (Phase 09 component, rendered here)

src/app/(dashboard)/bao-gia/[id]/page.tsx (Server Component)
├── Fetch Quote with items, customer
└── Same QuoteBuilderPage with pre-filled data
```

### State Management (react-hook-form)

```typescript
type QuoteFormValues = {
  // Customer
  customerId: string | null
  customerName: string
  customerCompany: string
  customerPhone: string
  customerEmail: string
  customerAddress: string

  // Items (useFieldArray)
  items: {
    productId: string | null
    name: string
    description: string
    unit: string
    quantity: number
    unitPrice: number
    discountPercent: number
    lineTotal: number    // calculated
    isCustomItem: boolean
    sortOrder: number
  }[]

  // Summary
  globalDiscountPercent: number
  vatPercent: number
  shippingFee: number
  otherFees: number
  otherFeesLabel: string

  // Metadata
  notes: string
  terms: string
  validUntil: Date
}
```

### Server Actions

```
src/app/(dashboard)/bao-gia/actions.ts
├── saveQuote(formData, quoteId?: string)
│   └── Transaction: upsert Quote + delete old items + create items
│       Auto-generate quoteNumber if new, increment Settings.quoteNextNumber
├── getQuoteForEdit(quoteId)
│   └── Return Quote with items, ordered by sortOrder
├── searchProducts(query: string)
│   └── Fuzzy search products, group by category, return with pricing
└── searchCustomers(query: string)
    └── Search customers by name/company
```

## Related Code Files

### Files to Create

```
src/
├── app/(dashboard)/bao-gia/
│   ├── tao-moi/page.tsx                 # New quote page (server component)
│   ├── [id]/page.tsx                    # Edit quote page (server component)
│   └── actions.ts                       # Server Actions for quote operations
├── components/quote/
│   ├── quote-builder-page.tsx           # Main builder layout (client)
│   ├── customer-section.tsx             # Customer search + inline fields
│   ├── customer-search-command.tsx      # Command palette for customer search
│   ├── product-search-command.tsx       # Command palette for product search (Ctrl+K)
│   ├── quote-items-section.tsx          # Items table wrapper with dnd-kit
│   ├── sortable-quote-item-row.tsx      # Single sortable item row
│   ├── quote-summary-inputs.tsx         # Discount, VAT, shipping, other fees
│   ├── quote-totals-display.tsx         # Calculated totals display
│   ├── terms-section.tsx                # Terms textarea
│   └── validity-date-picker.tsx         # Date picker for valid until
└── lib/
    ├── hooks/
    │   └── use-quote-calculations.ts    # Hook that runs pricing engine on form values
    └── validations/
        └── quote-schemas.ts             # Zod schema for quote form
```

## Implementation Steps

1. **Define zod schema** (`src/lib/validations/quote-schemas.ts`)
   - quoteItemSchema: name required, quantity min 1, unitPrice min 0, discountPercent 0-100
   - quoteSchema: at least 1 item, customerName or customerId required, validUntil required

2. **Create Server Actions** (`src/app/(dashboard)/bao-gia/actions.ts`)
   - `saveQuote`: Validate form data. If new quote: generate quoteNumber from Settings, increment nextNumber. Use pricing engine to compute totals server-side (source of truth). Create/update Quote in transaction with all QuoteItems. If customerId provided, link customer; if new customer data, optionally create Customer record. Revalidate paths.
   - `getQuoteForEdit`: Fetch Quote with items (ordered by sortOrder) + linked product data for each item
   - `searchProducts`: `WHERE name ILIKE %query% OR code ILIKE %query%`, include category, pricingTiers, unit. Limit 20 results.
   - `searchCustomers`: `WHERE name ILIKE %query% OR company ILIKE %query%`. Limit 10 results.

3. **Build tao-moi/page.tsx** (new quote)
   - Fetch Settings (defaults for VAT, terms, validity)
   - If `?customerId` in search params, fetch that customer
   - Render QuoteBuilderPage with defaults

4. **Build [id]/page.tsx** (edit quote)
   - Fetch quote with `getQuoteForEdit`
   - Transform to form values format
   - Render QuoteBuilderPage with existing data

5. **Build QuoteBuilderPage** (main client component)
   - Initialize react-hook-form with default values or existing quote data
   - Split layout: desktop 55%/45% grid, mobile single column with tab switch
   - Tab switch on mobile: "Nhap lieu" | "Xem truoc" (use state toggle)

6. **Build CustomerSection**
   - Command-based search for existing customers
   - On select: fill customerId + all customer fields (read-only)
   - "Xoa" button to clear selection and switch to manual entry
   - Manual entry: editable inputs for name, company, phone, email
   - If `customerId` provided via URL, auto-select on mount

7. **Build ProductSearchCommand**
   - CommandDialog (overlay, triggered by Ctrl+K or button click)
   - Search input with debounced server action call
   - Results grouped by category (`CommandGroup`)
   - Each result: product name + price + unit
   - On select: add to items array with pre-filled name, unit, unitPrice (from pricing engine for qty 1), discountPercent 0, quantity 1
   - "Khong thay? + Them san pham moi" link at bottom

8. **Build QuoteItemsSection with @dnd-kit/sortable**
   - DndContext + SortableContext wrapping item rows
   - Each row is a SortableQuoteItemRow (useSortable hook)
   - On drag end: reorder items array, update sortOrder values
   - "Them san pham" button: opens ProductSearchCommand
   - "Them dong tuy chinh" button: appends blank row with isCustomItem=true

9. **Build SortableQuoteItemRow**
   - Drag handle (GripVertical icon)
   - Product name (text, editable if custom item)
   - Unit (text, editable if custom item)
   - Quantity input (number, min 1)
   - Unit price input (formatted VND, editable - auto-filled from product but overridable)
   - Discount % input (number, 0-100)
   - Line total (calculated, read-only, formatted VND)
   - Remove button (Trash2 icon, visible on hover)
   - When quantity changes: recalculate unitPrice if product has tiered pricing

10. **Build useQuoteCalculations hook**
    - Watch form values (items, globalDiscount, vat, shipping, otherFees)
    - Run `calculateLineTotal` for each item
    - Run `calculateQuoteTotals` for summary
    - Return computed: `{ lineTotals[], subtotal, discountAmount, afterDiscount, vatAmount, total }`
    - Use `useMemo` or `useEffect` for performance

11. **Build QuoteSummaryInputs + QuoteTotalsDisplay**
    - Inputs: globalDiscountPercent, vatPercent, shippingFee, otherFees + otherFeesLabel
    - Display: Tam tinh, Chiet khau, Sau CK, VAT, Phi van chuyen, Phi khac, TONG CONG
    - All amounts formatted with `formatCurrency`
    - Total in bold, larger font (`text-xl font-bold tabular-nums`)

12. **Build TermsSection**
    - Textarea pre-filled from Settings.defaultTerms
    - User can edit per-quote

13. **Build ValidityDatePicker**
    - shadcn Calendar + Popover
    - Default: today + Settings.defaultValidityDays
    - Display formatted: DD/MM/YYYY

14. **Wire up save action**
    - "Luu nhap" button: validate form, call saveQuote server action
    - Show loading state on button
    - On success: toast "Da luu bao gia", redirect to `/bao-gia/[newId]` (edit mode)
    - On error: toast error message

## Todo List

- [ ] Define zod schema for quote form
- [ ] Create saveQuote server action with transaction
- [ ] Create getQuoteForEdit server action
- [ ] Create searchProducts and searchCustomers server actions
- [ ] Build tao-moi/page.tsx with defaults from Settings
- [ ] Build [id]/page.tsx for editing existing quotes
- [ ] Build QuoteBuilderPage with split-view layout (desktop) and tab switch (mobile)
- [ ] Build CustomerSection with search command + inline fields
- [ ] Build ProductSearchCommand (Ctrl+K, grouped by category)
- [ ] Build QuoteItemsSection with @dnd-kit/sortable
- [ ] Build SortableQuoteItemRow with inline editing
- [ ] Build useQuoteCalculations hook using pricing engine
- [ ] Build QuoteSummaryInputs + QuoteTotalsDisplay
- [ ] Build TermsSection with default pre-fill
- [ ] Build ValidityDatePicker with default from Settings
- [ ] Wire up save action with loading/success/error states
- [ ] Test: create new quote, add products, edit quantities, reorder, save
- [ ] Test: edit existing quote, modify items, save
- [ ] Test: customer pre-fill from URL param

## Success Criteria

- **New quote flow:** Open builder -> search customer -> add products via Ctrl+K -> adjust quantities/prices -> see real-time totals -> save as draft
- Items table correctly auto-fills price from product (respecting tiered pricing for quantity)
- Drag-and-drop reorders items smoothly
- Custom line items can be added and edited freely
- All totals calculate correctly in real-time (matches pricing engine tests)
- Global discount, VAT, shipping, other fees all affect total correctly
- Save creates Quote + QuoteItems in database
- Edit mode loads all existing data correctly
- Mobile: tab switch between form and preview works
- Customer pre-fill via URL param works

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| @dnd-kit complex setup | Drag-drop doesn't work | Follow dnd-kit sortable example closely; test early |
| react-hook-form + useFieldArray performance | Slow with many items | Keep re-renders minimal; use watch() selectively |
| Real-time calculation jank | Bad UX | Use useMemo; debounce if needed; pricing functions are pure and fast |
| Command palette product search latency | User waits | Debounce 300ms; show loading spinner; limit results to 20 |
| Form state loss on navigation | User loses work | Use beforeunload warning; consider localStorage draft |

## Security Considerations

- Server-side recalculation of totals on save (never trust client totals)
- Validate all input ranges (quantity > 0, discount 0-100, etc.)

## Next Steps

- Phase 09: QuotePreview component renders in the right panel of this builder
- Phase 10: Quote list links to this builder for editing
