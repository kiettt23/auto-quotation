---
phase: 2
title: "DB Schema + Tenant Isolation"
status: pending
effort: 2h
depends_on: [1]
---

# Phase 2: DB Schema + Tenant Isolation

## Issues Covered
C1, C5, C6, C7, W4, W12

## Context Links
- Audit: `plans/reports/audit-260314-1055-final-consolidated.md`
- Quotes schema: `src/db/schema/quotes.ts`
- Documents schema: `src/db/schema/documents.ts`
- Document service: `src/services/document-service.ts`
- Quote service: `src/services/quote-service.ts`

## Overview
This phase requires a **Drizzle migration** — schema changes to fix global unique constraints and add tenant isolation to doc_entries. All changes must be backward-compatible with existing data.

## Implementation Steps

### C1: getDocuments() fetches ALL tenants' docs, filters in JS
**File:** `src/services/document-service.ts:42-48`

Currently: fetches ALL documents, filters by template.tenantId in JS.
Fix: JOIN to documentTemplates and filter with SQL WHERE.

```ts
export async function getDocuments(tenantId: string, params: GetDocumentsParams = {}) {
  const conditions = [eq(documentTemplates.tenantId, tenantId)];
  if (params.templateId) {
    conditions.push(eq(documents.templateId, params.templateId));
  }

  return db.query.documents.findMany({
    where: and(
      // Join filter via subquery or use inArray with template IDs
      inArray(
        documents.templateId,
        db.select({ id: documentTemplates.id })
          .from(documentTemplates)
          .where(eq(documentTemplates.tenantId, tenantId))
      )
    ),
    with: { template: true },
    orderBy: [desc(documents.createdAt)],
    limit: params.limit,
    offset: params.offset ?? 0,
  });
}
```

**Alternative (simpler):** Add `tenantId` column directly to `doc_entries` table. This denormalizes but makes queries straightforward and consistent with every other table. Recommended approach:
- Add `tenantId` column to `doc_entries` schema
- Populate from template.tenantId in migration
- Use direct WHERE filter like all other services

### C5: quoteNumber unique constraint is GLOBAL
**File:** `src/db/schema/quotes.ts:17`

Currently: `.unique()` on quoteNumber — global across all tenants.
Fix: Remove `.unique()`, add composite unique constraint `(tenantId, quoteNumber)`.

```ts
// Remove .unique() from quoteNumber column definition
quoteNumber: text("quote_number").notNull(),

// Add in table config:
(t) => [
  uniqueIndex("quotes_tenant_number_uniq").on(t.tenantId, t.quoteNumber),
  // ...existing indexes
]
```

### C6: docNumber unique constraint is GLOBAL
**File:** `src/db/schema/documents.ts:14`

Same pattern as C5:
- Remove `.unique()` from docNumber
- If adding tenantId to doc_entries: composite unique `(tenantId, docNumber)`
- If keeping template relation only: composite unique `(templateId, docNumber)`

Recommended: `(templateId, docNumber)` since doc numbers are per-template prefix.

### C7: Race condition on number generation
**Files:** `src/services/quote-service.ts`, `src/services/document-service.ts`

Currently: reads counter → increments → writes back (two separate queries). Concurrent requests can get same number.

Fix: Use atomic `UPDATE ... SET counter = counter + 1 RETURNING counter` pattern.

For quotes (in quote-service.ts):
```ts
const [{ quoteNextNumber }] = await db
  .update(tenants)
  .set({ quoteNextNumber: sql`${tenants.quoteNextNumber} + 1` })
  .where(eq(tenants.id, tenantId))
  .returning({ quoteNextNumber: tenants.quoteNextNumber });

// quoteNextNumber is now the POST-increment value, so the number to use is quoteNextNumber - 1
// OR: return the old value by using a subquery
```

Better pattern — use `sql` to atomically get-and-increment:
```ts
const [result] = await db.execute(sql`
  UPDATE tenants
  SET quote_next_number = quote_next_number + 1
  WHERE id = ${tenantId}
  RETURNING quote_next_number - 1 AS current_number
`);
const nextNum = result.current_number as number;
const quoteNumber = generateQuoteNumber(prefix, nextNum);
```

Same pattern for document number generation in document-service.ts with `doc_templates.doc_next_number`.

### W4: Product create not fully transactional
**File:** `src/services/product-service.ts`
- Wrap product insert + any related inserts in a single `db.transaction()`
- Check if there's a product code uniqueness check that should be inside the tx

### W12: isCustomItem stored as text "true"/"false"
**File:** `src/db/schema/quotes.ts:74`

Currently: `text("is_custom_item").default("false")`
Fix: Change to `boolean("is_custom_item").default(false)`

This requires:
1. Schema change
2. Migration to convert existing text values to boolean
3. Update all code that compares `=== "true"` to just use the boolean

Search for all usages:
```
Grep: isCustomItem|is_custom_item
```
Update each comparison.

## Migration Strategy

Create a single Drizzle migration covering:
1. Add `tenantId` column to `doc_entries` (nullable initially)
2. Backfill `doc_entries.tenantId` from `doc_templates.tenantId`
3. Make `doc_entries.tenantId` NOT NULL
4. Drop global unique on `quotes.quote_number`, add composite `(tenant_id, quote_number)`
5. Drop global unique on `doc_entries.doc_number`, add composite `(template_id, doc_number)`
6. Convert `quote_items.is_custom_item` from text to boolean

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

**Important:** Test migration on a copy of production data first. The unique constraint changes may fail if there are already duplicate values across tenants (unlikely for single-tenant data but verify).

## Todo
- [ ] C1: Add tenantId to doc_entries OR fix query with JOIN
- [ ] C5: quoteNumber → composite unique (tenantId, quoteNumber)
- [ ] C6: docNumber → composite unique (templateId, docNumber)
- [ ] C7: Atomic number generation for quotes
- [ ] C7: Atomic number generation for documents
- [ ] W4: Wrap product creation in transaction
- [ ] W12: Convert isCustomItem to boolean
- [ ] Generate and test migration
- [ ] Update all service code referencing changed columns
- [ ] Compile check

## Risk Assessment
- **Migration on existing data**: Must handle backfill of tenantId on doc_entries. If doc_entries exist without a template (orphans), migration will fail on NOT NULL constraint.
- **Boolean conversion**: All frontend code comparing `=== "true"` must be updated simultaneously.
- **Atomic counter**: Drizzle's `sql` template may need raw query for RETURNING arithmetic. Test syntax.

## Success Criteria
- No global unique constraints on tenant-scoped numbers
- Document queries use SQL WHERE, not JS filter
- Number generation is atomic (no race conditions)
- Migration runs cleanly
- Compile passes
