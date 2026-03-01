# Phase 06: Customer Management

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Customer List](../reports/wireframes-auto-quotation.md#8-quan-ly-khach-hang)
- [Wireframe - Customer Dialog](../reports/wireframes-auto-quotation.md#9-dialog-themsua-khach-hang)

## Overview

- **Priority:** P2 - Needed before Quote Builder (customer selection)
- **Status:** Pending
- **Effort:** 3h
- **Description:** Customer CRUD with data table, search, pagination, and quick action to create a new quote for a customer.

## Key Insights

- Simpler than Product management - no complex pricing config
- Customer list shows quote count per customer (aggregate)
- Row action "Tao bao gia moi" navigates to quote builder with customer pre-filled via URL params
- Search across name, company, phone fields
- Phone and email are optional - many small customers contacted via Zalo, no email
- Component structure parallels Product management for consistency

## Requirements

### Functional
- Customer list: columns - Ten, Cong ty, Dien thoai, Email, So BG (quote count), Actions
- Text search across name, company, phone
- Server-side pagination (20 per page)
- Add customer dialog: name* (required), company, phone, email, address, notes
- Edit customer: same dialog, pre-filled
- Delete customer: confirmation, warn if has quotes
- Row actions: Edit, View quotes (filter quote list by customer), Create new quote, Delete

### Non-Functional
- Debounced search (300ms)
- URL-synced search and page params

## Architecture

### Component Tree

```
src/app/(dashboard)/khach-hang/page.tsx (Server Component)
├── Fetches customers with pagination, search, quote counts
└── CustomerPageClient
    ├── CustomerToolbar
    │   ├── SearchInput (debounced)
    │   └── Button: [+ Them khach hang]
    ├── CustomerDataTable
    │   ├── Columns: name, company, phone, email, quoteCount, actions
    │   ├── Row actions: Edit, View quotes, Create quote, Delete
    │   └── Pagination controls
    └── CustomerDialog (Add/Edit)
```

### Server Actions

```
src/app/(dashboard)/khach-hang/actions.ts
├── getCustomers({ page, pageSize, search })
│   └── Returns { customers[] (with _count.quotes), total, page, pageSize }
├── createCustomer(data)
├── updateCustomer(id, data)
└── deleteCustomer(id)
    └── Warn if has quotes, but allow deletion (quotes keep denormalized data)
```

## Related Code Files

### Files to Create

```
src/
├── app/(dashboard)/khach-hang/
│   ├── page.tsx                     # Server component with data fetching
│   └── actions.ts                   # Server Actions for customer CRUD
├── components/customer/
│   ├── customer-page-client.tsx     # Client wrapper
│   ├── customer-toolbar.tsx         # Search + add button
│   ├── customer-data-table.tsx      # TanStack Table for customers
│   ├── customer-columns.tsx         # Column definitions
│   └── customer-dialog.tsx          # Add/Edit dialog form
└── lib/validations/
    └── customer-schemas.ts          # Zod schemas
```

## Implementation Steps

1. **Define zod schema** (`src/lib/validations/customer-schemas.ts`)
   ```typescript
   customerSchema = z.object({
     name: z.string().min(1, "Nhap ten khach hang"),
     company: z.string().optional().default(""),
     phone: z.string().optional().default(""),
     email: z.string().email("Email khong hop le").optional().or(z.literal("")),
     address: z.string().optional().default(""),
     notes: z.string().optional().default(""),
   })
   ```

2. **Create Server Actions** (`src/app/(dashboard)/khach-hang/actions.ts`)
   - `getCustomers`: Prisma query with `where` (OR: name contains, company contains, phone contains), include `_count: { select: { quotes: true } }`, `orderBy: { updatedAt: 'desc' }`, skip/take
   - `createCustomer`: Validate, create, revalidate path
   - `updateCustomer`: Validate, update, revalidate path
   - `deleteCustomer`: Check quote count, warn user but allow (since quotes store denormalized customer data). Delete customer, set `customerId = null` on linked quotes.

3. **Build customer page** (`src/app/(dashboard)/khach-hang/page.tsx`)
   - Read search params: page, search
   - Fetch customers with getCustomers
   - Render CustomerPageClient

4. **Build CustomerToolbar**
   - Search input with icon, debounced 300ms
   - "+ Them khach hang" button opens CustomerDialog

5. **Build CustomerDataTable**
   - Column definitions:
     - Ten: name, sortable
     - Cong ty: company (show "-" if empty)
     - Dien thoai: phone
     - Email: email (show "-" if empty)
     - So BG: `_count.quotes` as badge
     - Actions: DropdownMenu
   - Row actions:
     - "Chinh sua" -> opens CustomerDialog in edit mode
     - "Xem bao gia" -> navigates to `/bao-gia?customer={id}`
     - "Tao bao gia moi" -> navigates to `/bao-gia/tao-moi?customerId={id}`
     - "Xoa" -> AlertDialog confirmation
   - Pagination: standard prev/next + page numbers

6. **Build CustomerDialog**
   - Dialog with form
   - Fields: name* (Input), company (Input), phone (Input), email (Input), address (Textarea), notes (Textarea)
   - Mode: "create" or "edit" (pre-fill form with existing data)
   - Submit: calls createCustomer or updateCustomer
   - Toast on success, close dialog, list refreshes

## Todo List

- [ ] Define zod schema for customer validation
- [ ] Create Server Actions (getCustomers, createCustomer, updateCustomer, deleteCustomer)
- [ ] Build customer page.tsx (server component)
- [ ] Build CustomerToolbar with search and add button
- [ ] Build CustomerDataTable with columns, row actions, pagination
- [ ] Build CustomerDialog for add/edit
- [ ] Wire up "Tao bao gia moi" action to navigate to quote builder with customer pre-fill
- [ ] Wire up "Xem bao gia" to navigate to quote list filtered by customer
- [ ] Test CRUD operations and search

## Success Criteria

- Customer list displays with all columns including quote count
- Search finds customers by name, company, phone
- Pagination works correctly
- Add customer creates and appears in list
- Edit customer updates correctly
- Delete customer shows confirmation, removes from list
- "Tao bao gia moi" navigates to quote builder with customerId in URL
- "Xem bao gia" navigates to quote list with customer filter

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Customer deletion with existing quotes | Orphaned quote references | Quotes store denormalized customer data; set customerId null on delete |
| Large customer list search performance | Slow search | Add DB index on name, company, phone; server-side search |

## Next Steps

- Phase 08: Quote Builder uses customer search/selection from this module
- Phase 10: Quote list can filter by customer
