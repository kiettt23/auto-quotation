---
phase: 6
title: "Onboarding + Multi-Company Creation"
status: pending
effort: 1h
depends_on: [5]
---

# Phase 6: Onboarding + Multi-Company Settings

## Overview
Allow users to create additional companies after initial onboarding. Settings page becomes a normal per-tenant page (already is, just needs to work with tenant switching).

## Implementation Steps

### 1. Create Company page
**File:** `src/app/(dashboard)/create-company/page.tsx` (new)
**File:** `src/app/(dashboard)/create-company/actions.ts` (new)

Reuse onboarding wizard UI but simplified — just company name + slug step.

Action:
```ts
"use server";
export async function createCompanyAction(data: { name: string; slug: string }) {
  const session = /* get from auth */;

  // Validate slug format + uniqueness
  // Create tenant
  // Create tenant_member with OWNER role
  // Set active-tenant-id cookie to new tenant
  // Redirect to /onboarding (for the new tenant)
}
```

Key logic:
- Insert into `tenants` table with defaults
- Insert into `tenantMembers` with role=OWNER
- Set cookie to new tenant ID
- Redirect to `/onboarding` so user can complete setup for new company

### 2. Update onboarding flow
**File:** `src/app/(dashboard)/onboarding/page.tsx`

Currently checks `tenant.onboardingComplete` and redirects if true. This already works per-tenant since `getTenantContext()` now resolves from cookie.

No changes needed — the existing flow will work when cookie points to the new (incomplete) tenant.

### 3. Update middleware for onboarding redirect
**File:** `src/middleware.ts` (if exists, check)

Ensure that when a user's active tenant has `onboardingComplete = false`, they get redirected to `/onboarding` from any dashboard page. Check if this is already handled.

```
Grep: onboardingComplete|onboarding path=src/middleware
```

If not in middleware, the onboarding page itself handles it (redirects to /quotes if complete). The reverse redirect (force to onboarding if incomplete) may need to be added to the dashboard layout.

**File:** `src/app/(dashboard)/layout.tsx`
- After resolving tenant context, check if tenant.onboardingComplete is false
- If false and path !== /onboarding and path !== /create-company, redirect to /onboarding

### 4. Add nav item for create-company
The "Tạo công ty mới" link in TenantSwitcher (Phase 5) already points to `/create-company`. No nav-items.ts change needed — it's accessed only through the switcher dropdown.

### 5. Settings page — no changes needed
Settings page already works per-tenant via `getTenantContext()`. When user switches tenant, settings automatically shows that tenant's data. The ADMIN role check in nav-items.ts ensures only admins/owners see it.

### 6. Invite system per company
The existing invite system (`src/services/invite-service.ts`) already takes tenantId. When inviting from a specific company's settings, the active tenant context provides the correct tenantId.

Verify invite UI passes the current tenant context:
```
Grep: createInvite|inviteAction path=src
```

No changes expected — just verify the flow works with tenant switching.

## Todo
- [ ] Create /create-company page + action
- [ ] Add onboarding redirect guard in dashboard layout
- [ ] Test: create second company → onboarding → switch back to first
- [ ] Verify settings page works per-tenant after switch
- [ ] Verify invite system scoped to active tenant
- [ ] Compile check

## Success Criteria
- User can create new company from tenant switcher
- New company goes through onboarding
- Switching back to old company shows old data
- Settings is tenant-scoped
- Invites are tenant-scoped
- Compile passes
