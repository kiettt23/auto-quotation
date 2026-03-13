---
title: "Phase 4: SaaS Polish"
status: pending
priority: P2
effort: 2w
---

# Phase 4: SaaS Polish

## Context Links

- [plan.md](./plan.md) | [Phase 1](./phase-01-foundation.md) | [Phase 2](./phase-02-core-business.md) | [Phase 3](./phase-03-template-engine.md)

## Overview

RBAC enforcement, public share links with tenant branding, onboarding wizard, landing page, UI polish, and test suite. This phase transforms the functional app into a polished SaaS product.

**Depends on:** Phase 1 (auth, middleware), Phase 2 (core business), Phase 3 (template engine — for complete feature set)

## Key Insights

- RBAC is enforcement layer on top of existing tenant context — add `requireRole()` checks
- Onboarding creates tenant + default settings + built-in templates in one flow
- Landing page is a static marketing page — minimal, can be a single RSC
- Testing focuses on business logic (pricing engine, services) + integration (CRUD flows)

## Requirements

### Functional
- **RBAC:** OWNER can do everything. ADMIN can do everything except delete org. MEMBER can CRUD quotes/products/customers/documents. VIEWER is read-only.
- **Invite flow:** OWNER/ADMIN can invite users by email. Invitee registers -> auto-joins tenant.
- **Share links:** `/share/:token` shows quote with tenant branding (logo, colors, company name). Download PDF button.
- **Onboarding:** After registration, wizard: company name -> logo upload -> first product (optional) -> done.
- **Landing page:** Marketing page at `/` (unauthenticated). Hero, features, pricing placeholder, CTA.
- **UI polish:** Consistent spacing, animations, dark mode support, responsive.
- **Testing:** Vitest unit tests for services + business logic. Playwright e2e for critical flows.

### Non-Functional
- Lighthouse score > 90 for landing page
- All forms accessible (keyboard nav, ARIA labels)
- Dark mode via Tailwind `dark:` classes

## Architecture

### RBAC Enforcement
```
Server Action -> getTenantContext() returns { userId, tenantId, role }
  -> requireRole(ctx, ["OWNER", "ADMIN"]) throws if insufficient
  -> proceed with operation
```

Roles are checked at the action level, not middleware (middleware only checks auth + tenant membership).

### Invite Flow
```
OWNER sends invite (email + role) -> store invite in DB (tenant_invites table)
  -> send email with invite link (or display link if no email service)
Invitee clicks link -> register page pre-fills invite token
  -> on register: create user -> accept invite -> create tenant_member
```

Note: Need a `tenant_invites` table. Add to schema in Phase 1 update or handle in this phase.

### Onboarding Flow
```
Register -> redirect to /onboarding
  -> Step 1: Company name + slug
  -> Step 2: Logo upload (optional)
  -> Step 3: Add first product (optional, skip)
  -> Complete -> redirect to /quotes
```

## New Directory/File Structure

```
src/
  db/schema/
    tenant-invites.ts                  # NEW: id, tenant_id, email, role, token, expires_at, accepted_at
  lib/
    rbac.ts                            # requireRole(), hasPermission() helpers
  app/
    page.tsx                           # Landing page (marketing, unauthenticated)
    (auth)/
      register/page.tsx                # Update: handle invite token
    (dashboard)/
      onboarding/
        page.tsx                       # Onboarding wizard
        actions.ts                     # Onboarding actions (create tenant settings)
    share/
      [token]/page.tsx                 # Already created in Phase 2, polish here
  components/
    landing/
      hero-section.tsx
      features-section.tsx
      pricing-section.tsx
      footer-section.tsx
    onboarding/
      onboarding-wizard.tsx            # Multi-step wizard
      company-step.tsx
      logo-step.tsx
      first-product-step.tsx
    layout/
      app-sidebar.tsx                  # Update: show/hide items based on role
      app-header.tsx                   # Update: user menu, org switcher
    share/
      share-quote-view.tsx             # Branded public quote view
  __tests__/
    services/
      quote-service.test.ts
      product-service.test.ts
      customer-service.test.ts
    lib/
      pricing-engine.test.ts           # Migrate existing tests
      format-currency.test.ts
      format-number-to-words.test.ts
      generate-doc-number.test.ts
      rbac.test.ts
    e2e/
      auth.spec.ts                     # Register + login flow
      quote-crud.spec.ts               # Create, edit, delete, export quote
      product-crud.spec.ts
```

## Implementation Steps

### Step 1: Add tenant_invites schema

**`src/db/schema/tenant-invites.ts`**
- Fields: id, tenant_id (FK), email, role (memberRoleEnum), token (unique), expires_at, accepted_at (nullable), created_at
- Add to schema index

### Step 2: Create RBAC helper

**`src/lib/rbac.ts`** (~40 lines)
```ts
import { TenantContext } from "./tenant-context";

const ROLE_HIERARCHY = { OWNER: 4, ADMIN: 3, MEMBER: 2, VIEWER: 1 };

export function requireRole(ctx: TenantContext, minRole: keyof typeof ROLE_HIERARCHY) {
  if (ROLE_HIERARCHY[ctx.role] < ROLE_HIERARCHY[minRole]) {
    throw new Error("Bạn không có quyền thực hiện thao tác này");
  }
}

export function hasPermission(role: string, minRole: string): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}
```

### Step 3: Add RBAC to existing actions

Update all `actions.ts` files from Phase 2:
- Quote create/edit/delete: `requireRole(ctx, "MEMBER")`
- Product/Customer create/edit/delete: `requireRole(ctx, "MEMBER")`
- Settings update: `requireRole(ctx, "ADMIN")`
- Template create/delete: `requireRole(ctx, "ADMIN")`
- Invite user: `requireRole(ctx, "ADMIN")`
- Read operations: any role (VIEWER+)

