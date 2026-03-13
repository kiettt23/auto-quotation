# Brainstorm Report: Auto Quotation → Production SaaS Rewrite

**Date:** 2026-03-13 | **Status:** Agreed | **Next:** Create detailed implementation plan

---

## Problem Statement

Auto Quotation is a working MVP for Vietnamese businesses to create/manage quotations. Current codebase has architectural debt from 3 independently-evolved modules (Quote, Doc Template, PGH). Goal: transform into production-grade SaaS multi-tenant application with unified architecture.

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Business model | SaaS multi-tenant | Multiple companies, each with own data |
| Framework | Keep Next.js 15 + React 19 | Proven stack, ecosystem strength, no rewrite risk |
| ORM | Prisma 7 → Drizzle | Type-safe, no JSON.parse hack, better middleware |
| Auth | Better Auth | Self-hosted, TypeScript-first, multi-tenant ready |
| Multi-tenant | Shared DB, row-level isolation | tenantId on every table, simplest to start |
| Template approach | Unified Template Engine | Customers self-create templates — core SaaS feature |
| Billing | Phase later | Focus on product first |
| Scope | Full rewrite | UI/UX, logic, business rules — everything |
| QA strategy | 3-layer | Implement → Refactor/consolidate → Final audit |
| Timeline | 2-3 months, 1-2 people | Using multi-agent parallel execution |

## Current State Analysis

### What Works (Keep the logic, rewrite the code)
- Pricing engine — pure functions, well-tested
- Zod validation schemas — good patterns
- Quote CRUD flow — proven business logic
- PDF/Excel generation — working output

### What's Broken (Needs rewrite)
- No auth/tenant isolation
- `JSON.parse(JSON.stringify(...))` everywhere (Prisma Decimal serialization)
- Duplicate font registration across PDF renderers
- PGH module hardcoded for 1 company, uses localStorage
- Doc Template engine separate from Quote export
- No shared error handling pattern
- Mixed Vietnamese/English naming
- Actions files too large (9 functions in 1 file)
- No middleware layer

## Target Architecture

```
┌──────────────────────────────────────────────────┐
│                    FRONTEND                       │
│  Next.js 15 App Router + shadcn/ui + Tailwind 4  │
│  ┌──────────┐ ┌───────────┐ ┌─────────────────┐ │
│  │ Dashboard │ │ Quote Mgmt│ │ Template Engine │ │
│  │ (per org) │ │ (CRUD+    │ │ (upload, config,│ │
│  │           │ │  export)  │ │  render, export)│ │
│  └──────────┘ └───────────┘ └─────────────────┘ │
├──────────────────────────────────────────────────┤
│               MIDDLEWARE LAYER                    │
│  Auth (Better Auth) → Tenant Context → RBAC      │
│  Error Boundary → Rate Limiting → Logging        │
├──────────────────────────────────────────────────┤
│               BUSINESS LOGIC                     │
│  ┌──────────────────────────────────────────┐    │
│  │       Unified Template Engine             │    │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ │    │
│  │  │Template  │ │Data      │ │Render     │ │    │
│  │  │Registry  │ │Binding   │ │Adapters   │ │    │
│  │  │(DB-based)│ │Engine    │ │PDF/Excel  │ │    │
│  │  └─────────┘ └──────────┘ └───────────┘ │    │
│  └──────────────────────────────────────────┘    │
│  ┌────────────┐ ┌──────────┐ ┌──────────────┐   │
│  │Pricing     │ │Quote     │ │Customer      │   │
│  │Engine      │ │Service   │ │Service       │   │
│  │(pure func) │ │(CRUD+calc│ │(CRUD)        │   │
│  └────────────┘ └──────────┘ └──────────────┘   │
├──────────────────────────────────────────────────┤
│                DATA LAYER                        │
│  Drizzle ORM + PostgreSQL (Neon)                 │
│  Row-level isolation: every table has tenantId   │
│  ┌────────┐┌──────┐┌──────────┐┌──────┐┌──────┐│
│  │Tenant  ││User  ││Template  ││Quote ││Produc││
│  │(org)   ││(auth)││(engine)  ││(core)││t     ││
│  └────────┘└──────┘└──────────┘└──────┘└──────┘│
└──────────────────────────────────────────────────┘
```

## Database Schema Changes (High-level)

### New tables
- `tenants` — org info, branding, settings (replaces singleton Settings)
- `users` — auth, linked to tenant
- `user_sessions` / `accounts` — Better Auth tables

### Modified tables (add tenantId)
- `quotes`, `quote_items`
- `products`, `categories`, `units`
- `customers`
- `pricing_tiers`, `volume_discounts`

### Replaced tables
- `settings` → merged into `tenants` (each org has own settings)
- `doc_templates` → refactored into unified template system
- `doc_entries` → becomes `template_documents`

## Implementation Phases

### Phase 1: Foundation (Week 1-3)
- Drizzle ORM setup + schema migration
- Multi-tenant data model (tenantId everywhere)
- Better Auth (register, login, org creation)
- Middleware (auth guard, tenant context injection)
- Shared error handling pattern (Result type)
- Shared font registration (single source)

