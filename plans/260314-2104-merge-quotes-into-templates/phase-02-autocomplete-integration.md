## Phase 2: Enhance Doc-Entry Form with Autocomplete

**Priority:** P1 | **Status:** pending | **Effort:** 3h

### Overview

The current doc-entry form (`doc-entry-form-page.tsx`) renders generic text/number/date inputs for placeholders and a simple table editor for rows. The Bao Gia preset needs product search autocomplete (for table rows) and customer search autocomplete (for customer placeholder fields). This phase adds a `dataSource` concept to preset definitions so the form can render smart autocomplete inputs.

### Key Insights

- Quote builder already has `quote-product-search.tsx` (combobox searching products table) and `quote-customer-section.tsx` (customer autocomplete populating 5 fields)
- These components are tightly coupled to quote form state — need to extract reusable autocomplete primitives
- Preset placeholders have `autoFill` for tenant settings; extend with `dataSource` for catalog lookup
- Doc-entry form currently uses `doc-entry-field-inputs.tsx` (fields) and `doc-entry-table-region-editor.tsx` (table rows)

### Requirements

**Functional:**
- When a preset placeholder has `dataSource: "customer"`, render customer autocomplete that populates related fields (name, company, phone, email, address)
- When a preset table column has `dataSource: "product"`, render product search autocomplete that fills name, description, unit, unitPrice
- Autocomplete queries existing products/customers APIs (server actions in their respective page actions)
- Fallback to manual input if no match selected

**Non-functional:**
- Reusable across any future preset that needs catalog data
- Debounced search (300ms) to avoid excessive DB queries

### Architecture

```
PresetPlaceholder.dataSource? -> "customer" | "product" | undefined
PresetTableColumn.dataSource? -> "product" | undefined

doc-entry-form-page detects dataSource -> renders autocomplete variant
```

### Related Code Files

**Modify:**
- `src/lib/preset-templates/types.ts` — add optional `dataSource` field to `PresetPlaceholder` and `PresetTableColumn`; add `linkedFields` map
- `src/lib/preset-templates/bao-gia-quotation-preset.ts` — add `dataSource: "customer"` to customerName placeholder with `linkedFields` mapping; add `dataSource: "product"` to item name column
- `src/components/doc-entry/doc-entry-field-inputs.tsx` — detect `dataSource` and render autocomplete combobox
- `src/components/doc-entry/doc-entry-table-region-editor.tsx` — detect `dataSource` on column and render product search combobox in that cell

**Create:**
- `src/components/shared/customer-autocomplete-combobox.tsx` — extracted from `quote-customer-section.tsx`, generic combobox returning customer record
- `src/components/shared/product-autocomplete-combobox.tsx` — extracted from `quote-product-search.tsx`, generic combobox returning product record

**Create (server actions for search):**
- `src/app/(dashboard)/documents/search-actions.ts` — `searchProducts(query)` and `searchCustomers(query)` server actions (thin wrappers around existing service functions)

**Keep (reuse):**
- `src/services/product-service.ts` — `getProducts()` with search param
- `src/services/customer-service.ts` — existing customer query functions

### Implementation Steps

1. Extend `PresetPlaceholder` and `PresetTableColumn` types:
   ```ts
   dataSource?: "customer" | "product";
   linkedFields?: Record<string, string>; // { sourceField: targetPlaceholderKey }
   ```

2. Create `customer-autocomplete-combobox.tsx`:
   - Combobox with debounced search input
   - Calls `searchCustomers` server action
   - `onSelect` callback returns full customer object
   - Parent maps customer fields to placeholder values via `linkedFields`

3. Create `product-autocomplete-combobox.tsx`:
   - Combobox with debounced search input
   - Calls `searchProducts` server action
   - `onSelect` returns product object (name, description, unit, price)
   - Parent fills table row cells via `linkedFields`

4. Create `documents/search-actions.ts`:
   - `"use server"` actions wrapping product/customer service search
   - Tenant-scoped via `getTenantContext()`

5. Update `doc-entry-field-inputs.tsx`:
   - If placeholder has `dataSource === "customer"`, render `CustomerAutocompleteCombobox` instead of plain input
   - On select, populate linked placeholder fields in parent form state

6. Update `doc-entry-table-region-editor.tsx`:
   - If column has `dataSource === "product"`, render `ProductAutocompleteCombobox` in that cell
   - On select, fill related cells in the same row

7. Update `bao-gia-quotation-preset.ts`:
   - customerName placeholder: `dataSource: "customer"`, `linkedFields: { company: "customerCompany", phone: "customerPhone", email: "customerEmail", address: "customerAddress" }`
   - table name column: `dataSource: "product"`, `linkedFields: { description: "description", unit: "unit", unitPrice: "unitPrice" }`

### Todo List

- [ ] Extend preset types with `dataSource` and `linkedFields`
- [ ] Create customer autocomplete combobox component
- [ ] Create product autocomplete combobox component
- [ ] Create search server actions
- [ ] Integrate customer autocomplete into doc-entry field inputs
- [ ] Integrate product autocomplete into doc-entry table editor
- [ ] Update bao-gia preset definition with dataSource config
- [ ] Test autocomplete flow end-to-end

### Success Criteria

- Selecting customer in Bao Gia doc form auto-populates all 5 customer fields
- Selecting product in table row auto-populates name, desc, unit, price
- Manual entry still works when no autocomplete match chosen
- PGH and PXK presets unaffected (no dataSource = no autocomplete)
