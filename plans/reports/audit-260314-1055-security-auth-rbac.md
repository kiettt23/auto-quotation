# Security, Auth & RBAC Audit

## Summary

| Area | Verdict |
|------|---------|
| Authentication | **PASS** — Better Auth with session cookies, cookie cache, proper session resolution |
| Authorization / RBAC | **PARTIAL** — Most mutations gated, but 1 action missing RBAC check |
| Tenant Isolation | **PARTIAL** — Most queries scoped, but 2 critical gaps found |
| Input Validation | **PARTIAL** — Some actions validate via Zod, others accept raw `unknown` unchecked |
| Sensitive Data | **PASS** — No hardcoded secrets, passwords handled by Better Auth |
| Middleware / Proxy | **PASS** — Cookie-based auth guard, proper public route exemptions |

## Critical Issues (must fix before production)

### C1. Document service `getDocuments()` fetches ALL documents then filters in JS
**File:** `src/services/document-service.ts:42-48`
```ts
const allDocs = await db.query.documents.findMany({
  with: { template: true },
  orderBy: [desc(documents.createdAt)],
});
let filtered = allDocs.filter((d) => d.template.tenantId === tenantId);
```
**Impact:** Loads every document from every tenant into memory, then filters client-side. This is both a **data leak risk** (all docs in memory on the server) and a **performance disaster** at scale. An attacker could exploit memory pressure or timing to infer document counts.
**Fix:** Join on `documentTemplates` with a `where` clause filtering `documentTemplates.tenantId` at the DB level.

### C2. `deleteDocEntry` action missing RBAC check
**File:** `src/app/(dashboard)/documents/actions.ts:45-50`
```ts
export async function deleteDocEntry(id: string) {
  const { tenantId } = await getTenantContext();
  // No requireRole() call — any VIEWER can delete documents
  const result = await deleteDocument(tenantId, id);
```
**Impact:** A user with VIEWER role can delete documents. All other delete/mutation actions require MEMBER or ADMIN.
**Fix:** Add `requireRole(ctx.role, "MEMBER")` before the delete call.

### C3. `deleteCustomer` service does not scope quote-count check by tenantId
**File:** `src/services/customer-service.ts:166-169`
```ts
const [{ quoteCount }] = await db
  .select({ quoteCount: count() })
  .from(quotes)
  .where(eq(quotes.customerId, id));
```
**Impact:** The quote count check queries across ALL tenants. If tenant A's customer ID happens to match quotes from tenant B (unlikely with CUIDs but not impossible), the deletion guard could produce incorrect results. More importantly, this is a pattern violation — every query should be tenant-scoped.
**Fix:** Add `and(eq(quotes.customerId, id), eq(quotes.tenantId, tenantId))`. The function already receives `tenantId`.

### C4. `uploadLogo` — no file type or size validation
**File:** `src/app/(dashboard)/settings/actions.ts:113-135`
```ts
const file = formData.get("file") as File | null;
// No size check, no MIME type validation
const buffer = Buffer.from(await file.arrayBuffer());
const ext = file.name.split(".").pop() ?? "png";
```
**Impact:** Attacker can upload arbitrary files (e.g., `.html`, `.svg` with embedded JS, `.exe`) to `/public/uploads/`. SVG files served from same origin = **stored XSS**. No file size limit = potential DoS.
**Fix:**
- Validate MIME type against allowlist (`image/png`, `image/jpeg`, `image/webp`)
- Validate file extension
- Enforce max file size (e.g., 2MB)
- Reject SVG files (or sanitize them)

### C5. `saveCustomer` action does not validate input with Zod
**File:** `src/app/(dashboard)/customers/actions.ts:33`
```ts
export async function saveCustomer(data: CustomerFormData, id?: string) {
```
**Impact:** TypeScript types are erased at runtime. The `data` parameter is not validated — any JSON can be passed from the client. The `customerFormSchema` exists but is never called.
**Fix:** Add `const parsed = customerFormSchema.safeParse(data)` like `saveProductAction` does.

## Warnings (should fix)

### W1. `acceptInviteAction` has no auth check
**File:** `src/app/(auth)/register/actions.ts:6-8`
```ts
export async function acceptInviteAction(token: string, userId: string) {
  return acceptInvite(token, userId);
}
```
**Impact:** This server action accepts an arbitrary `userId` from the client. An attacker who knows an invite token could pass any userId to join a tenant as someone else. The userId should come from the session, not from client input.
**Fix:** Get `userId` from the session inside the action, or at minimum validate it matches the current session user.

### W2. Search inputs used directly in ILIKE without escaping
**Files:** `src/services/customer-service.ts:35-39`, `src/services/product-service.ts:54-58`, `src/services/quote-service.ts:50-55`
```ts
ilike(customers.name, `%${params.search}%`)
```
**Impact:** While Drizzle parameterizes the query (no SQL injection), special LIKE characters (`%`, `_`) in user input can produce unexpected results. Not a security vulnerability per se, but a correctness issue.
**Fix:** Escape `%` and `_` in search strings before wrapping with `%...%`.

