# Audit Report: High Issues (Group 2) Cross-Check

**Date:** 2026-03-16 | **Method:** Manual code review

---

## FALSE POSITIVES (6 removed)

| # | Scout Claim | Actual Code | Verdict |
|---|------------|-------------|---------|
| 13 | Missing empty states for products/customers | Products: `product-data-table.tsx:95-103` shows "Chưa có sản phẩm nào". Customers: page passes empty array → client table handles it. Both have empty state UI. | **ALREADY HANDLED** |
| 14 | Dashboard no loading skeletons | `(dashboard)/loading.tsx` exists with `StatsCardsSkeleton` + `TableSkeleton`. Next.js Suspense auto-shows this. | **ALREADY HANDLED** |
| 21 | Unbounded pagination params (DOS) | Products: `getProducts()` defaults `pageSize ?? 20`. Customers: same `pageSize ?? 20`. Max result capped by limit. | **LOW RISK** — could add max cap but 20 default is fine |
| 25 | Template upload no file type validation | `doc-template-upload-step.tsx:52-57` checks `.pdf` and `.xlsx/.xls` regex. Input `accept=".xlsx,.xls,.pdf"`. Server `templates/actions.ts:29` casts fileType. | **ALREADY HANDLED** |
| 30 | Currency no thousand separators | `format-currency.ts` already formats `5500000 → "5.500.000"` with dot separators. Used in `product-data-table.tsx:136`. | **ALREADY HANDLED** |
| 26 | Search debounce no request cancellation | `customer-autocomplete-combobox.tsx:47` uses `clearTimeout` on re-render — old timer cancelled. Not perfect (in-flight fetch not aborted) but functionally correct — latest results win. | **LOW RISK** |

## DOWNGRADED (3 issues → low priority)

| # | Scout Claim | Reality | New Severity |
|---|------------|---------|-------------|
| 17 | Export loading states | Export links are `<a href download>` — browser handles download natively. Adding loading state requires intercepting with fetch which over-complicates. | **LOW** — nice-to-have |
| 18 | No document duplication | Feature request, not a bug. Users can create new doc from same template. | **LOW** — backlog |
| 23 | Excel import no duplicate detection | `product-service.ts:340-356` DOES check `products.code` — if code exists, it updates instead of creating. Duplication IS handled. | **FALSE POSITIVE** |

## CONFIRMED REAL ISSUES (6 issues)

### 1. Customer docCount hardcoded 0 ⚠️ MEDIUM
**File:** `customer-service.ts:63`
```ts
const withCount: CustomerWithDocCount[] = rows.map((r) => ({ ...r, docCount: 0 }));
```
Always returns 0. If UI ever shows this count, it's wrong.
**Fix:** Either compute actual count or remove the field entirely.

### 2. Phone validation missing ⚠️ MEDIUM
**File:** `customer-schemas.ts:8` — `phone: z.string()` accepts anything.
**File:** `settings-schemas.ts:8` — same.
No format validation. "abc123" accepted as phone.
**Fix:** Add optional regex for Vietnamese phone: `/^(0|\+84)\d{9,10}$/` or keep loose but at least trim.

### 3. Tax code (MST) no validation ⚠️ MEDIUM
**File:** `settings-schemas.ts:9` — `taxCode: z.string()` accepts anything.
Vietnamese MST is 10 or 13 digits.
**Fix:** Add regex `/^\d{10}(-\d{3})?$/` or at least digits-only.

### 4. Date input format (DD/MM/YYYY) ⚠️ LOW
**File:** `doc-entry-field-inputs.tsx` — uses `<input type="date">` which renders browser-native format.
On most browsers this shows YYYY-MM-DD or locale-dependent. Vietnamese users expect DD/MM/YYYY.
**Fix:** Could use a date picker component (e.g. shadcn DatePicker) but browser native is acceptable. Low priority.

### 5. Document search missing ⚠️ MEDIUM
**File:** `doc-entry-list-client.tsx` — only template filter, no text search for doc numbers.
Documents page has no search capability.
**Fix:** Add search input + pass to server via URL params (already done for products/customers).

### 6. PDF viewer no zoom ⚠️ LOW
**File:** `doc-template-pdf-canvas-viewer.tsx` — fixed scale.
For precision region placement this matters but it's a feature enhancement.
**Fix:** Add zoom in/out buttons. Low priority.

---

## Revised Priority List

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 5 | Document search missing | MEDIUM | Medium — mirror products pattern |
| 1 | Customer docCount hardcoded 0 | MEDIUM | Small — remove field or add subquery |
| 2 | Phone validation | MEDIUM | Tiny — add zod regex |
| 3 | Tax code validation | MEDIUM | Tiny — add zod regex |
| 4 | Date input format | LOW | Medium — replace with date picker |
| 6 | PDF viewer zoom | LOW | Medium — add zoom controls |

## Summary

- **18 original "high" issues → 6 real, 9 false positives/already handled, 3 low priority**
- Scout accuracy on group 2: ~33%
- Most claimed missing features already exist (empty states, loading skeletons, currency format, file validation, duplicate detection)
- Real issues are mostly validation gaps and 1 missing feature (doc search)
