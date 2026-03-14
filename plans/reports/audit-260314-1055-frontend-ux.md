# Frontend & UX Audit

**Date:** 2026-03-14 | **Branch:** rewrite/production-saas

## Route Coverage

| Nav Item | href | Page exists? | Loading? | Error? | Page title matches nav? |
|----------|------|-------------|----------|--------|------------------------|
| Tong quan | /dashboard | Yes | Yes (layout-level) | Yes (layout-level) | Yes - "Tong quan" |
| Bao gia | /quotes | Yes | Yes | Yes (layout) | Yes - "Bao gia" |
| San pham | /products | Yes | Yes | Yes (layout) | Yes - "San pham" |
| Khach hang | /customers | Yes | Yes | Yes (layout) | Yes - "Khach hang" |
| Mau tai lieu | /templates | Yes | Yes | Yes (layout) | **MISMATCH** - nav says "Mau tai lieu", header says "Mau chung tu", page h1 says "Mau chung tu" |
| Tai lieu | /documents | Yes | Yes | Yes (layout) | **MISMATCH** - nav says "Tai lieu", header says "Chung tu", page h1 says "Chung tu" |
| Cai dat | /settings | Yes | Yes | Yes (layout) | Yes - "Cai dat" |

### Non-nav routes

| Route | Page exists? | Loading? | Error? | Notes |
|-------|-------------|----------|--------|-------|
| / (landing) | Yes | No | Yes (global) | Redirects auth users to /dashboard |
| /login | Yes | No | No | No loading/error boundaries |
| /register | Yes | No | No | No loading/error boundaries |
| /onboarding | Yes | No (inherits dashboard) | Yes (inherits) | OK |
| /quotes/new | Yes | No (inherits) | Yes (inherits) | OK |
| /quotes/[id] | Yes | No (inherits) | Yes (inherits) | OK |
| /templates/new | Yes | No (inherits) | Yes (inherits) | OK |
| /templates/[id] | Yes | No (inherits) | Yes (inherits) | OK |
| /documents/new | Yes | No (inherits) | Yes (inherits) | OK |
| /documents/[id] | Yes | No (inherits) | Yes (inherits) | OK |
| /share/[token] | Yes | No | Yes (global) | Public page, no auth |

## Critical Issues

1. **Login page entirely in English** — Title "Sign in", labels "Email"/"Password", button "Sign in"/"Signing in...", link "No account? Register". Every other page is Vietnamese. This is a jarring language inconsistency for a Vietnamese SaaS product.

2. **MobileBottomNav ignores RBAC** — `mobile-bottom-nav.tsx` filters only by `showInBottomNav` but does NOT check `minRole`. AppSidebar correctly filters by role via `hasPermission()`, but the bottom nav shows items regardless of role. Currently bottom nav only shows Dashboard/Quotes/Products/Customers (all VIEWER-level), so no items with `minRole` restrictions leak through the bottom nav. **Not exploitable now but fragile** — if any restricted item gets `showInBottomNav: true` in the future, it will bypass RBAC.

3. **Search button is non-functional** — `app-header.tsx` lines 39-42 and 53-55: onClick handlers are empty comments `// Phase 08: open command palette`. Ctrl+K does nothing. The search button is visible on every page but clicking it has zero effect.

## High Priority

4. **Auth pages have no loading.tsx or error.tsx** — `/login` and `/register` have no error boundaries. If auth API fails, user sees raw error. The auth layout has no loading state either.

5. **AppHeader pageTitles missing routes** — `pageTitles` map lacks entries for:
   - `/dashboard` (would show empty string; "/" maps to "Tong quan" but the actual route is `/dashboard`)
   - `/templates/new`, `/templates/[id]`
   - `/documents/new`, `/documents/[id]`
   - `/onboarding`
   - For `/dashboard`, header shows empty title because pathname is `/dashboard` not `/`. The fallback only handles `/quotes/*`.

6. **Auth layout uses hardcoded colors** — `bg-gray-50`, `bg-white`, `text-gray-700`, `text-gray-900` etc. in login and register pages. Rest of app uses shadcn theme tokens (`bg-background`, `text-foreground`). Dark mode would break auth pages.

## Naming Inconsistencies

| Location | Term used | Expected (consistent) |
|----------|-----------|----------------------|
| nav-items.ts | "Mau tai lieu" | -- |
| app-header.tsx pageTitles | "Mau chung tu" | Should match nav: "Mau tai lieu" |
| templates/page.tsx h1 | "Mau chung tu" | Should match nav: "Mau tai lieu" |
| nav-items.ts | "Tai lieu" | -- |
| app-header.tsx pageTitles | "Chung tu" | Should match nav: "Tai lieu" |
| documents/page.tsx h1 | "Chung tu" | Should match nav: "Tai lieu" |
| Login page | English throughout | Should be Vietnamese |
| Register page | Vietnamese | Correct |
| Register error | "Dang ky that bai" | Vietnamese, good |
| Login error | "Sign in failed" / "An unexpected error occurred" | Should be Vietnamese |

