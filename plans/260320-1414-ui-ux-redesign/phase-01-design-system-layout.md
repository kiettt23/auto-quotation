# Phase 1: Design System & Layout Shell

## Priority: P1 | Status: pending | Effort: 3h

## Overview
Establish design tokens, font, and redesign the app shell (sidebar, mobile nav, layout).

## Key Changes

### 1. Add DM Sans font
**File:** `src/app/layout.tsx` (root layout)
- Import `DM_Sans` from `next/font/google`
- Apply to `<body>` with `font.className`
- Weights: 400, 500, 600, 700

### 2. Update CSS variables / globals
**File:** `src/app/globals.css`
- Add CSS custom properties matching mockup:
  ```css
  :root {
    --accent: 99 102 241;        /* indigo-500 */
    --accent-light: 238 242 255; /* indigo-50 */
  }
  ```

### 3. Redesign AppLogo
**File:** `src/components/layout/app-logo.tsx`
- Change logo icon background from `bg-blue-600` to `bg-gradient-to-br from-indigo-500 to-violet-500`
- Update circle accent in SVG from `#3B82F6` to `#6366F1`
- Rounded-[10px] instead of rounded-lg

### 4. Update nav-items config
**File:** `src/components/layout/nav-items.ts`
- Add optional `badge?: number` field to nav item type
- "Trang chủ" becomes "Tổng quan"
- Keep same icons (Home -> LayoutGrid from lucide for dashboard feel)

### 5. Redesign AppSidebar
**File:** `src/components/layout/app-sidebar.tsx`
Current: blue-50/blue-600 active state, simple logout button
New:
- Active nav: `bg-indigo-50 text-indigo-600 font-semibold` with `rounded-[10px]`
- Hover: `hover:bg-indigo-50 hover:text-indigo-600`
- Nav badge support: `<span className="ml-auto rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">`
- Divider before Cai dat: `<div className="my-3 h-px bg-slate-200" />`
- Spacer: `<div className="flex-1" />` before user card
- **User card** at bottom: avatar gradient circle + name/email
  - Needs session data: add `session` prop from layout or use auth hook
  - Fallback: initials from user name
  - Classes: `flex items-center gap-2.5 rounded-[10px] border border-slate-200 bg-slate-50 p-2.5`
- Remove standalone logout button (move to user card dropdown or keep minimal)

### 6. Update AppLayout
**File:** `src/app/(app)/layout.tsx`
- Pass session user info to AppSidebar as prop
- Keep `bg-slate-50` on wrapper (matches mockup `--bg: #f8fafc`)
- Main content: add `overflow-y-auto` class

### 7. Update MobileBottomNav
**File:** `src/components/layout/mobile-bottom-nav.tsx`
- Active color: `text-indigo-600` (was `text-blue-600`)
- Show max 5 items on mobile (hide Cai dat, add it to user menu)

## New Files
- `src/components/layout/sidebar-user-card.tsx` — extracted user card component (~40 lines)

## Related Code
- `src/hooks/use-active-path.ts` — no changes needed
- `src/lib/auth/auth-client.ts` — signOut stays same

## Todo
- [ ] Add DM Sans font to root layout
- [ ] Update CSS variables in globals.css
- [ ] Update AppLogo gradient colors
- [ ] Update nav-items (rename Trang chu -> Tong quan, add badge type)
- [ ] Redesign AppSidebar with new colors, user card, divider
- [ ] Create sidebar-user-card.tsx
- [ ] Pass session to sidebar from layout
- [ ] Update MobileBottomNav colors
- [ ] Test responsive: sidebar hidden on mobile, bottom nav on mobile

## Tailwind Classes Reference
```
Nav item base:    flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13.5px] font-medium transition-colors
Nav item active:  bg-indigo-50 text-indigo-600 font-semibold
Nav item hover:   hover:bg-indigo-50 hover:text-indigo-600
Nav item default: text-slate-500
Sidebar:          w-60 flex-col border-r border-slate-200 bg-white px-4 py-4
User card:        flex items-center gap-2.5 rounded-[10px] border border-slate-200 bg-slate-50 p-2.5
Avatar:           h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-bold flex items-center justify-center
```
