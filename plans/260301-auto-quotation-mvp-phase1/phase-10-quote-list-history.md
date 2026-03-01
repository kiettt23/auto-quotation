# Phase 10: Quote List & History

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Quote List](../reports/wireframes-auto-quotation.md#3-danh-sach-bao-gia)
- [Design System - Data Table](../reports/design-system-auto-quotation.md#6-data-table-pattern)
- [Design System - Status Badges](../reports/design-system-auto-quotation.md#1-color-palette)

## Overview

- **Priority:** P1 - Users need to find, manage, and act on past quotes
- **Status:** Pending
- **Effort:** 3h
- **Description:** Quote list page with data table, status/date/text filters, sorting, pagination, row actions (view, edit, clone, export, delete), and quote cloning.

## Key Insights

- Similar data table pattern as Products and Customers but with richer filtering (status + date range + text)
- Clone is a key feature: duplicate all items, reset to DRAFT, optionally change customer
- Status badge colors defined in design system
- Row actions menu has the most options of any table in the app
- Mobile: card layout (not table) for better touch experience
- Amounts use `tabular-nums` for alignment

## Requirements

### Functional
- Columns: Ma BG, Khach hang, Tong tien, Ngay, Trang thai (badge), Actions
- Filter bar: status dropdown (Tat ca, Nhap, Da gui, Chot don, Tu choi, Het han), date range (from/to), text search
- Server-side sorting by all columns
- Server-side pagination (20 per page)
- Row actions: Xem chi tiet, Chinh sua, Nhan ban, Xuat PDF, Xuat Excel, Xoa
- Clone: duplicate Quote + all QuoteItems, reset status to DRAFT, new quoteNumber, allow changing customer before save
- Delete: confirmation dialog
- Status change: dropdown or quick action to update status
- Quick filter from customer page: `?customer={id}` pre-filters

### Non-Functional
- URL-synced filters (status, dateFrom, dateTo, search, page, sort)
- Debounced search (300ms)
- Mobile card layout for < 768px

## Architecture

### Component Tree

```
src/app/(dashboard)/bao-gia/page.tsx (Server Component)
├── Parse search params for filters
├── Fetch quotes with filters + pagination
└── QuoteListPageClient
    ├── QuoteListToolbar
    │   ├── StatusFilter (Select)
    │   ├── DateRangeFilter (from/to with Calendar popover)
    │   ├── SearchInput (debounced)
    │   └── Button: [+ Tao bao gia]
    ├── QuoteDataTable (desktop)
    │   ├── Columns with sorting
    │   ├── Row actions dropdown
    │   └── Pagination
    ├── QuoteCardList (mobile < 768px)
    │   └── QuoteCard[] (compact card with status badge)
    └── CloneQuoteDialog (optional: customer selection for clone)
```

### Server Actions

```
src/app/(dashboard)/bao-gia/actions.ts (add to existing)
├── getQuotes({ page, pageSize, status, dateFrom, dateTo, search, customerId, sortBy, sortOrder })
│   └── Returns { quotes[] (with customer name), total, page, pageSize }
├── cloneQuote(quoteId, newCustomerId?)
│   └── Duplicate Quote + Items, new quoteNumber, DRAFT status
├── updateQuoteStatus(quoteId, status)
│   └── Update status field
└── deleteQuote(quoteId)
    └── Delete Quote + cascade QuoteItems
```

## Related Code Files

### Files to Create

```
src/
├── components/quote/
│   ├── quote-list-page-client.tsx       # Client wrapper
│   ├── quote-list-toolbar.tsx           # Filter bar
│   ├── quote-data-table.tsx             # TanStack Table for quotes
│   ├── quote-columns.tsx                # Column definitions
│   ├── quote-card-list.tsx              # Mobile card layout
│   ├── quote-card.tsx                   # Single quote card (mobile)
│   └── quote-status-badge.tsx           # Status badge with color mapping
```

### Files to Modify

```
src/app/(dashboard)/bao-gia/page.tsx     # Replace placeholder with real content
src/app/(dashboard)/bao-gia/actions.ts   # Add getQuotes, cloneQuote, deleteQuote
```

## Implementation Steps

1. **Build QuoteStatusBadge component**
   - Map status to badge colors per design system:
     - DRAFT: `bg-slate-100 text-slate-700` "Nhap"
     - SENT: `bg-blue-100 text-blue-700` "Da gui"
     - ACCEPTED: `bg-green-100 text-green-700` "Chot don"
     - REJECTED: `bg-red-100 text-red-700` "Tu choi"
     - EXPIRED: `bg-gray-100 text-gray-500` "Het han"

2. **Create getQuotes server action**
   - Complex Prisma query with:
     - `where`: status filter, date range (createdAt >= dateFrom, <= dateTo), text search (quoteNumber OR customerName ILIKE), customerId filter
     - `orderBy`: dynamic based on sortBy param
     - `skip/take` for pagination
     - `select`: id, quoteNumber, customerName, customerCompany, total, createdAt, status
   - Return typed result with total count

3. **Create cloneQuote server action**
   - Fetch original quote with all items
   - Generate new quoteNumber (from Settings)
   - Create new Quote with: status DRAFT, same items (new IDs), reset shareToken to null
   - If newCustomerId provided, update customer fields from that customer
   - Return new quote ID for navigation

4. **Create deleteQuote server action**
   - Delete QuoteItems first (cascade), then Quote
   - Revalidate path

5. **Build quote page.tsx** (server component)
   - Parse all URL search params: status, dateFrom, dateTo, search, customer, page, sort, order
   - Call getQuotes with parsed params
   - Render QuoteListPageClient

6. **Build QuoteListToolbar**
   - Status Select: "Tat ca trang thai" + all status options
   - Date range: two Popover + Calendar components (Tu ngay / Den ngay)
   - Search input with debounce
   - "+ Tao bao gia" button links to `/bao-gia/tao-moi`
   - All filters sync with URL params

7. **Build QuoteDataTable** (desktop)
   - Column definitions:
     - Ma BG: quoteNumber, sortable, `font-mono`
     - Khach hang: customerName + customerCompany subtitle
     - Tong tien: total formatted VND, `tabular-nums text-right`
     - Ngay: createdAt formatted DD/MM/YYYY, sortable
     - Trang thai: QuoteStatusBadge
     - Actions: DropdownMenu
   - Row actions:
     - "Xem chi tiet" -> `/bao-gia/[id]` (read mode, future)
     - "Chinh sua" -> `/bao-gia/[id]` (edit mode)
     - "Nhan ban" -> cloneQuote action + navigate to new quote
     - "Xuat PDF" -> `/api/export/pdf/[id]` (download)
     - "Xuat Excel" -> `/api/export/excel/[id]` (download)
     - "Xoa" -> AlertDialog + deleteQuote action

8. **Build QuoteCardList** (mobile)
   - Visible only on < 768px (`md:hidden`)
   - Each QuoteCard: quoteNumber + status badge (top), customerName (middle), total + date (bottom), actions menu
   - Match wireframe mobile quote list layout

9. **Handle clone flow**
   - Click "Nhan ban": call cloneQuote server action
   - Navigate to `/bao-gia/[newId]` (edit mode)
   - Toast: "Da nhan ban bao gia"
   - User can then edit customer, items, and save

## Todo List

- [ ] Build QuoteStatusBadge component with color mapping
- [ ] Create getQuotes server action with all filters
- [ ] Create cloneQuote server action
- [ ] Create updateQuoteStatus server action
- [ ] Create deleteQuote server action
- [ ] Build quote page.tsx (server component with filter parsing)
- [ ] Build QuoteListToolbar with status, date range, search filters
- [ ] Build QuoteDataTable with all columns and row actions
- [ ] Build QuoteCardList for mobile layout
- [ ] Wire up clone flow (clone + navigate to edit)
- [ ] Wire up delete with confirmation dialog
- [ ] Wire up PDF/Excel export links
- [ ] Test: filter by status, date range, search text
- [ ] Test: clone quote and verify items duplicated

## Success Criteria

- Quote list displays all quotes with correct formatting
- Status badges show correct colors per design system
- Filters: status, date range, text search all work correctly
- Filters sync with URL (bookmarkable, refreshable)
- Sorting works on all sortable columns
- Pagination works (20 per page)
- Clone: creates new draft quote with all items duplicated
- Delete: confirms then removes quote
- Export: PDF and Excel download correctly
- Mobile: card layout displays correctly on small screens

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex filter query performance | Slow list | Add DB indexes on status, createdAt, customerName; server-side pagination |
| Date range filter timezone issues | Wrong results | Use UTC dates consistently; parse with date-fns |
| Clone large quote (50+ items) | Timeout | Transaction should handle; test with large quotes |

## Next Steps

- Phase 11: Dashboard shows recent quotes (reuses QuoteStatusBadge, similar table)
- Phase 12: Empty states, loading skeletons for this page