## UX Gaps

7. **No not-found.tsx pages** — Missing custom 404 pages for dashboard routes. When `notFound()` is called (quotes/[id], templates/[id], documents/[id]), users see Next.js default 404.

8. **No empty state handling visible at page level** — List pages (quotes, products, customers, templates, documents) delegate to client components. Empty state handling depends on those client components (not audited here, but the server pages pass empty arrays on error silently without toast or error indication).

9. **Header "/dashboard" shows blank title** — pageTitles maps "/" to "Tong quan" but the dashboard route is "/dashboard". Users see an empty header title on the main dashboard page.

10. **Landing page has no navigation header** — The landing page (`page.tsx`) renders sections directly in a `<div>` with no top nav bar. No way to scroll to sections, no sticky header with login/register links (those links are only in the hero CTA buttons).

11. **Share page has no loading state** — `/share/[token]` is outside dashboard layout, inherits only global error boundary. No loading skeleton for public share view.

## Accessibility

12. **Login form inputs lack `id` attributes** — Labels use visual association only (block layout), not `htmlFor`+`id` binding. Screen readers may not associate labels with inputs.

13. **Register form same issue** — Labels not linked to inputs via `htmlFor`.

14. **Mobile bottom nav lacks `aria-current`** — Active state is visual only (color change), no `aria-current="page"` for screen readers.

15. **Landing page sections lack landmark roles** — No `<main>`, `<nav>`, or `<footer>` semantic elements (sections use `<section>` which is fine, but no `<main>` wrapper).

## Positive Observations

- All nav items have corresponding pages
- Dashboard layout properly uses `pb-20 md:pb-6` to avoid mobile bottom nav overlap
- Loading skeletons exist for all main list pages
- Error boundary at dashboard layout level catches all dashboard route errors in Vietnamese
- Global error boundary exists at app root
- Sidebar correctly implements RBAC filtering
- Register page properly uses Suspense for `useSearchParams()`
- Share page limits tenant data exposure (only public fields)
- Onboarding page correctly redirects if already completed
- Responsive design: sidebar collapses to icon mode, bottom nav hidden on md+

## Recommended Actions

1. **[Critical]** Translate login page to Vietnamese — match register page's language
2. **[Critical]** Fix AppHeader pageTitles: add `/dashboard` entry, add fallback patterns for templates/documents sub-routes
3. **[High]** Unify naming: decide between "tai lieu"/"chung tu" terminology, update nav-items.ts OR page titles to match
4. **[High]** Add `htmlFor`/`id` to auth form labels
5. **[Medium]** Add RBAC filtering to MobileBottomNav (pass role prop from layout)
6. **[Medium]** Add not-found.tsx to dashboard route group
7. **[Medium]** Replace hardcoded colors in auth pages with shadcn theme tokens
8. **[Medium]** Add loading/error boundaries for auth routes
9. **[Low]** Add landing page top nav with section anchors
10. **[Low]** Add `aria-current="page"` to active mobile nav item
11. **[Low]** Implement or hide the search/Ctrl+K button until Phase 08

## Files Reviewed

- `src/components/layout/nav-items.ts`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/app-header.tsx`
- `src/components/layout/mobile-bottom-nav.tsx`
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/loading.tsx`
- `src/app/(dashboard)/error.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/customers/page.tsx`
- `src/app/(dashboard)/customers/loading.tsx`
- `src/app/(dashboard)/products/page.tsx`
- `src/app/(dashboard)/quotes/page.tsx`
- `src/app/(dashboard)/quotes/new/page.tsx`
- `src/app/(dashboard)/quotes/[id]/page.tsx`
- `src/app/(dashboard)/templates/page.tsx`
- `src/app/(dashboard)/templates/new/page.tsx`
- `src/app/(dashboard)/templates/[id]/page.tsx`
- `src/app/(dashboard)/documents/page.tsx`
- `src/app/(dashboard)/documents/new/page.tsx`
- `src/app/(dashboard)/documents/[id]/page.tsx`
- `src/app/(dashboard)/onboarding/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/share/[token]/page.tsx`
- `src/components/landing/hero-section.tsx`

## Unresolved Questions

- What is the intended terminology: "tai lieu" or "chung tu"? Nav says one thing, pages say another. Need product decision.
- Is the search/command palette (Phase 08) planned for this release? If not, the non-functional button should be hidden.
- Should the landing page have a proper navbar with section anchors?
