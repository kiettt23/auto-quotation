---
title: "Phase 6: Final Audit (Layer 3)"
status: pending
priority: P2
effort: 0.5w
---

# Phase 6: Final Audit (Layer 3)

## Context Links

- [plan.md](./plan.md) | [Phase 5](./phase-05-consolidation.md)

## Overview

Security audit (OWASP top 10), performance audit, accessibility audit, final code quality pass. Last gate before merge to main.

**Depends on:** Phase 5 (consolidation) complete.

## Audit Checklist

### Security (OWASP Top 10)
- [ ] **Injection:** All DB queries parameterized (Drizzle handles this, verify no raw SQL)
- [ ] **Broken Auth:** Session management secure, cookies httpOnly + secure + sameSite
- [ ] **Sensitive Data:** No API keys in client code, no secrets in git, passwords hashed
- [ ] **XXE:** No XML parsing (N/A)
- [ ] **Broken Access Control:** Every action checks tenant membership, RBAC enforced
- [ ] **Misconfiguration:** Security headers set (CSP, X-Frame-Options, etc.)
- [ ] **XSS:** All user input escaped in React (default), no dangerouslySetInnerHTML
- [ ] **Insecure Deserialization:** No unsafe JSON.parse on user input without validation
- [ ] **Vulnerable Components:** `pnpm audit` shows no critical vulnerabilities
- [ ] **Logging:** Errors logged server-side, no sensitive data in logs

### Tenant Isolation Verification
- [ ] Create 2 test tenants with different data
- [ ] Verify Tenant A cannot see Tenant B's quotes/products/customers/documents
- [ ] Verify share links only expose intended quote data
- [ ] Verify API routes enforce tenant context

### Performance
- [ ] `pnpm build` — check bundle size, no unnecessary imports
- [ ] List pages paginated (no loading all records)
- [ ] PDF generation < 5s
- [ ] Lighthouse performance score > 80 for dashboard
- [ ] No N+1 queries in list pages (use Drizzle joins)
- [ ] Images optimized (next/image for logos)

### Accessibility (WCAG 2.1 AA)
- [ ] All form inputs have labels
- [ ] Color contrast ratios meet AA (4.5:1 for text)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader compatible (ARIA labels on icons, buttons)
- [ ] Focus indicators visible

### Code Quality
- [ ] No `any` types (except unavoidable library types)
- [ ] No `eslint-disable` comments without justification
- [ ] No commented-out code
- [ ] No console.log in production code
- [ ] All functions have clear names
- [ ] No files > 200 lines

## Implementation Steps

1. Run `pnpm audit` — fix critical vulnerabilities
2. Review middleware for security headers
3. Test tenant isolation with 2 separate accounts
4. Run Lighthouse on key pages
5. Check all Drizzle queries for N+1 patterns
6. Run accessibility checker (axe-core or browser devtools)
7. Grep for anti-patterns: `any`, `console.log`, `eslint-disable`, `TODO`, `HACK`
8. Final `pnpm build && pnpm test && pnpm lint`

## Success Criteria

- All security checklist items pass
- All performance checklist items pass
- All accessibility checklist items pass
- All code quality checklist items pass
- Ready to merge `rewrite/production-saas` -> `main`

## Agent Instructions

**File ownership:** ALL files (read-only preferred, modify only for fixes).
**Output:** Audit report in `plans/reports/audit-report.md` with findings + fixes applied.
**Priority:** Security > Tenant Isolation > Performance > Accessibility > Code Quality.