### W3. Quote `saveQuote` deletes all items then re-inserts without verifying quote ownership first
**File:** `src/services/quote-service.ts:138-139`
```ts
await tx.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));
await tx.update(quotes).set({...}).where(and(eq(quotes.id, quoteId), eq(quotes.tenantId, tenantId)));
```
**Impact:** The delete of `quoteItems` happens before the tenantId-scoped update. If `quoteId` belongs to another tenant, the items get deleted even though the quote update would match 0 rows. The transaction would still commit with orphaned item deletions.
**Fix:** Verify quote ownership (select with tenantId check) before deleting items, or reverse the order — update first, check affected rows, then delete/re-insert.

### W4. No rate limiting on auth or API endpoints
**Impact:** Login, register, and all API routes have no rate limiting. Brute-force attacks on login, or abuse of export endpoints, are possible.
**Fix:** Add rate limiting middleware (e.g., `better-auth` rate limiting plugin, or custom middleware).

### W5. Share token is a plain UUID — no expiry
**File:** `src/services/quote-service.ts:320-328`
**Impact:** Share links never expire. Once generated, anyone with the URL can view the quote forever.
**Fix:** Add expiry timestamp to share tokens, or allow revoking them.

### W6. `Content-Disposition` filename not sanitized
**Files:** All export routes (4 files)
```ts
`attachment; filename="${quote.quoteNumber}.xlsx"`
```
**Impact:** If `quoteNumber` contains special characters (quotes, newlines), it could cause header injection. Low risk since quoteNumber is server-generated, but defense-in-depth suggests sanitizing.

## Observations

### Positive
- **Consistent tenant-scoping pattern**: All services accept `tenantId` as first param, and all server actions resolve it via `getTenantContext()` which validates the session server-side
- **RBAC consistently applied** on mutations: Settings require ADMIN, CRUD requires MEMBER, reads are open to all roles (appropriate for most use cases)
- **Server-side total recalculation** in `saveQuote` prevents price manipulation from client
- **Share page limits exposed fields** — only `companyName`, `name`, `logoUrl`, `primaryColor`, `phone` are selected from tenant, not internal data like `taxCode` or `bankAccount`
- **Drizzle ORM used throughout** — parameterized queries prevent SQL injection
- **No secrets in code** — database URL, auth secrets presumably in env vars (not committed)
- **Proxy middleware** correctly redirects unauthenticated users for all dashboard routes
- **Better Auth cookie cache** (5 min) reduces DB hits for session validation

### Neutral
- `documents` table has no `tenantId` column — tenant isolation relies on joining through `documentTemplates.tenantId`. This is architecturally acceptable but makes it harder to enforce at the DB level (no RLS possible on documents alone).
- `quoteItems` and `pricingTiers`/`volumeDiscounts` similarly have no `tenantId` — rely on parent FK. This is fine given cascade deletes.
- `getTenantContext()` picks the FIRST tenant membership. Multi-tenant users always see only their first tenant — no tenant switching UI exists. This is a product limitation, not a security bug.

## Files Reviewed

### Server Actions (7 files)
- `src/app/(dashboard)/customers/actions.ts`
- `src/app/(dashboard)/documents/actions.ts`
- `src/app/(dashboard)/products/actions.ts`
- `src/app/(dashboard)/quotes/actions.ts`
- `src/app/(dashboard)/settings/actions.ts`
- `src/app/(dashboard)/templates/actions.ts`
- `src/app/(dashboard)/onboarding/actions.ts`
- `src/app/(auth)/register/actions.ts`

### Services (7 files)
- `src/services/customer-service.ts`
- `src/services/quote-service.ts`
- `src/services/product-service.ts`
- `src/services/document-service.ts`
- `src/services/settings-service.ts`
- `src/services/template-service.ts`
- `src/services/invite-service.ts`
- `src/services/dashboard-service.ts`

### API Routes (6 files)
- `src/app/api/doc-export/excel/[documentId]/route.ts`
- `src/app/api/doc-export/pdf/[documentId]/route.ts`
- `src/app/api/export/excel/[quoteId]/route.ts`
- `src/app/api/export/pdf/[quoteId]/route.ts`
- `src/app/api/doc-template/analyze/route.ts`
- `src/app/api/doc-template/analyze-pdf/route.ts`

### Auth & Infra (4 files)
- `src/proxy.ts`
- `src/auth/index.ts`
- `src/lib/rbac.ts`
- `src/lib/tenant-context.ts`

### Schema (5 files)
- `src/db/schema/documents.ts`
- `src/db/schema/quotes.ts`
- `src/db/schema/customers.ts`
- `src/db/schema/products.ts`
- `src/db/schema/document-templates.ts`

### Validation (1 file)
- `src/lib/validations/customer-schemas.ts`

### Public page
- `src/app/share/[token]/page.tsx`

**Total: 32 files reviewed**
