---
phase: 3
title: "UI/UX Fixes"
status: pending
effort: 1.5h
depends_on: []
---

# Phase 3: UI/UX Fixes

## Issues Covered
C10, C11, C12, W9, W10, W11, naming inconsistencies

## Implementation Steps

### C10: Login page in English → Vietnamese
**Files:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- Translate all English text to Vietnamese
- Labels: Email, Password → Email, Mật khẩu
- Buttons: Sign In → Đăng nhập, Sign Up → Đăng ký
- Links: "Don't have an account?" → "Chưa có tài khoản?"
- Error messages: translate or keep generic Vietnamese error

### C11: AppHeader blank title on /dashboard
**File:** `src/components/layout/app-header.tsx:9-18`

Currently: pageTitles has `"/"` but not `"/dashboard"`. Dashboard route is `/dashboard`.

Fix: Add `/dashboard` entry:
```ts
const pageTitles: Record<string, string> = {
  "/dashboard": "Tổng quan",  // ADD — was missing
  "/quotes": "Báo giá",
  ...
};
```
Remove the `"/"` entry (not used as a route).

### C12: Search/Ctrl+K button non-functional → hide
**File:** `src/components/layout/app-header.tsx:34-57`

Remove both search buttons (desktop and mobile) entirely. They reference "Phase 08" which is not implemented.

Replace with empty `<div className="ml-auto" />` or just remove the entire search block.

### Naming inconsistency: "chứng từ" → "tài liệu"
**File:** `src/components/layout/app-header.tsx`
- Change `"/templates": "Mẫu chứng từ"` → `"Mẫu tài liệu"`
- Change `"/documents": "Chứng từ"` → `"Tài liệu"`

**File:** `src/app/(dashboard)/templates/page.tsx`
- Change h1 from "Mẫu chứng từ" → "Mẫu tài liệu"

**File:** `src/app/(dashboard)/documents/page.tsx`
- Change h1 from "Chứng từ" → "Tài liệu"

**Also grep for other occurrences:**
```
Grep: chứng từ
```
Update all UI-facing strings. Keep internal variable names as-is (documentTemplates, documents).

### W9: Auth pages hardcoded colors (breaks dark mode)
**Files:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- Replace hardcoded hex colors with Tailwind semantic classes
- `text-[#xxx]` → `text-foreground`, `text-muted-foreground`
- `bg-[#xxx]` → `bg-background`, `bg-card`
- `border-[#xxx]` → `border-border`

### W10: Auth pages no loading.tsx/error.tsx
**Files to create:**
- `src/app/(auth)/loading.tsx` — simple spinner/skeleton
- `src/app/(auth)/error.tsx` — "use client" error boundary with retry button

Keep minimal — a centered spinner and a generic error message in Vietnamese.

### W11: MobileBottomNav doesn't filter by RBAC
**File:** `src/components/layout/mobile-bottom-nav.tsx`
- Currently shows items based on `showInBottomNav` only
- Add `role` prop (same as AppSidebar)
- Filter with `hasPermission(role, item.minRole ?? "VIEWER")`
- Pass role from dashboard layout

**File:** `src/app/(dashboard)/layout.tsx`
- Pass `role` to `<MobileBottomNav role={role} />`

## Todo
- [ ] C10: Translate login/register pages to Vietnamese
- [ ] C11: Add /dashboard to pageTitles
- [ ] C12: Remove search button from AppHeader
- [ ] Fix naming: "chứng từ" → "tài liệu" everywhere in UI
- [ ] W9: Replace hardcoded colors with Tailwind semantic classes
- [ ] W10: Add loading.tsx and error.tsx for auth routes
- [ ] W11: Add RBAC filtering to MobileBottomNav
- [ ] Compile check

## Success Criteria
- All UI text consistent Vietnamese
- No broken/placeholder buttons visible
- Dark mode works on auth pages
- Mobile nav respects RBAC
- Compile passes
