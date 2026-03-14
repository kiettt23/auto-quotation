---
phase: 1
title: "Security & Validation Fixes"
status: pending
effort: 1.5h
---

# Phase 1: Security & Validation Fixes

## Issues Covered
C2, C3, C4, C8, C9, W1, W5, W6

## Context Links
- Audit: `plans/reports/audit-260314-1055-final-consolidated.md`
- RBAC util: `src/lib/rbac.ts`

## Implementation Steps

### C2: deleteDocEntry missing RBAC (1 line fix)
**File:** `src/app/(dashboard)/documents/actions.ts:45`
- Add `requireRole(ctx.role, "MEMBER")` before delete call
- Pattern: same as createDocEntry/updateDocEntry above it

```ts
export async function deleteDocEntry(id: string) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "MEMBER");  // ADD THIS
  const result = await deleteDocument(ctx.tenantId, id);
  ...
}
```

### C3: uploadLogo — add file validation
**File:** `src/app/(dashboard)/settings/actions.ts` (uploadLogo function)
- Validate MIME type: only `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`
- Validate file size: max 2MB
- For SVG: sanitize or reject (simplest: reject SVG to avoid XSS)
- Validate base64 format before storing

```ts
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
// Check file.type and file.size before processing
```

### C4: saveCustomer skips Zod validation
**File:** `src/app/(dashboard)/customers/actions.ts:33`
- Import the customer Zod schema (or create one)
- Parse input through Zod before passing to service
- Return validation errors to client

### C8: acceptInviteAction trusts client userId
**File:** `src/app/(auth)/register/actions.ts`
- Remove `userId` parameter from function signature
- Get userId from session via `auth.api.getSession()` inside the action
- If no session, throw error

```ts
export async function acceptInviteAction(token: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) throw new Error("Unauthenticated");
  return acceptInvite(token, session.user.id);
}
```
- **Also update caller** in `src/app/(auth)/register/page.tsx` to stop passing userId

### C9: deleteCustomer quote-count not tenant-scoped
**File:** `src/services/customer-service.ts:166-169`
- Add `tenantId` filter to the quote count query
- Change: `eq(quotes.customerId, id)` → `and(eq(quotes.customerId, id), eq(quotes.tenantId, tenantId))`

### W1: Settings actions skip Zod runtime validation
**File:** `src/app/(dashboard)/settings/actions.ts`
- Add Zod schemas for each settings action (companyInfo, banking, quoteTemplate, defaults)
- Parse input through schema before calling service

### W5: saveQuote deletes items before verifying ownership
**File:** `src/services/quote-service.ts` (saveQuote/updateQuote)
- Verify quote belongs to tenant BEFORE deleting existing items
- Move ownership check to happen first, then delete+insert items

### W6: ILIKE search doesn't escape wildcards
**Files:** Any service using `ilike()` for search
- Create helper: `escapeIlike(str)` that escapes `%`, `_`, `\`
- Apply to all search inputs before passing to `ilike()`

```ts
function escapeIlike(str: string): string {
  return str.replace(/[\\%_]/g, (c) => '\\' + c);
}
```

## Todo
- [ ] C2: Add requireRole to deleteDocEntry
- [ ] C3: Add MIME/size validation to uploadLogo
- [ ] C4: Add Zod validation to saveCustomer
- [ ] C8: Fix acceptInviteAction to use session userId
- [ ] C9: Add tenantId filter to deleteCustomer quote count
- [ ] W1: Add Zod validation to settings actions
- [ ] W5: Fix saveQuote item deletion order
- [ ] W6: Add ILIKE escape helper + apply
- [ ] Compile check

## Success Criteria
- All actions validate input via Zod
- No RBAC gaps in document actions
- No client-trusted userId
- Tenant-scoped referential integrity checks
- Compile passes
