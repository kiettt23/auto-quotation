# Scout Report: UI/UX & Logic Improvements

**Date:** 2026-03-16 | **Scope:** Full codebase (193 files) | **Agents:** 4 parallel scouts

---

## CRITICAL (Fix Immediately)

### Security
1. **Directory traversal in logo upload** — `settings/actions.ts:112-143` — unsanitized filename from user input
2. **XSS in share page** — `share-document-view.tsx:39-45,68` — user input rendered without escaping in public context
3. **No rate limiting on public share endpoint** — `document-service.ts:159-170` — brute force attack vector
4. **PDF text overlay no input validation** — `generate-pdf-overlay.ts:65-87` — long strings/control chars corrupt PDF

### Data Integrity
5. **Product save without transactions** — `product-service.ts:144-227` — sequential queries; crash = orphaned records
6. **Product deletion without referential check** — `product-service.ts:237-253` — orphaned refs in documents
7. **Duplicate document numbers under concurrency** — `document-service.ts:68-109` — no UNIQUE constraint
8. **Share token no revocation** — `document-service.ts:136-156` — old tokens never invalidated

### UX
9. **No unsaved changes warning** — `doc-entry-form-page.tsx:124-189` — navigate away = data loss
10. **No pagination in document list** — `documents/page.tsx:10-13` — loads ALL documents into memory
11. **No form field-level validation** — `doc-entry-form-page.tsx:103-122` — generic error toast only
12. **No file size check before base64** — `doc-template-upload-step.tsx:65-68` — large PDFs crash browser

---

## HIGH (Next Sprint)

### UI/UX
13. **Missing empty states** — products, customers, settings pages show blank when no data
14. **Dashboard no loading skeletons** — `dashboard/page.tsx:8-22` — blank until Promise.all resolves
15. **PDF viewer no zoom controls** — `doc-template-pdf-canvas-viewer.tsx` — fixed scale, precision work impossible
16. **No search in document list** — only template filter, no text search
17. **Export buttons no loading state** — `doc-entry-table.tsx:157-167` — users click multiple times
18. **No document duplication** — must re-enter all fields for similar docs
19. **Template builder cancel = data loss** — `doc-template-builder-page.tsx:276-287` — no confirmation
20. **Clipboard copy no error handling** — `doc-entry-table.tsx:83-86` — silent failure possible

### Logic
21. **Unbounded pagination params** — customer/product services — can request 1M records (DOS)
22. **Product import not atomic** — `product-service.ts:260-366` — partial import on failure
23. **Excel import no duplicate detection** — `import-preview-step.tsx:69-92` — silent overwrite
24. **Customer docCount hardcoded 0** — `customer-service.ts:63` — always wrong
25. **No file type validation on template upload** — `templates/actions.ts:12-33` — accepts anything
26. **Search debounce no request cancellation** — `customer-autocomplete-combobox.tsx:46-49` — stale results

### Vietnamese Business UX
27. **Phone no formatting/validation** — `customer-dialog.tsx:97-98` — accepts "abc123"
28. **Tax code (MST) no validation** — `company-info-form.tsx:167` — should be 10/13/14 digits
29. **Date input DD/MM/YYYY** — `doc-entry-field-inputs.tsx:57` — shows YYYY-MM-DD, Vietnamese expect DD/MM
30. **Currency no thousand separators** — prices show "500000" not "500.000 ₫"

---

## MEDIUM (Backlog)

### Missing Features
31. No bulk actions (delete, export, assign) across all tables
32. No column customization / sorting in tables
33. No template duplication feature
34. No template preview/test mode before saving
35. No batch edit for products
36. No undo/redo in forms
37. No keyboard shortcuts (Ctrl+S, Ctrl+Z)
38. No CSV/Excel export for product/customer lists
39. No document filtering by date range
40. No page size selector in data tables (fixed 8 rows)

### Accessibility
41. Missing aria-describedby on form fields across auth/settings
42. Tables missing scope="col" on th elements
43. PDF canvas not keyboard navigable
44. Color-only status indicators (pricing type badges)
45. Icon-only buttons missing aria-labels
46. No skip links for long forms

### Responsive
47. Tables hide columns on mobile, no card view alternative
48. Product dialog overflow on screens < 640px
49. Toolbar wrapping issues on mobile
50. Dashboard layout bottom nav + sidebar redundancy on tablet

### Architecture
51. Settings service mixes 3 concerns (tenant, categories, units)
52. Hardcoded preset renderer registry — adding presets requires code change
53. No unified Result type usage across server actions
54. Numeric prices stored as string — string handling overhead
55. Font bytes loaded from disk per PDF render (no cache)
56. Tenant settings queried per render (no cache)

---

## Summary

| Category | Critical | High | Medium |
|----------|----------|------|--------|
| Security | 4 | — | — |
| Data Integrity | 4 | 3 | 2 |
| UI/UX | 4 | 8 | 10 |
| Vietnamese UX | — | 4 | — |
| Logic | — | 3 | — |
| Missing Features | — | — | 10 |
| Accessibility | — | — | 6 |
| Responsive | — | — | 4 |
| Architecture | — | — | 6 |
| **Total** | **12** | **18** | **38** |

## Unresolved Questions
1. Why `numeric()` for prices instead of integer (cents-based)?
2. Are share tokens time-limited? UI says "30 ngày" but no TTL code found
3. Are soft deletes or audit logs required by business rules?
4. Is tax code / banking data stored encrypted?
5. What happens if tenant has 0 members after all leave?
