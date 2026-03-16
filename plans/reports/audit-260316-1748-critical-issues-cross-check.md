# Audit Report: Critical Issues Cross-Check

**Date:** 2026-03-16 | **Method:** Manual code review against scout findings

---

## Cross-Check Results

### FALSE POSITIVES (Scout was wrong — 5 issues removed)

| # | Scout Claim | Actual Code | Verdict |
|---|------------|-------------|---------|
| 2 | XSS in share page — user input rendered without escaping | React JSX auto-escapes `{value}` and `{row[col.col]}`. No `dangerouslySetInnerHTML` used. | **NOT VULNERABLE** |
| 6 | Product deletion without referential check — orphaned refs | Soft delete (`deletedAt`). Documents store data in JSON (`fieldData`/`tableRows`), not FK refs. Deleting product doesn't break docs. | **NOT AN ISSUE** |
| 7 | Duplicate doc numbers under concurrency | Schema already has `uniqueIndex("doc_entries_template_number_uniq").on(t.templateId, t.docNumber)` + atomic SQL increment. | **ALREADY HANDLED** |
| 8 | Share tokens never revoked / no expiry | `generateShareLink()` overwrites `shareToken` column (old token gone). `getDocumentByShareToken()` checks `shareTokenExpiresAt < new Date()` at line 168. | **ALREADY HANDLED** |
| 4 | PDF text overlay injection | `pdf-lib` `drawText()` is not HTML — handles strings safely. `maxWidth` set. No injection vector. | **NOT VULNERABLE** |

### DOWNGRADED (Not critical, low risk — 2 issues)

| # | Scout Claim | Reality | New Severity |
|---|------------|---------|-------------|
| 3 | No rate limiting on share endpoint — brute force | Token is cuid2 (~136 bits entropy). Brute force impractical. Nice-to-have, not critical. | **LOW** |
| 11 | No form field-level validation | Fields are user-defined placeholders with no schema. What's "required" is unknown. More UX polish than security. | **LOW** |

### CONFIRMED REAL ISSUES (5 issues)

---

## Issue 1: Logo upload — extension not validated ⚠️ MEDIUM

**File:** `src/app/(dashboard)/settings/actions.ts:129`

**Scout claimed:** Directory traversal. **Actual:** No directory traversal (ext = last segment after `.`, filename = `logo-{tenantId}.{ext}`).

**But real problem:** Extension not validated to match MIME type. User uploads `evil.html` with forged `image/png` MIME → creates `public/uploads/logo-{id}.html` → Next.js serves as HTML → script execution on your domain.

**Fix:** Sanitize ext to only allow `png|jpg|jpeg|webp`.

---

## Issue 5: Product save without transactions ⚠️ MEDIUM

**File:** `src/services/product-service.ts:170-227`

Code comment says: "neon-http driver does not support transactions". On update: deletes all pricing tiers, then inserts new ones. If crash between delete and insert → pricing data lost.

**Fix:** Either switch to neon-serverless WebSocket driver for transactions, or restructure to insert-then-delete pattern.

---

## Issue 9: No unsaved changes warning ⚠️ HIGH

**File:** `src/components/doc-entry/doc-entry-form-page.tsx`

No `beforeunload` event listener. User fills in 20 fields, accidentally clicks "Quay lại" → all data lost without warning.

**Fix:** Add `useEffect` with `beforeunload` handler when form is dirty.

---

## Issue 10: No pagination in document list ⚠️ HIGH

**File:** `src/app/(dashboard)/documents/page.tsx:10-11`

`getDocuments(tenantId)` called with NO limit/offset. Service supports pagination params but page doesn't pass them. 1000+ documents → all loaded at once → slow page load, high memory.

**Fix:** Add pagination params + UI pagination controls.

---

## Issue 12: No file size check before base64 conversion ⚠️ MEDIUM

**File:** `src/components/doc-template/doc-template-upload-step.tsx:65-68`

`file.arrayBuffer()` called without size check. A 200MB PDF gets fully loaded into browser memory, then converted to base64 (1.33x size) → ~266MB in memory → browser tab crashes.

**Fix:** Check `file.size` before processing. Reject files > 10-20MB.

---

## Revised Priority List

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 9 | No unsaved changes warning | HIGH | Small — add beforeunload |
| 10 | No pagination in documents | HIGH | Medium — add params + UI |
| 1 | Logo ext not validated | MEDIUM | Tiny — 1 line fix |
| 12 | No file size check | MEDIUM | Tiny — 1 line check |
| 5 | Product save no transactions | MEDIUM | Medium — driver change or pattern restructure |

## Summary

- **12 original "critical" issues → 5 real, 5 false positives, 2 low-risk**
- Scout accuracy: ~42% on critical findings
- Most security concerns (XSS, injection, token, duplicates) already handled by framework/code
- Real issues are UX (data loss, performance) and 1 security (ext validation)
