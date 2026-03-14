# Production-Readiness Audit — Final Consolidated Report

**Date:** 2026-03-14 | **Branch:** rewrite/production-saas
**Auditors:** 4 independent code-reviewer agents (cross-checked)
**Verdict:** **NOT PRODUCTION-READY** — 9 critical issues, 12 warnings

---

## Overall Scorecard

| Area | Grade | Verdict |
|------|-------|---------|
| Authentication | A | PASS — Better Auth, session cookies, proper guards |
| RBAC | B- | PARTIAL — 1 action missing check, mobile nav ignores roles |
| Tenant Isolation | C | FAIL — doc_entries has no tenant_id, JS-level filtering, cross-tenant query leaks |
| Input Validation | C | FAIL — Multiple actions skip Zod, logo upload unvalidated |
| Database Schema | C+ | PARTIAL — Global unique constraints break multi-tenant, race conditions |
| API Completeness | B+ | PASS — Full CRUD on all entities, good patterns |
| Error Handling | C+ | PARTIAL — Inconsistent ok/err vs throw across actions |
| Frontend/UX | B- | PARTIAL — Working but naming inconsistencies, English login page |
| Seed/Testability | C | FAIL — Templates & documents not seeded |

---

## CRITICAL Issues (Must Fix — 9 items)

### Security & Data Integrity

| # | Issue | File | Impact | Fix Effort |
|---|-------|------|--------|------------|
| C1 | **`getDocuments()` fetches ALL tenants' docs, filters in JS** | document-service.ts:42-48 | Data leak + DoS at scale | Medium |
| C2 | **`deleteDocEntry` missing RBAC check** — VIEWER can delete | documents/actions.ts:45 | Privilege escalation | Low (1 line) |
| C3 | **`uploadLogo` — zero file validation** (type, size, SVG XSS) | settings/actions.ts:113-135 | Stored XSS, DoS | Low |
| C4 | **`saveCustomer` skips Zod validation** at runtime | customers/actions.ts:33 | Arbitrary data injection | Low |
| C5 | **`quoteNumber` unique constraint is GLOBAL** — tenants collide | quotes schema | Production breakage | Low |
| C6 | **`docNumber` unique constraint is GLOBAL** — tenants collide | documents schema | Production breakage | Low |
| C7 | **Race condition on number generation** — concurrent duplicates | quote-service.ts, document-service.ts | Duplicate numbers, insert failures | Medium |
| C8 | **`acceptInviteAction` accepts userId from client** — not session | register/actions.ts:6-8 | Impersonation via known invite token | Low |
| C9 | **`deleteCustomer` quote-count not tenant-scoped** | customer-service.ts:166-169 | Wrong referential integrity check | Low |

### UX & Polish

| # | Issue | Impact |
|---|-------|--------|
| C10 | **Login page entirely in English** — rest of app is Vietnamese | Jarring UX inconsistency |
| C11 | **AppHeader shows blank title on `/dashboard`** | Header displays empty string |
| C12 | **Search/Ctrl+K button visible but non-functional** | Broken UX on every page |

---

## Warnings (Should Fix — 12 items)

| # | Issue | Severity |
|---|-------|----------|
| W1 | Settings actions skip Zod runtime validation | High |
| W2 | Inconsistent error handling: ok/err (quotes/products) vs throw (templates/docs) | High |
| W3 | Onboarding bypasses service layer — raw DB access | High |
| W4 | Product create not fully transactional (insert outside tx) | High |
| W5 | `saveQuote` deletes items before verifying quote ownership | High |
| W6 | ILIKE search doesn't escape `%`/`_` wildcards | Medium |
| W7 | Share tokens never expire | Medium |
| W8 | No rate limiting on any endpoint | Medium |
| W9 | Auth pages use hardcoded colors (breaks dark mode) | Medium |
| W10 | Auth pages have no loading.tsx/error.tsx boundaries | Medium |
| W11 | MobileBottomNav doesn't filter by RBAC (fragile) | Medium |
| W12 | `isCustomItem` stored as text "true"/"false" instead of boolean | Low |

---

## Naming Inconsistencies (Confirmed by 2 agents)

| Location | Currently says | Should say |
|----------|---------------|------------|
| nav-items.ts | "Mẫu tài liệu" | — (source of truth) |
| app-header.tsx pageTitles | "Mẫu chứng từ" | "Mẫu tài liệu" |
| templates/page.tsx h1 | "Mẫu chứng từ" | "Mẫu tài liệu" |
| nav-items.ts | "Tài liệu" | — (source of truth) |
| app-header.tsx pageTitles | "Chứng từ" | "Tài liệu" |
| documents/page.tsx h1 | "Chứng từ" | "Tài liệu" |

---

## Seed Coverage Gap

| Table | Seeded? |
|-------|---------|
| doc_templates | **NO** |
| doc_entries | **NO** |
| tenant_invites | **NO** |
| All other tables | Yes |

---

## What's GOOD (Cross-Verified)

All 4 agents independently confirmed these positives:
- Consistent tenant-scoping pattern across services (tenantId as first param)
- Server-side quote total recalculation (prevents client price manipulation)
- Drizzle ORM parameterized queries (no SQL injection)
- Cascade deletes properly configured
- Transactions used for multi-table writes (quotes, products)
- All server actions have "use server" directive
- All API routes check auth via getTenantContext()
- Clean Result type pattern (where used)
- No TODO/FIXME/HACK debt
- Dashboard layout with loading/error boundaries
- Responsive design with mobile bottom nav
- Customer snapshot denormalization for quote history
- VND-appropriate numeric precision (no decimals)

---

## Verdict

**This app is a solid MVP/beta but NOT production-ready for multi-tenant SaaS.**

The core architecture is sound — tenant scoping, RBAC, auth patterns are correct in ~90% of the codebase. But the remaining 10% contains critical gaps that would cause real problems:

1. **Tenant data isolation breach** in document service (C1) — this alone is a launch blocker
2. **Global unique constraints** (C5, C6) — will break when second tenant onboards
3. **Missing validation** (C3, C4) — opens XSS and data corruption vectors
4. **Race conditions** (C7) — will surface under any concurrent usage

**Estimated fix effort:** 2-3 focused sessions to resolve all critical issues.

---

## Unresolved Questions

1. Is terminology "tài liệu" or "chứng từ"? Need product decision.
2. Is Phase 08 (command palette) planned for this release? If not, hide the button.
3. Should invite emails be sent? Currently returns URL but no email dispatch.
4. Plan for RLS at Postgres level, or app-level scoping is final strategy?
5. `fileBase64` stores entire files in Postgres — plan for object storage migration?
