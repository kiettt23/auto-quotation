# Database & Data Integrity Audit

**Date:** 2026-03-14 | **Branch:** rewrite/production-saas

## Schema Coverage Matrix

| Table | tenant_id? | Seeded? | Service exists? | UI exists? | Notes |
|-------|-----------|---------|-----------------|------------|-------|
| `user` | No (global) | Yes (4 users) | Better Auth managed | Yes | Correct — users are global |
| `session` | No (global) | Auto (auth) | Better Auth managed | N/A | Correct |
| `account` | No (global) | Auto (auth) | Better Auth managed | N/A | Correct |
| `verification` | No (global) | No | Better Auth managed | N/A | Correct |
| `tenants` | IS tenant | Yes (1) | settings-service | Yes | OK |
| `tenant_members` | Yes (composite PK) | Yes (4) | Via auth/settings | Yes | OK |
| `tenant_invites` | Yes | No | invite-service | Yes | **Not seeded** |
| `categories` | Yes | Yes (4) | settings-service | Yes | OK |
| `units` | Yes | Yes (5) | settings-service | Yes | OK |
| `products` | Yes | Yes (10) | product-service | Yes | OK |
| `pricing_tiers` | **No** | Yes (8) | product-service | Yes | **ISSUE** - see below |
| `volume_discounts` | **No** | Yes (3) | product-service | Yes | **ISSUE** - see below |
| `customers` | Yes | Yes (5) | customer-service | Yes | OK |
| `quotes` | Yes | Yes (3) | quote-service | Yes | OK |
| `quote_items` | **No** | Yes (items) | quote-service | Yes | **ISSUE** - see below |
| `doc_templates` | Yes | No | template-service | Yes | **Not seeded** |
| `doc_entries` | **No** | No | document-service | Yes | **ISSUE** - see below |

## Critical Issues

### C1. `doc_entries` table has NO tenant_id and NO tenant scoping in queries

The `documents` table (`doc_entries`) has no `tenant_id` column. Tenant scoping is done **in application code** by fetching ALL documents, joining template, then filtering `d.template.tenantId === tenantId` in JavaScript (document-service.ts line 48).

**Impact:**
- `getDocuments()` fetches ALL documents from ALL tenants, then filters in JS. This is a **full table scan across tenants** — catastrophic at scale.
- No DB-level isolation. A bug in the filter logic = cross-tenant data leak.
- No index-based filtering possible.

**Fix:** Add `tenant_id` column to `doc_entries` with FK to tenants, add index, filter in SQL.

### C2. `pricing_tiers` and `volume_discounts` have no tenant_id

These child tables only reference `product_id`. While products have `tenant_id`, these tables lack direct tenant scoping.

**Impact:** Low risk currently — queries go through products which are tenant-scoped. But direct queries on these tables (e.g., admin dashboards, reports, bulk operations) would leak across tenants. No index on tenant for these tables.

**Mitigation:** Acceptable for now since all access paths go through product_id joins, but adding tenant_id would be defense-in-depth.

### C3. `quote_items` has no tenant_id

Same pattern as pricing_tiers. Access goes through quote_id which is tenant-scoped, but `deleteProduct` in product-service.ts queries `quoteItems` directly by `productId` without tenant scoping (line 232-234):

```typescript
const [{ usageCount }] = await db
  .select({ usageCount: count() })
  .from(quoteItems)
  .where(eq(quoteItems.productId, id));
```

**Impact:** This counts quote items across ALL tenants. If tenant A and tenant B both use a product with the same ID (impossible with CUID, but conceptually wrong), results would be incorrect. More importantly, the query pattern is not tenant-scoped by design.

### C4. SQL injection via ilike search parameters

In customer-service.ts, product-service.ts, and quote-service.ts, search strings are interpolated directly into `ilike` patterns:

```typescript
ilike(customers.name, `%${params.search}%`)
```

Drizzle parameterizes the value, so this is NOT a SQL injection. However, the `%` and `_` characters in user input are not escaped, allowing users to craft wildcard patterns. This is a **minor** issue but worth noting.

### C5. `quoteNumber` unique constraint is GLOBAL, not per-tenant

`quotes.quoteNumber` has `.unique()` which creates a global unique constraint. If two tenants use the same prefix pattern (e.g., both use "BG-2026-"), their quote numbers will collide.

**Impact:** Production breakage when two tenants try to create quotes with the same number.

**Fix:** Change to a composite unique constraint on `(tenant_id, quote_number)`.

### C6. `docNumber` unique constraint is GLOBAL, not per-tenant

Same issue as C5. `documents.docNumber` has `.unique()` globally. Two tenants with same doc prefix will collide.

**Fix:** Composite unique on `(template_id, doc_number)` or add tenant_id and use `(tenant_id, doc_number)`.

## Warnings

### W1. `deleteCustomer` quote count check is not tenant-scoped

customer-service.ts line 166-169:
```typescript
const [{ quoteCount }] = await db
  .select({ quoteCount: count() })
  .from(quotes)
  .where(eq(quotes.customerId, id));
```

Missing `eq(quotes.tenantId, tenantId)` in the WHERE clause. With CUIDs, cross-tenant collision is near-impossible, but the pattern is wrong.

### W2. Seed does NOT cover: `doc_templates`, `doc_entries`, `tenant_invites`