### Step 4: Create invite flow

**`src/services/invite-service.ts`** (~60 lines)
- `createInvite(tenantId, email, role)` — generate token, store, return invite URL.
- `acceptInvite(token, userId)` — validate token, create tenant_member, mark accepted.
- `getInvites(tenantId)` — list pending invites.
- `revokeInvite(tenantId, inviteId)` — delete invite.

Update register page to handle `?invite=TOKEN` query param.

### Step 5: Create onboarding wizard

**`src/app/(dashboard)/onboarding/page.tsx`** — server component, redirect if tenant already configured.
**`src/components/onboarding/onboarding-wizard.tsx`** — client component, 3 steps.
- Step 1: Company name, slug (auto-generated from name). Updates tenant record.
- Step 2: Logo upload (optional). Uses same upload logic as settings.
- Step 3: Create first product (optional skip). Uses product-service.
- On complete: set `tenant.onboardingComplete = true` (add boolean field to tenants), redirect to `/quotes`.

### Step 6: Create landing page

**`src/app/page.tsx`** — if authenticated, redirect to dashboard. If not, show landing.
**`src/components/landing/hero-section.tsx`** — headline, subline, CTA buttons (Register/Login).
**`src/components/landing/features-section.tsx`** — 3-4 feature cards (Quote management, Templates, Multi-tenant, Export).
**`src/components/landing/pricing-section.tsx`** — placeholder pricing tiers.
**`src/components/landing/footer-section.tsx`** — simple footer.

### Step 7: Polish share page

**`src/app/share/[token]/page.tsx`** — fetch quote + tenant. Render branded view.
**`src/components/share/share-quote-view.tsx`** — display quote read-only with:
- Tenant logo at top
- Tenant primary_color for accents
- Quote details, items table, totals
- Download PDF button
- Responsive design for mobile viewing

### Step 8: Update sidebar/header for RBAC

**`src/components/layout/app-sidebar.tsx`**
- Pass user role from context
- Hide Settings nav item for VIEWER/MEMBER
- Hide Templates nav item for VIEWER

**`src/components/layout/app-header.tsx`**
- User dropdown menu: profile, switch org (if multi-tenant), logout
- Show current org name

### Step 9: UI Polish pass

- Add `tw-animate-css` transitions to page transitions
- Ensure all cards have consistent border-radius, shadows
- Responsive: sidebar collapses to mobile bottom nav on small screens
- Dark mode: ensure all custom colors use CSS variables
- Loading states: skeleton components for all list pages

### Step 10: Write unit tests

Migrate existing tests from `src/lib/__tests__/` to new paths:
- `src/__tests__/lib/pricing-engine.test.ts`
- `src/__tests__/lib/format-currency.test.ts`
- `src/__tests__/lib/format-number-to-words.test.ts`
- `src/__tests__/lib/generate-doc-number.test.ts`

New tests:
- `src/__tests__/lib/rbac.test.ts` — test role hierarchy, requireRole throws correctly
- `src/__tests__/services/quote-service.test.ts` — mock db, test tenant isolation
- `src/__tests__/services/product-service.test.ts`
- `src/__tests__/services/customer-service.test.ts`

### Step 11: Write e2e tests (Playwright)

- `e2e/auth.spec.ts` — register, login, logout
- `e2e/quote-crud.spec.ts` — create quote, add items, save, export PDF, verify download
- `e2e/product-crud.spec.ts` — create product, edit, delete

## TODO Checklist

- [ ] Add `tenant_invites` schema
- [ ] Create RBAC helper (`src/lib/rbac.ts`)
- [ ] Add RBAC checks to all actions
- [ ] Create invite service + actions
- [ ] Update register page for invite flow
- [ ] Create onboarding wizard
- [ ] Create landing page
- [ ] Polish share page with tenant branding
- [ ] Update sidebar/header for role-based nav
- [ ] UI polish pass (animations, dark mode, responsive)
- [ ] Migrate existing unit tests
- [ ] Write new unit tests (RBAC, services)
- [ ] Setup Playwright + write e2e tests
- [ ] Verify Lighthouse score > 90 for landing

## Success Criteria

- VIEWER cannot create/edit/delete anything
- MEMBER can CRUD quotes/products/customers
- ADMIN can manage settings + templates
- OWNER can invite users + manage org
- Invite link works: send -> register -> auto-join
- Onboarding flow completes and redirects to quotes
- Landing page loads fast (< 1s) and looks professional
- Share page shows tenant branding correctly
- All unit tests pass (`pnpm test`)
- All e2e tests pass

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| RBAC gaps | Audit every action file, add requireRole to each |
| Email for invites not set up | Fallback: copy-paste invite link (no email required) |
| E2e tests flaky | Use stable selectors, generous timeouts |

## Agent Instructions

**File ownership:** `src/lib/rbac.ts`, `src/db/schema/tenant-invites.ts`, `src/services/invite-service.ts`, `src/app/(dashboard)/onboarding/*`, `src/app/page.tsx` (landing), `src/components/landing/*`, `src/components/onboarding/*`, `src/components/share/*`, `src/__tests__/*`, `e2e/*`

**Shared modifications (coordinate with other agents):**
- Adding `requireRole()` calls to Phase 2/3 action files — OK to modify those files for RBAC only
- Updating sidebar/header — OK to modify layout components

**DO NOT touch:** `src/db/schema/*` (except adding tenant-invites), `src/services/quote-service.ts` (except RBAC wrappers in actions)

**Testing:** Run `pnpm test` after writing unit tests. Run `pnpm exec playwright test` after e2e.
