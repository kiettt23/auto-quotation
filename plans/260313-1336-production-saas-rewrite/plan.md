---
title: "Auto Quotation -> Production SaaS Rewrite"
description: "Full rewrite: multi-tenant SaaS with Drizzle, Better Auth, Unified Template Engine"
status: pending
priority: P1
effort: 12w
branch: rewrite/production-saas
tags: [saas, rewrite, multi-tenant, drizzle, better-auth]
created: 2026-03-13
---

# Production SaaS Rewrite

**Brainstorm:** `plans/reports/brainstorm-260313-1336-production-saas-rewrite.md`
**Branch:** `rewrite/production-saas` (from `main`)
**Stack:** Next.js 15, React 19, Drizzle ORM, Better Auth, shadcn/ui, Tailwind 4, PostgreSQL (Neon)

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 1 | Foundation | pending | 3w | [phase-01-foundation.md](./phase-01-foundation.md) |
| 2 | Core Business | pending | 3w | [phase-02-core-business.md](./phase-02-core-business.md) |
| 3 | Template Engine | pending | 3w | [phase-03-template-engine.md](./phase-03-template-engine.md) |
| 4 | SaaS Polish | pending | 2w | [phase-04-saas-polish.md](./phase-04-saas-polish.md) |
| 5 | Consolidation (Layer 2) | pending | 0.5w | [phase-05-consolidation.md](./phase-05-consolidation.md) |
| 6 | Final Audit (Layer 3) | pending | 0.5w | [phase-06-final-audit.md](./phase-06-final-audit.md) |

## Key Constraints

- English routes (`/quotes`, `/products`), Vietnamese UI strings
- Every DB table has `tenant_id` (except `users`, `sessions`, `accounts`)
- All server actions return `{ success: true, data } | { error: string }`
- No `JSON.parse(JSON.stringify(...))` — Drizzle handles types natively
- Single font registration source for all PDF renderers
- Files < 200 lines, kebab-case naming

## Dependencies

```
Phase 1 (Foundation) -> Phase 2 (Core Business) -> Phase 3 (Template Engine)
                                                 -> Phase 4 (SaaS Polish)
Phase 2, 3, 4 complete -> Phase 5 (Consolidation) -> Phase 6 (Final Audit)
```

## Unresolved Questions

1. Domain/hosting: Vercel vs self-host?
2. Email service for auth flows (Resend)?
3. File storage at scale: Vercel Blob vs S3?
