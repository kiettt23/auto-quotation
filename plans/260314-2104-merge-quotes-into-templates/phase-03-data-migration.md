## Phase 3: DB Migration — Quotes to Documents

**Priority:** P1 | **Status:** pending | **Effort:** 3h

### Overview

Migrate existing quote data from `quotes` + `quote_items` tables into `doc_templates` + `doc_entries` tables. Each tenant gets an auto-created "Bao gia" doc_template (preset-bao-gia). Each quote becomes a doc_entry with fieldData/tableRows JSON matching the preset schema.

### Key Insights

- `quotes` stores denormalized customer fields + pricing columns; these map to `fieldData` JSON
- `quote_items` stores line items; these map to `tableRows` JSON array
- `doc_templates` needs one row per tenant for the Bao Gia preset (with `name` matching preset's `namePatterns`)
- `doc_entries.docNumber` = `quotes.quoteNumber` (preserve numbering)
- Tenant's `quotePrefix` / `quoteNextNumber` should transfer to the new doc_template's `docPrefix` / `docNextNumber`
- Share tokens have no column in `doc_entries` — handled in Phase 6

### Requirements

**Functional:**
- Every existing quote becomes a document entry under the tenant's Bao Gia template
- Quote number preserved as doc_number
- All field data (customer, pricing, notes, terms) preserved in fieldData JSON
- All line items preserved in tableRows JSON array
- Each tenant gets exactly one Bao Gia doc_template

**Non-functional:**
- Migration wrapped in transaction per tenant — all-or-nothing
- Idempotent: safe to re-run (skip tenants already having a Bao Gia template)
- Backup SQL provided for rollback

### Data Mapping

**quotes -> doc_entries.fieldData:**
```json
{
  "customerName": quotes.customer_name,
  "customerCompany": quotes.customer_company,
  "customerPhone": quotes.customer_phone,
  "customerEmail": quotes.customer_email,
  "customerAddress": quotes.customer_address,
  "customerId": quotes.customer_id,
  "validUntil": quotes.valid_until,
  "globalDiscountPercent": quotes.global_discount_percent,
  "vatPercent": quotes.vat_percent,
  "shippingFee": quotes.shipping_fee,
  "otherFees": quotes.other_fees,
  "otherFeesLabel": quotes.other_fees_label,
  "notes": quotes.notes,
  "terms": quotes.terms,
  "status": quotes.status,
  "subtotal": quotes.subtotal,
  "discountAmount": quotes.discount_amount,
  "vatAmount": quotes.vat_amount,
  "total": quotes.total,
  "shareToken": quotes.share_token,
  "shareTokenExpiresAt": quotes.share_token_expires_at
}
```

**quote_items -> doc_entries.tableRows:**
```json
[
  {
    "productId": item.product_id,
    "name": item.name,
    "description": item.description,
    "unit": item.unit,
    "quantity": item.quantity,
    "unitPrice": item.unit_price,
    "discountPercent": item.discount_percent,
    "lineTotal": item.line_total,
    "isCustomItem": item.is_custom_item
  }
]
```

### Related Code Files

**Create:**
- `src/db/migrations/migrate-quotes-to-documents.ts` — standalone migration script runnable via `pnpm tsx src/db/migrations/migrate-quotes-to-documents.ts`

**Modify:**
- `package.json` — add script `"db:migrate-quotes": "tsx src/db/migrations/migrate-quotes-to-documents.ts"`

### Implementation Steps

1. Create migration script:
   - Fetch all tenants
   - For each tenant:
     a. Check if Bao Gia doc_template already exists (idempotent guard)
     b. Create doc_template: `name: "Bao gia"`, `fileType: "pdf"`, `fileBase64: ""` (preset doesn't use uploaded file), `docPrefix` from tenant.quotePrefix, `docNextNumber` from tenant.quoteNextNumber, `placeholders: []`, `tableRegion: null`
     c. Fetch all quotes for tenant (ordered by created_at)
     d. Fetch all quote_items grouped by quoteId
     e. For each quote, insert doc_entry with mapped fieldData + tableRows, preserving quoteNumber as docNumber and createdAt/updatedAt
   - Wrap per-tenant work in transaction

2. Add `createdAt` preservation:
   - `doc_entries` table has `created_at` with `defaultNow()` — migration must explicitly set it to quote's original `created_at`

3. Log migration progress: `Tenant {slug}: migrated {n} quotes`

4. Provide rollback SQL in comments:
   ```sql
   -- Rollback: delete migrated doc_entries and bao-gia templates
   DELETE FROM doc_entries WHERE template_id IN (
     SELECT id FROM doc_templates WHERE name = 'Bao gia'
   );
   DELETE FROM doc_templates WHERE name = 'Bao gia';
   ```

### Todo List

- [ ] Create migration script
- [ ] Test with local DB (seed data)
- [ ] Verify doc_entries created with correct fieldData/tableRows
- [ ] Verify docNumber matches original quoteNumber
- [ ] Verify idempotent re-run
- [ ] Add package.json script
- [ ] Run migration on staging

### Success Criteria

- All quotes appear in /documents list under Bao Gia template
- Document numbers match original quote numbers
- Opening a migrated document shows correct customer + items data
- PDF/Excel export of migrated document matches original quote export
- Re-running migration produces no duplicates

### Risk Assessment

- **Large dataset**: Use batched inserts (100 at a time) if tenant has >1000 quotes
- **Share tokens**: Stored in fieldData JSON for now; Phase 6 will add proper support
- **Quote status**: Stored in fieldData; doc system doesn't have native status concept — may need UI badge in Phase 5
