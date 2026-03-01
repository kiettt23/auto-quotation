# Phase 02: App Shell & Layout

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - App Shell](../reports/wireframes-auto-quotation.md#1-app-shell-desktop-1440px)
- [Wireframe - Mobile Bottom Nav](../reports/wireframes-auto-quotation.md#12-mobile-views-375px)
- [Design System - Layout](../reports/design-system-auto-quotation.md#3-spacing--layout)

## Overview

- **Priority:** P1 - Required before all UI phases
- **Status:** Pending
- **Effort:** 3h
- **Description:** Build the dashboard shell with collapsible sidebar (desktop), bottom tab bar (mobile), sticky header, and global keyboard shortcut infrastructure.

## Key Insights

- shadcn/ui `sidebar` component handles collapse/expand with animation built-in
- Mobile breakpoint at 768px switches from sidebar to bottom tab bar
- Header is sticky (h-14) with page title + search trigger + quick actions
- Ctrl+K opens a global command palette (implemented in Phase 08 with product search)
- All nav items use Vietnamese labels with Lucide icons
- Content area uses `max-w-7xl mx-auto px-6 py-6`

## Requirements

### Functional
- Sidebar with 5 nav items: Tong quan, Bao gia, San pham, Khach hang, Cai dat
- Sidebar collapses to icon-only (w-16) on tablet, fully hidden on mobile
- Bottom tab bar on mobile (< 768px) with 4 items: Tong quan, Bao gia, San pham, Khach hang
- Sticky header showing current page title + search trigger
- Active route highlighting in sidebar/bottom nav
- Keyboard shortcut foundation (Ctrl+K placeholder)

### Non-Functional
- Smooth 200ms sidebar collapse animation
- No layout shift when sidebar toggles
- Mobile-first responsive: 375px -> 768px -> 1024px -> 1440px

## Architecture

### Layout Hierarchy

```
src/app/(dashboard)/layout.tsx
├── SidebarProvider (shadcn)
│   ├── AppSidebar (desktop/tablet)
│   │   ├── SidebarHeader -> Logo/brand
│   │   ├── SidebarContent -> Nav items
│   │   └── SidebarFooter -> Settings link
│   └── SidebarInset
│       ├── AppHeader (sticky, h-14)
│       │   ├── SidebarTrigger (collapse toggle)
│       │   ├── Page title (from route)
│       │   └── Search trigger button (Ctrl+K)
│       └── main (content area)
│           └── {children} (max-w-7xl mx-auto px-6 py-6)
├── MobileBottomNav (fixed bottom, visible < 768px)
└── Toaster (sonner)
```

### Navigation Items

| Label | Icon | Route | Bottom Nav |
|-------|------|-------|------------|
| Tong quan | LayoutDashboard | / | Yes |
| Bao gia | FileText | /bao-gia | Yes |
| San pham | Package | /san-pham | Yes |
| Khach hang | Users | /khach-hang | Yes |
| Cai dat | Settings | /cai-dat | No (sidebar only) |

## Related Code Files

### Files to Create

```
src/
├── components/
│   └── layout/
│       ├── app-sidebar.tsx          # Sidebar with nav items, logo, collapse
│       ├── app-header.tsx           # Sticky header with title, search trigger
│       ├── mobile-bottom-nav.tsx    # Bottom tab bar for < 768px
│       └── nav-items.ts            # Shared nav item definitions (label, icon, route)
├── app/
│   └── (dashboard)/
│       └── layout.tsx               # Dashboard layout composing sidebar + header + content
└── lib/
    └── hooks/
        └── use-keyboard-shortcuts.ts  # Global keyboard shortcut hook
```

### Files to Modify

```
src/app/layout.tsx                    # Add Toaster (sonner) provider
```

## Implementation Steps

1. **Create nav items config** (`src/components/layout/nav-items.ts`)
   - Array of `{ label, icon, href, showInBottomNav }` objects
   - Export as constant for reuse in sidebar and bottom nav

2. **Build AppSidebar** (`src/components/layout/app-sidebar.tsx`)
   - Use shadcn `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`
   - Logo in SidebarHeader: text "Auto Quotation" (collapsed: icon only)
   - Map nav items to menu buttons with Lucide icons
   - Settings at bottom via SidebarFooter
   - Active state via `usePathname()` matching

3. **Build AppHeader** (`src/components/layout/app-header.tsx`)
   - Sticky header: `h-14 border-b bg-background/95 backdrop-blur`
   - Left: `SidebarTrigger` (hamburger icon) + breadcrumb/page title
   - Right: Search button with "Ctrl+K" badge, placeholder for future actions
   - Page title derived from pathname mapping

4. **Build MobileBottomNav** (`src/components/layout/mobile-bottom-nav.tsx`)
   - Fixed bottom bar: `fixed bottom-0 left-0 right-0 h-16 border-t bg-background`
   - Show only on `md:hidden` (< 768px)
   - 4 items: icon + label, active state highlighting
   - Use `Link` from `next/link` with `usePathname()` for active detection

5. **Compose dashboard layout** (`src/app/(dashboard)/layout.tsx`)
   - Wrap children in `SidebarProvider`
   - Render AppSidebar + SidebarInset(AppHeader + main + children)
   - Render MobileBottomNav outside SidebarProvider
   - Add `pb-16 md:pb-0` to main content to account for mobile bottom nav

6. **Add Toaster to root layout** (`src/app/layout.tsx`)
   - Import and render `<Toaster />` from sonner

7. **Create keyboard shortcuts hook** (`src/lib/hooks/use-keyboard-shortcuts.ts`)
   - Listen for Ctrl+K (search), Ctrl+N (new quote), Ctrl+S (save)
   - Use `useEffect` with `keydown` event listener
   - Prevent default browser behavior for intercepted shortcuts
   - Export hook for use in layout

8. **Add padding for bottom nav on mobile**
   - Content area: `pb-20 md:pb-0` so content doesn't hide behind bottom nav

## Todo List

- [ ] Create nav-items.ts config with all 5 navigation items
- [ ] Build AppSidebar component with shadcn sidebar primitives
- [ ] Build AppHeader component with sticky positioning and search trigger
- [ ] Build MobileBottomNav component with 4 bottom tabs
- [ ] Compose (dashboard)/layout.tsx with sidebar + header + content + bottom nav
- [ ] Add Toaster to root layout
- [ ] Create use-keyboard-shortcuts hook foundation
- [ ] Test responsive behavior: sidebar collapse at 768px, bottom nav at < 768px
- [ ] Verify active route highlighting works on all nav items

## Success Criteria

- Desktop (1440px): sidebar expanded (w-60), header visible, content centered
- Tablet (768-1023px): sidebar collapsed (w-16, icon only), content full width
- Mobile (< 768px): no sidebar, bottom tab bar visible, content full width
- Clicking nav items navigates to correct routes
- Active route highlighted in both sidebar and bottom nav
- Sidebar collapse/expand animates smoothly (200ms)
- Ctrl+K shortcut registers (placeholder behavior)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| shadcn sidebar complex API | Slow implementation | Follow shadcn docs closely; use their sidebar example |
| Bottom nav overlaps content | UX issue on mobile | Add padding-bottom to content area on mobile |
| Layout hydration mismatch | Console errors | Use `usePathname()` in client components only |

## Next Steps

- Phase 03: Settings page fills into `/cai-dat` route
- Phase 04: Product management fills into `/san-pham` route
- All subsequent phases build content within this shell
