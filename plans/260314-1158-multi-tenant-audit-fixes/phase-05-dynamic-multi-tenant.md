---
phase: 5
title: "Dynamic Multi-Tenant Switching"
status: pending
effort: 2.5h
depends_on: [1, 2]
---

# Phase 5: Dynamic Multi-Tenant Switching

## Overview
Transform the "fake" single-tenant resolution (picks FIRST membership) into a fully dynamic system where users can belong to multiple companies and switch between them.

## Current State
- `getTenantContext()` in `src/lib/tenant-context.ts` queries `tenantMembers` with `findFirst` — always returns first membership
- No UI to switch tenants
- No cookie/URL storing active tenant
- Settings page tied to the single auto-resolved tenant

## Architecture Decision

**Active tenant stored in:** Cookie (`active-tenant-id`)

Why cookie over URL prefix:
- No route restructuring needed (no `/[tenantSlug]/dashboard` rewrites)
- Works with existing server actions (cookies readable server-side)
- Simple to set/read with `cookies()` from `next/headers`
- Middleware can validate and redirect if cookie is stale

## Implementation Steps

### 1. Update getTenantContext() to use cookie
**File:** `src/lib/tenant-context.ts`

```ts
import { cookies } from "next/headers";

export async function getTenantContext(): Promise<TenantContext> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthenticated");

  const userId = session.user.id;
  const cookieStore = await cookies();
  const activeTenantId = cookieStore.get("active-tenant-id")?.value;

  // If cookie set, verify membership
  if (activeTenantId) {
    const membership = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.userId, userId),
        eq(tenantMembers.tenantId, activeTenantId)
      ),
      with: { tenant: true },
    });
    if (membership) {
      return {
        userId,
        tenantId: membership.tenantId,
        tenantSlug: membership.tenant.slug,
        role: membership.role,
      };
    }
    // Cookie stale — fall through to default
  }

  // Fallback: pick first membership, set cookie
  const membership = await db.query.tenantMembers.findFirst({
    where: eq(tenantMembers.userId, userId),
    with: { tenant: true },
  });
  if (!membership) throw new Error("No tenant found for user");

  // Set cookie for future requests
  cookieStore.set("active-tenant-id", membership.tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return {
    userId,
    tenantId: membership.tenantId,
    tenantSlug: membership.tenant.slug,
    role: membership.role,
  };
}
```

### 2. Create tenant switching action
**File:** `src/app/(dashboard)/actions.ts` (new)

```ts
"use server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { tenantMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function switchTenantAction(tenantId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthenticated");

  // Verify user is member of target tenant
  const membership = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.userId, session.user.id),
      eq(tenantMembers.tenantId, tenantId)
    ),
  });
  if (!membership) throw new Error("Not a member of this tenant");

  const cookieStore = await cookies();
  cookieStore.set("active-tenant-id", tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect("/dashboard");
}
```

### 3. Create getUserTenants() helper
**File:** `src/lib/tenant-context.ts` (add function)

```ts
export async function getUserTenants(userId: string) {
  return db.query.tenantMembers.findMany({
    where: eq(tenantMembers.userId, userId),
    with: { tenant: true },
  });
}
```

### 4. Create TenantSwitcher component
**File:** `src/components/layout/tenant-switcher.tsx` (new)

A dropdown in the sidebar header showing:
- Current company name + logo
- List of other companies user belongs to
- "Tạo công ty mới" (Create new company) button at bottom

Use shadcn `DropdownMenu` or `Popover`:
```tsx
"use client";

import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { switchTenantAction } from "@/app/(dashboard)/actions";

type TenantInfo = {
  tenantId: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

type Props = {
  currentTenantId: string;
  tenants: TenantInfo[];
};

export function TenantSwitcher({ currentTenantId, tenants }: Props) {
  const current = tenants.find(t => t.tenantId === currentTenantId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-accent">
          <Building2 className="size-4" />
          <span className="flex-1 truncate text-left text-sm font-medium">
            {current?.name ?? "Chọn công ty"}
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {tenants.map(t => (
          <DropdownMenuItem
            key={t.tenantId}
            onClick={() => {
              if (t.tenantId !== currentTenantId) {
                switchTenantAction(t.tenantId);
              }
            }}
          >
            {t.name}
            {t.tenantId === currentTenantId && " ✓"}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/create-company">
            <Plus className="mr-2 size-4" />
            Tạo công ty mới
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 5. Integrate TenantSwitcher into AppSidebar
**File:** `src/components/layout/app-sidebar.tsx`

- Add props: `currentTenantId`, `tenants` (list of user's memberships)
- Replace the static "Auto Quotation" header with `<TenantSwitcher />`

**File:** `src/app/(dashboard)/layout.tsx`
- Fetch user's tenant memberships via `getUserTenants(ctx.userId)`
- Pass to `<AppSidebar tenants={...} currentTenantId={ctx.tenantId} role={ctx.role} />`

### 6. Clear cookie on logout
**File:** `src/auth/index.ts` or logout action
- On sign-out, delete the `active-tenant-id` cookie
- Better Auth has `onSignOut` hook or handle in the logout action

## Data Flow

```
User clicks tenant in switcher
  → switchTenantAction(tenantId)
    → verify membership
    → set cookie "active-tenant-id"
    → redirect("/dashboard")
      → layout calls getTenantContext()
        → reads cookie → resolves correct tenant
        → all child pages get scoped data
```

## Todo
- [ ] Update getTenantContext() to read cookie
- [ ] Add getUserTenants() helper
- [ ] Create switchTenantAction
- [ ] Create TenantSwitcher component
- [ ] Integrate into AppSidebar header
- [ ] Update dashboard layout to pass tenant list
- [ ] Clear cookie on logout
- [ ] Test: switch tenant → all pages show correct data
- [ ] Compile check

## Risk Assessment
- **Cookie not set on first visit**: Handled by fallback to first membership
- **Stale cookie (removed from tenant)**: Handled by membership verification + fallback
- **Server actions and cookies**: `cookies()` is available in server actions in App Router — confirmed

## Success Criteria
- User can see all their companies in sidebar dropdown
- Switching company changes all data across the app
- Cookie persists across page reloads
- Fallback works for new users with single tenant
- Compile passes
