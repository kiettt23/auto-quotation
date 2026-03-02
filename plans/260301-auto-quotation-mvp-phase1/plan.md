---
title: "Auto Quotation App - Phase 1 MVP"
description: "Quotation automation app for telecom industry - create, manage, and export professional quotes in under 5 minutes"
status: completed
priority: P1
effort: 48h
branch: main
tags: [nextjs, prisma, postgresql, shadcn-ui, quotation, telecom, mvp]
created: 2026-03-01
---

# Auto Quotation App - Phase 1 MVP

## Goal

Reduce quote creation time from 15-30 min to under 5 min. Auto-calculate pricing (fixed + tiered + volume discount + VAT), export PDF/Excel, track quote history.

## Tech Stack

Next.js 15 (App Router) | PostgreSQL (Neon) | Prisma ORM | shadcn/ui + Tailwind | @react-pdf/renderer | exceljs | zod + react-hook-form | @dnd-kit/sortable | Vercel

## Constraints

- NO auth in MVP, NO email sending, VND only, Vietnamese UI
- Vercel free tier (10s serverless timeout), Neon free tier (0.5GB)
- Team size: 1-5 users

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 01 | Project Setup & Database Schema | 4h | done | [phase-01](./phase-01-project-setup-database-schema.md) |
| 02 | App Shell & Layout | 3h | done | [phase-02](./phase-02-app-shell-layout.md) |
| 03 | Settings & Configuration | 4h | done | [phase-03](./phase-03-settings-configuration.md) |
| 04 | Product Management | 5h | done | [phase-04](./phase-04-product-management.md) |
| 05 | Excel Import Wizard | 4h | done | [phase-05](./phase-05-excel-import-wizard.md) |
| 06 | Customer Management | 3h | done | [phase-06](./phase-06-customer-management.md) |
| 07 | Pricing Engine & Utilities | 3h | done | [phase-07](./phase-07-pricing-engine-utilities.md) |
| 08 | Quote Builder (Core Screen) | 8h | done | [phase-08](./phase-08-quote-builder.md) |
| 09 | Quote Preview & Export | 6h | done (Excel only, PDF chưa) | [phase-09](./phase-09-quote-preview-export.md) |
| 10 | Quote List & History | 3h | done | [phase-10](./phase-10-quote-list-history.md) |
| 11 | Dashboard | 2h | done | [phase-11](./phase-11-dashboard.md) |
| 12 | Polish & Deploy | 3h | done (loading, error, empty states) | [phase-12](./phase-12-polish-deploy.md) |

## Remaining (Phase 2)

| # | Feature | Priority |
|---|---------|----------|
| 1 | Xuất PDF (font tiếng Việt, @react-pdf/renderer) | P1 |
| 2 | Đăng nhập / phân quyền (Clerk hoặc Better Auth) | P1 |
| 3 | Gửi email báo giá từ app | P2 |
| 4 | Theo dõi khách đã xem link | P2 |
| 5 | Upload logo (cần Vercel Blob token) | P2 |
| 6 | Mobile responsive polish | P3 |

## Dependencies

```
Phase 01 ──> Phase 02 ──> Phase 03
                 │
Phase 07 ───────┤
                 │
Phase 04 ──> Phase 05
                 │
Phase 06 ───────┤
                 ├──> Phase 08 ──> Phase 09
                 │
                 ├──> Phase 10
                 │
                 └──> Phase 11 ──> Phase 12
```

## Key Reports

- [Brainstorm Report](../reports/brainstorm-auto-quotation.md)
- [Design System](../reports/design-system-auto-quotation.md)
- [Wireframes](../reports/wireframes-auto-quotation.md)

## Validation Log

### Session 1 — 2026-03-01
**Trigger:** Initial plan creation validation
**Questions asked:** 6

#### Questions & Answers

1. **[Architecture]** Plan dung public/uploads/ luu logo nhung Vercel filesystem la ephemeral (mat khi redeploy). Ban muon xu ly the nao?
   - Options: Vercel Blob (khuyen nghi) | Chap nhan mat khi redeploy | Supabase Storage
   - **Answer:** Vercel Blob
   - **Rationale:** Logo must persist across deploys. @vercel/blob free 250MB, minimal setup. Phase 01 needs to add @vercel/blob dependency. Phase 03 logo upload action changes from fs.writeFile to blob.put().

2. **[Assumptions]** Plan khong co auth. Bat ky ai co URL deu truy cap duoc admin panel. Ban co muon bao ve co ban khong?
   - Options: Khong can, dung noi bo | Basic password (env var) | Clerk ngay tu dau
   - **Answer:** Khong can, dung noi bo
   - **Rationale:** Internal tool, team knows URL. No auth overhead in MVP. Add Clerk in Phase 2 when needed.

3. **[Scope]** Brainstorm dat Share link (chia se bao gia qua URL) vao Phase 2, nhung plan dua vao Phase 1. Ban muon de o Phase nao?
   - Options: Giu o Phase 1 (khuyen nghi) | Chuyen sang Phase 2
   - **Answer:** Giu o Phase 1
   - **Rationale:** High value: KH view quote online, copy link to send via Zalo. Only ~1h extra code. Already scoped in Phase 09.

4. **[Architecture]** Brainstorm noi dung Supabase nhung plan doi sang Neon. Ban prefer database provider nao?
   - Options: Neon (khuyen nghi) | Supabase | De Claude chon
   - **Answer:** Neon
   - **Rationale:** Serverless PostgreSQL optimized for Vercel. 0.5GB free. Better DX with Prisma adapter. No Supabase ecosystem lock-in.

5. **[Architecture]** Logo storage - follow-up explanation
   - **Answer:** Vercel Blob (selected by recommendation after user clarification)
   - **Rationale:** User confirmed trust in recommended approach.

6. **[Tradeoffs]** Pricing engine can unit test. Ban muon dung testing framework nao?
   - Options: Vitest (khuyen nghi) | Jest | Khong test trong MVP
   - **Answer:** Vitest
   - **Rationale:** Fast, Vite-compatible, simple config. Tests pricing engine correctness which is business-critical.

#### Confirmed Decisions
- **Logo storage**: Vercel Blob (@vercel/blob) — persistent file storage, free 250MB
- **Auth**: None in MVP — internal team use only
- **Share link**: Phase 1 — high value, low effort
- **Database**: Neon PostgreSQL — serverless, Prisma adapter, no lock-in
- **Testing**: Vitest — fast, modern, DX-friendly
- **No auth**: Confirmed acceptable for MVP internal use

#### Action Items
- [x] Update Phase 01: add @vercel/blob to dependencies
- [x] Update Phase 03: change logo upload from fs.writeFile to Vercel Blob put()
- [x] Update Phase 07: confirm Vitest as testing framework

#### Impact on Phases
- Phase 01: Add `@vercel/blob` to npm install step, add `BLOB_READ_WRITE_TOKEN` to .env.example
- Phase 03: Logo upload action uses `put()` from @vercel/blob instead of fs.writeFile. Remove `public/uploads/` directory. Settings.logoUrl stores blob URL.
- Phase 07: Vitest confirmed (already in plan)
