---
title: "Multi-tenant audit fixes + dynamic tenant switching"
description: "Fix 21 audit issues and implement dynamic multi-company tenant switching"
status: pending
priority: P1
effort: 10h
branch: rewrite/production-saas
tags: [multi-tenant, security, audit, saas]
created: 2026-03-14
---

# Multi-Tenant Audit Fixes + Dynamic Tenant Switching

## Audit Report
- `plans/reports/audit-260314-1055-final-consolidated.md`

## Phase Overview

| # | Phase | Issues Covered | Effort | Status |
|---|-------|---------------|--------|--------|
| 1 | Security & validation fixes | C2,C3,C4,C8,C9,W1,W5,W6 | 1.5h | pending |
| 2 | DB schema + tenant isolation | C1,C5,C6,C7,W4,W12 | 2h | pending |
| 3 | UI/UX fixes | C10,C11,C12,W9,W10,W11 + naming | 1.5h | pending |
| 4 | Error handling + seed | W2,W3,W7,W8 + seed gap | 1.5h | pending |
| 5 | Dynamic multi-tenant switching | tenant selector, cookie, context rewrite | 2.5h | pending |
| 6 | Onboarding + settings for multi-company | create company flow, settings per tenant | 1h | pending |

---

## Phase 1: Security & Validation Fixes
→ [phase-01-security-validation.md](phase-01-security-validation.md)

## Phase 2: DB Schema + Tenant Isolation
→ [phase-02-db-schema-tenant-isolation.md](phase-02-db-schema-tenant-isolation.md)

## Phase 3: UI/UX Fixes
→ [phase-03-ui-ux-fixes.md](phase-03-ui-ux-fixes.md)

## Phase 4: Error Handling + Seed
→ [phase-04-error-handling-seed.md](phase-04-error-handling-seed.md)

## Phase 5: Dynamic Multi-Tenant Switching
→ [phase-05-dynamic-multi-tenant.md](phase-05-dynamic-multi-tenant.md)

## Phase 6: Onboarding + Multi-Company Settings
→ [phase-06-onboarding-multi-company.md](phase-06-onboarding-multi-company.md)

---

## Unresolved Questions
1. Terminology confirmed as "tài liệu" (not "chứng từ") — need user confirmation
2. Should invite emails actually send? Currently returns URL only
3. RLS at Postgres level vs app-level scoping — staying app-level for now?
4. Object storage migration for fileBase64 — out of scope for this plan?
