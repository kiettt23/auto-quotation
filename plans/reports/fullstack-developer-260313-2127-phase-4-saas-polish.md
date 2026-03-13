# Phase Implementation Report

## Executed Phase
- Phase: Phase 4 — SaaS Polish
- Plan: none (direct task)
- Status: completed

## Files Modified
- `src/lib/tenant-context.ts` — added `role` field to `TenantContext`, returned from membership query
- `src/components/layout/nav-items.ts` — added `minRole` field to `NavItem`, added Templates/Documents entries with ADMIN gate
- `src/components/layout/app-sidebar.tsx` — accepts `role` prop, filters nav items via `hasPermission`
- `src/app/(dashboard)/layout.tsx` — async server component, fetches tenant context, passes `role` to `AppSidebar`
- `src/app/(dashboard)/quotes/actions.ts` — `requireRole(MEMBER)` on saveQuote, deleteQuote, cloneQuote, updateQuoteStatus
- `src/app/(dashboard)/products/actions.ts` — `requireRole(MEMBER)` on save/delete
- `src/app/(dashboard)/customers/actions.ts` — `requireRole(MEMBER)` on save/delete
- `src/app/(dashboard)/settings/actions.ts` — `requireRole(ADMIN)` on all write actions
- `src/app/(dashboard)/templates/actions.ts` — `requireRole(ADMIN)` on create/update/delete
- `src/app/(dashboard)/documents/actions.ts` — `requireRole(MEMBER)` on create/update
- `src/db/schema/index.ts` — added `tenant-invites` re-export
- `src/app/(auth)/register/page.tsx` — invite token support via `?invite=TOKEN`, uses server action

## Files Created
- `src/lib/rbac.ts` — `requireRole` (throws) + `hasPermission` (bool), OWNER>ADMIN>MEMBER>VIEWER hierarchy
- `src/db/schema/tenant-invites.ts` — `tenant_invites` table: id, tenantId, email, role, token (unique), expiresAt, acceptedAt, createdAt
- `src/services/invite-service.ts` — createInvite, acceptInvite, getInvites, revokeInvite
- `src/app/(auth)/register/actions.ts` — `acceptInviteAction` server action wrapper
- `src/app/(dashboard)/onboarding/actions.ts` — saveCompanyStep, saveFirstProduct, completeOnboarding
- `src/app/(dashboard)/onboarding/page.tsx` — server component, redirects if onboardingComplete
- `src/components/onboarding/onboarding-wizard.tsx` — 3-step client wizard (company, product, complete)
- `src/app/page.tsx` — landing page (redirect to /quotes if authed, else show landing)
- `src/components/landing/hero-section.tsx`
- `src/components/landing/features-section.tsx`
- `src/components/landing/pricing-section.tsx`
- `src/components/landing/footer-section.tsx`
- `src/app/share/[token]/page.tsx` — public share page, no auth required
- `src/components/share/share-quote-view.tsx` — branded read-only quote view

## Tasks Completed
- [x] RBAC helper with role hierarchy
- [x] getTenantContext returns role
- [x] RBAC guards on all write actions (MEMBER+ or ADMIN+ as appropriate)
- [x] tenant_invites schema + re-export
- [x] Invite service (create, accept, list, revoke)
- [x] Onboarding wizard (3 steps: company, product, complete)
- [x] Landing page with hero, features, pricing, footer
- [x] Public share page with tenant branding
- [x] Sidebar RBAC filtering (Settings/Templates: ADMIN+ only)
- [x] Dashboard layout passes role to sidebar
- [x] Register page handles ?invite=TOKEN

## Tests Status
- Type check: pass (tsc clean)
- Build: pass — `pnpm build` succeeds, 25 routes generated, 0 errors

## Issues Encountered
- `invite-service.ts` initially had `"use server"` — removed since it's a plain service; wrapped call via `register/actions.ts` server action
- Products schema uses `code` (required, notNull) — onboarding auto-generates code from product name
- No migration needed for `tenant_invites` table — schema file created; migration must be run separately via `pnpm db:migrate`

## Next Steps
- Run `pnpm db:migrate` (or `drizzle-kit push`) to create `tenant_invites` table in DB
- Wire onboarding redirect: middleware or dashboard home page should redirect to `/onboarding` if `!tenant.onboardingComplete`
- Add invite management UI in Settings page (list pending invites, send new invite)

## Unresolved Questions
- Should the root `/` dashboard page (overview) redirect to `/onboarding` when onboarding is incomplete, or should middleware handle it?
- PDF download button on share page not yet wired — requires auth-free export endpoint or public token-based export route
