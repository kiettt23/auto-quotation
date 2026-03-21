---
title: "Full App UI/UX Redesign - Modern SaaS Style"
description: "Redesign all pages with Vercel/Stripe-inspired design: gradient sidebar, stat cards, inline table actions, DM Sans font"
status: pending
priority: P1
effort: 12h
branch: staging
tags: [ui, ux, redesign, tailwind, shadcn]
created: 2026-03-20
---

# UI/UX Redesign - Modern SaaS Style

Reference mockup: `d:\tmp\ui-demo-modern-saas.html`

## Design Tokens (New)
- **Font**: DM Sans (add via next/font/google)
- **Accent**: indigo-500 (#6366f1) + violet-500 gradient
- **Accent light**: indigo-50 (#eef2ff)
- **Bg**: slate-50, Surface: white, Border: slate-200
- **Rounded**: `rounded-xl` (14px) for cards, `rounded-[10px]` for nav items
- **Stat card**: gradient top-border on hover

## Phases

| # | Phase | Status | Effort | Files |
|---|-------|--------|--------|-------|
| 1 | [Design system & layout shell](phase-01-design-system-layout.md) | pending | 3h | globals.css, layout, sidebar, mobile-nav, logo, nav-items |
| 2 | [Dashboard page](phase-02-dashboard.md) | pending | 3h | page.tsx, stat cards, recent docs table |
| 3 | [Documents page](phase-03-documents.md) | pending | 2h | document-list-client, document-row-card |
| 4 | [CRUD list pages](phase-04-crud-list-pages.md) | pending | 2h | products, customers, companies |
| 5 | [Settings & detail pages](phase-05-settings-detail.md) | pending | 2h | settings, document detail/form |

## Key Decisions
- Replace blue-600 accent with indigo-500/violet-500 gradient throughout
- Add user card to sidebar bottom (requires session data pass-through)
- Dashboard: add stat cards (server component fetching counts)
- Document list: convert from row cards to proper data table with inline actions
- All list pages: add toolbar tabs + search pattern from mockup
- Keep shadcn Table, Tabs, Badge, Button, DropdownMenu components