### Phase 2: Core Business (Week 4-6)
- Quote management rewrite (Drizzle + tenant-scoped)
- Product/Customer management rewrite
- Pricing engine (keep logic, adapt to Drizzle types)
- Dashboard per tenant
- Settings per tenant (branding, defaults)

### Phase 3: Template Engine (Week 7-9)
- Unified Template Engine architecture
- Template CRUD (upload Excel/PDF, define placeholders)
- Data binding engine (template + data → filled document)
- PDF renderer (react-pdf for generated, pdf-lib for overlay)
- Excel renderer (ExcelJS for both generated and fill)
- Quote PDF/Excel as built-in templates
- PGH as built-in template (no more hardcoded company)
- Custom template support (user-uploaded)

### Phase 4: SaaS Polish (Week 10-12)
- User roles & permissions (Admin, Sales, Viewer)
- Public share links (per tenant branding)
- Onboarding flow (new org setup wizard)
- Landing page + marketing site
- UI/UX redesign (consistent, professional)
- Testing suite (unit + integration + e2e)
- Security audit
- Deployment pipeline (staging + production)

## Multi-Agent Execution Strategy

### Layer 1: Implementation (Parallel agents)
Each agent owns a phase with strict file boundaries:

| Agent | Owns | Files |
|-------|------|-------|
| Foundation Agent | Phase 1 | `src/db/*`, `src/auth/*`, `src/middleware/*` |
| Quote Agent | Phase 2 | `src/app/(dashboard)/bao-gia/*`, `src/services/quote/*` |
| Product Agent | Phase 2 | `src/app/(dashboard)/san-pham/*`, `src/services/product/*` |
| Customer Agent | Phase 2 | `src/app/(dashboard)/khach-hang/*`, `src/services/customer/*` |
| Template Agent | Phase 3 | `src/lib/template-engine/*`, `src/app/(dashboard)/templates/*` |
| UI Agent | Phase 4 | `src/components/*`, `src/app/layout.tsx`, landing page |

### Layer 2: Consolidation Agent
- Review all code from Layer 1
- Fix integration gaps between modules
- Refactor duplicated patterns
- Ensure naming consistency
- Run all tests, fix failures

### Layer 3: Audit Agent
- Security audit (OWASP top 10)
- Performance audit (bundle size, query optimization)
- Accessibility audit (WCAG 2.1 AA)
- Code quality final pass
- Documentation update

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Drizzle migration breaks existing data | High | Backup DB, test migration on staging first |
| Template engine over-engineering | Medium | Start with 2 template types (quote + custom), expand later |
| Multi-tenant data leaks | Critical | DB-level RLS policies + middleware guards + audit tests |
| 2-3 month timeline slip | Medium | Prioritize Phase 1-2 as MVP, Phase 3-4 can extend |
| Agent file conflicts | Medium | Strict file ownership boundaries |

## Success Criteria

- [ ] Any company can register, create org, invite users
- [ ] Tenant data fully isolated (no cross-tenant leaks)
- [ ] Quote CRUD + export works per tenant
- [ ] Users can upload custom templates + generate documents
- [ ] Built-in quote and PGH templates available
- [ ] RBAC enforced (admin/sales/viewer)
- [ ] Public share links work with per-tenant branding
- [ ] All existing business logic preserved (pricing, number-to-words, etc.)
- [ ] 90%+ test coverage on business logic
- [ ] No OWASP top 10 vulnerabilities
- [ ] Page load < 2s, PDF generation < 5s

## Additional Decisions (Round 2)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route naming | English routes, Vietnamese UI | `/quotes` not `/bao-gia`. UI text stays Vietnamese for non-tech users |
| Data | Fresh start + seed data | No production data to migrate, new Drizzle schema from scratch |
| UI/UX direction | Modern SaaS (Linear/Notion style) | Clean, minimal, sidebar nav, card-based |
| Branch strategy | `rewrite/production-saas` single branch | Agents run sequentially by phase, parallel within phase with strict file ownership |
| Staging DB | Not needed yet | New schema, no conflict. Setup staging before final deployment |

## Git & Multi-Agent Strategy (Detailed)

### Branch: `rewrite/production-saas`
- Created from `main`
- All agents commit to this branch
- Agents within same phase can run in parallel (strict file ownership)
- Phases run sequentially: Phase 1 must complete before Phase 2 starts
- Layer 2 (consolidation) runs after all phases complete
- Layer 3 (audit) runs after consolidation
- Final merge to `main` only after Layer 3 passes

### File Ownership Rules
- Each agent ONLY writes to its designated directories
- Shared types/interfaces defined in Phase 1 (foundation) — other agents import, never modify
- If agent needs to modify shared file → flag it, consolidation agent handles

## Unresolved Questions

1. **Domain/hosting**: Stay on Vercel or self-host? Affects pricing at scale.
2. **Email service**: Resend for transactional emails? Needed for auth flows (password reset, invite).
3. **File storage at scale**: Vercel Blob ok for templates? Or need S3?
