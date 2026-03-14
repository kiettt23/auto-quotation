---
phase: 4
title: "Error Handling + Seed"
status: pending
effort: 1.5h
depends_on: [2]
---

# Phase 4: Error Handling, Onboarding Cleanup, Share Tokens, Seed

## Issues Covered
W2, W3, W7, W8, seed gap

## Implementation Steps

### W2: Inconsistent error handling — ok/err vs throw
**Pattern:** Quotes/products use `Result<T>` with `ok()/err()`. Templates/documents throw.

Fix strategy — standardize on `Result<T>` in **services**, throw in **actions**:
- Services return `Result<T>` — never throw
- Actions call service, check `result.ok`, throw on error (for Server Action error propagation)
- This is already the pattern in quote/product/document services

**Files to update:**
- `src/services/template-service.ts` — wrap in try/catch, return `ok()/err()`
- Any other service that throws directly

Grep for services that throw:
```
Grep: "throw new Error" path=src/services
```

### W3: Onboarding bypasses service layer
**File:** `src/app/(dashboard)/onboarding/actions.ts`

Currently does raw `db.update(tenants)` and `db.insert(products)` directly.

Fix: Call existing service functions instead:
- `saveCompanyStep` → use `settingsService.updateCompanyInfo()` + separate slug update
- `saveFirstProduct` → use `productService.createProduct()`
- `completeOnboarding` → can stay as direct DB call (simple flag update) or extract to settings service

This ensures validation and business logic from services is applied.

### W7: Share tokens never expire
**File:** `src/db/schema/quotes.ts`

Add `shareTokenExpiresAt` column:
```ts
shareTokenExpiresAt: timestamp("share_token_expires_at"),
```

**File:** Share route handler (find with `Grep: shareToken`)
- When generating token: set expiry to 30 days from now
- When resolving token: check `shareTokenExpiresAt > now()`, return 404 if expired

### W8: No rate limiting
Simplest approach for Next.js App Router: use `next-safe-action` or a simple in-memory rate limiter.

**Minimal approach** — add rate limiting to auth endpoints only (login, register, invite):
- Create `src/lib/rate-limit.ts` with a simple sliding-window Map-based limiter
- Apply to login/register actions
- Key by IP (from headers `x-forwarded-for`)

```ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
```

Note: This is per-instance only. For production with multiple instances, use Redis or Vercel's `@vercel/kv`. But for single-instance deployment, Map is fine.

### Seed gap: doc_templates, doc_entries, tenant_invites
**File:** `src/db/seed.ts`

Add seed data for:
1. **doc_templates** — 2-3 sample templates with field definitions and table columns
2. **doc_entries** — 2-3 sample entries per template with field data
3. **tenant_invites** — 1 pending invite for testing

Use the same tenant and user IDs as existing seed data.

## Todo
- [ ] W2: Standardize template service to return Result<T>
- [ ] W3: Refactor onboarding actions to use service layer
- [ ] W7: Add shareTokenExpiresAt column + expiry check
- [ ] W8: Add rate limiter to auth actions
- [ ] Seed: Add doc_templates, doc_entries, tenant_invites
- [ ] Compile check

## Success Criteria
- All services use consistent Result<T> pattern
- Onboarding uses service layer
- Share tokens have expiry
- Auth endpoints rate-limited
- Seed script populates all tables
- Compile passes