Three tables have no seed data. The document template feature cannot be demo'd after seeding.

### W3. `isCustomItem` stored as text "true"/"false" instead of boolean

`quoteItems.isCustomItem` is `text("is_custom_item").default("false")`. Should be `boolean`.

### W4. Race condition on quote/doc number generation

Both quote number and doc number generation follow read-then-increment pattern:
1. Read `quoteNextNumber` from tenant
2. Generate number
3. Increment counter

If two concurrent requests hit this, they can generate the same number. The unique constraint will cause one to fail with an unclear error.

**Fix:** Use `RETURNING` with an atomic `UPDATE ... SET quote_next_number = quote_next_number + 1 RETURNING quote_next_number` or use a DB sequence.

### W5. `products.code` has no unique constraint

Product codes (e.g., "LAPTOP-001") have an index but no unique constraint, not even per-tenant. The import function checks for duplicates in app code, but concurrent imports could create duplicates.

**Fix:** Add composite unique constraint `(tenant_id, code)`.

### W6. No unique constraint on (tenant_id, name) for categories/units

Two categories or units with the same name can exist in the same tenant. May cause confusion.

### W7. `getDocuments` N+1 / full-table-scan pattern

document-service.ts `getDocuments()` loads ALL documents with templates, then filters in JS. This is an O(n) scan of every document in the database for every tenant request.

### W8. `db` singleton pattern may not work correctly with Neon serverless

`src/db/index.ts` creates a module-level singleton `const db: Db = getDb()`. On line 24, `db` is eagerly evaluated at module load. In serverless (Vercel), module-level singletons persist across warm invocations, which is fine for connection reuse. But the `_db` variable on line 14 is redundant since `db` on line 24 already acts as the singleton.

## Observations

### O1. Good: All tenant-scoped services consistently use tenantId parameter
Every service function takes `tenantId` as first parameter and includes it in WHERE clauses (except the issues noted above).

### O2. Good: Cascade deletes are properly set up
All FK references use `onDelete: "cascade"` for owned relationships and `onDelete: "set null"` for optional references (customer on quotes, category/unit on products). This is correct.

### O3. Good: Indexes exist on all tenant_id columns
Every tenant-scoped table has an index on `tenant_id`. Additional indexes on frequently queried columns (status, customer_id, share_token, product code).

### O4. Good: Transactions used for multi-table writes
Product save and quote save use `db.transaction()` for atomic multi-table operations.

### O5. Good: Server-side total recalculation
Quote totals are always recalculated server-side in `saveQuote`, not trusted from client.

### O6. Good: Customer snapshot denormalization
Quotes store a snapshot of customer data at creation time, so historical quotes remain accurate even if customer data changes.

### O7. Numeric precision
All monetary values use `numeric(15, 0)` (no decimals). This is intentional for VND (Vietnamese Dong) which has no subunit. Percentages use `numeric(5, 2)`. Appropriate.

## Files Reviewed

**Schema (12 files):**
- `src/db/schema/enums.ts`
- `src/db/schema/tenants.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/tenant-members.ts`
- `src/db/schema/categories.ts`
- `src/db/schema/units.ts`
- `src/db/schema/products.ts`
- `src/db/schema/customers.ts`
- `src/db/schema/quotes.ts`
- `src/db/schema/document-templates.ts`
- `src/db/schema/documents.ts`
- `src/db/schema/tenant-invites.ts`
- `src/db/schema/index.ts`

**Infrastructure (2 files):**
- `src/db/index.ts`
- `drizzle.config.ts`

**Seed (1 file):**
- `src/db/seed.ts`

**Services (8 files):**
- `src/services/settings-service.ts`
- `src/services/dashboard-service.ts`
- `src/services/customer-service.ts`
- `src/services/template-service.ts`
- `src/services/document-service.ts`
- `src/services/invite-service.ts`
- `src/services/product-service.ts`
- `src/services/quote-service.ts`

## Priority Summary

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| C1 | doc_entries no tenant_id, JS-level filtering | **Critical** | Medium |
| C5 | quoteNumber globally unique (should be per-tenant) | **Critical** | Low |
| C6 | docNumber globally unique (should be per-tenant) | **Critical** | Low |
| W4 | Race condition on number generation | **High** | Medium |
| W1 | deleteCustomer quote check not tenant-scoped | **High** | Low |
| W5 | product code no unique constraint | **High** | Low |
| W3 | isCustomItem text instead of boolean | **Medium** | Low |
| W7 | getDocuments full table scan | **Medium** | Medium |
| C2 | pricing_tiers/volume_discounts no tenant_id | **Low** | Medium |
| C3 | quote_items no tenant_id | **Low** | Medium |
| W2 | Missing seed data for 3 tables | **Low** | Low |
| W6 | No unique (tenant_id, name) on categories/units | **Low** | Low |

## Unresolved Questions

1. Is there a plan to add RLS (Row Level Security) at the Postgres level for tenant isolation, or is app-level scoping the final strategy?
2. Are there any migration files in the drizzle output directory? The glob returned no `.sql` files — is this using push mode or are migrations stored elsewhere?
3. The `fileBase64` column in `doc_templates` stores entire files as base64 text in Postgres. At scale, this could bloat the DB significantly. Is there a plan to move to object storage (S3/R2)?
