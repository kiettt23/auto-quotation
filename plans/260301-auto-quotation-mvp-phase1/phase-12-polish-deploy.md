# Phase 12: Polish & Deploy

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Empty States](../reports/wireframes-auto-quotation.md#13-empty-states) (if exists)
- [Design System - Loading States](../reports/design-system-auto-quotation.md#8-interaction--animation)

## Overview

- **Priority:** P2 - Final polish before launch
- **Status:** Pending
- **Effort:** 3h
- **Description:** Empty states, loading skeletons, error boundaries, toast notifications audit, responsive testing, Vercel deployment configuration, and documentation.

## Key Insights

- Empty states needed for: product list, customer list, quote list, dashboard (first-time user)
- Loading skeletons: use shadcn Skeleton component matching actual content layout
- Error boundaries prevent entire app crash from component-level errors
- Responsive testing at 4 breakpoints: 375px, 768px, 1024px, 1440px
- Vercel deployment is zero-config for Next.js but needs environment variables
- .env.example documents required variables for other developers

## Requirements

### Functional
- Empty states for all list pages (products, customers, quotes, dashboard)
- Loading skeletons for data tables and dashboard cards
- Error boundaries at route level
- Toast notifications for all CRUD operations (verify completeness)
- Confirm dialogs for all delete actions (verify completeness)

### Non-Functional
- All pages responsive at 375px, 768px, 1024px, 1440px
- Deployed to Vercel with environment variables configured
- README.md with setup instructions
- .env.example with all required variables

## Architecture

### Empty State Pattern

```
Each list page checks: if data.length === 0 && no active filters
  → Show EmptyState component:
    - Illustration/icon
    - Title: "Chua co [entity] nao"
    - Description: brief explanation
    - CTA button: "+ Them [entity] dau tien"
```

### Error Boundary Pattern

```
src/app/(dashboard)/error.tsx    # Catches errors in dashboard routes
src/app/error.tsx                # Global error boundary
src/app/not-found.tsx            # 404 page
```

### Loading Skeleton Pattern

```
src/app/(dashboard)/loading.tsx          # Dashboard loading skeleton
src/app/(dashboard)/san-pham/loading.tsx # Products loading skeleton
src/app/(dashboard)/khach-hang/loading.tsx
src/app/(dashboard)/bao-gia/loading.tsx
src/app/(dashboard)/cai-dat/loading.tsx
```

## Related Code Files

### Files to Create

```
src/
├── app/
│   ├── error.tsx                        # Global error boundary
│   ├── not-found.tsx                    # 404 page
│   └── (dashboard)/
│       ├── error.tsx                    # Dashboard error boundary
│       ├── loading.tsx                  # Dashboard loading skeleton
│       ├── san-pham/loading.tsx
│       ├── khach-hang/loading.tsx
│       ├── bao-gia/loading.tsx
│       └── cai-dat/loading.tsx
├── components/
│   ├── empty-state.tsx                  # Reusable empty state component
│   ├── table-skeleton.tsx               # Reusable table loading skeleton
│   └── card-skeleton.tsx                # Reusable card loading skeleton
├── .env.example
└── README.md
```

## Implementation Steps

1. **Build EmptyState component**
   - Props: icon (Lucide), title, description, actionLabel, actionHref
   - Centered layout with icon, text, and CTA button
   - Used across all list pages

2. **Add empty states to all list pages**
   - Products: "Chua co san pham nao" + "Them san pham" or "Import tu Excel"
   - Customers: "Chua co khach hang nao" + "Them khach hang"
   - Quotes: "Chua co bao gia nao" + "Tao bao gia dau tien"
   - Dashboard: "Chua co bao gia nao" + "Bat dau tao bao gia"

3. **Build loading skeletons**
   - `table-skeleton.tsx`: rows of Skeleton elements matching table column widths
   - `card-skeleton.tsx`: card-shaped Skeleton for dashboard stats
   - Each `loading.tsx`: compose skeletons to match actual page layout

4. **Add error boundaries**
   - `error.tsx` files: "use client", display error message + retry button
   - `not-found.tsx`: friendly 404 with link back to dashboard
   - Include "Quay ve trang chu" button

5. **Audit toast notifications**
   - Verify every CRUD action shows appropriate toast:
     - Create: "Da tao [entity]"
     - Update: "Da cap nhat [entity]"
     - Delete: "Da xoa [entity]"
     - Export: "Dang xuat [format]..."
     - Error: "Loi: [message]"

6. **Audit confirm dialogs**
   - Verify every delete action uses AlertDialog
   - Title: "Xoa [entity]?"
   - Description: "Ban co chac chan muon xoa? Hanh dong nay khong the hoan tac."

7. **Responsive testing checklist**
   - 375px (iPhone SE): all pages, bottom nav, card layouts
   - 768px (iPad): sidebar collapsed, content full width
   - 1024px (desktop): sidebar expanded, split views
   - 1440px (wide): content centered, max-width applied
   - Quote builder: split-view vs tab switch
   - Data tables: horizontal scroll on small screens

8. **Configure Vercel deployment**
   - Ensure `next.config.ts` has no blocking issues
   - Add `vercel.json` if custom config needed (likely not)
   - Set environment variables in Vercel dashboard:
     - `DATABASE_URL` (Neon connection string with pooling)

9. **Create .env.example**
   ```
   # Database (Neon PostgreSQL)
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

10. **Create README.md**
    - Project description
    - Tech stack
    - Prerequisites (Node.js 18+, npm)
    - Setup: clone, install, env, prisma migrate, prisma seed, dev
    - Scripts: dev, build, lint, test, prisma studio
    - Deployment instructions (Vercel)

11. **Final build verification**
    ```bash
    npm run build    # Ensure no build errors
    npm run lint     # Fix any lint issues
    npm test         # All tests pass (Phase 07 pricing engine tests)
    ```

## Todo List

- [ ] Build EmptyState reusable component
- [ ] Add empty states to products, customers, quotes, dashboard pages
- [ ] Build table-skeleton and card-skeleton components
- [ ] Create loading.tsx for all dashboard routes
- [ ] Create error.tsx and not-found.tsx
- [ ] Audit all toast notifications (create, update, delete, export, errors)
- [ ] Audit all confirm dialogs for delete actions
- [ ] Responsive testing at 375px, 768px, 1024px, 1440px
- [ ] Create .env.example with all required variables
- [ ] Create README.md with setup instructions
- [ ] Deploy to Vercel, configure environment variables
- [ ] Verify deployed app works end-to-end
- [ ] Run `npm run build` and `npm run lint` cleanly

## Success Criteria

- All list pages show helpful empty state when no data
- Loading states show skeletons (not blank screens)
- Error boundaries catch and display errors gracefully
- 404 page works for unknown routes
- All CRUD operations show toast feedback
- All delete actions require confirmation
- App works correctly at all 4 breakpoints
- `npm run build` passes with no errors
- Deployed to Vercel and accessible via URL
- Seed data visible in deployed app
- Full user flow works: settings -> add products -> add customer -> create quote -> export PDF -> share link

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Build errors from SSR issues | Can't deploy | Test `npm run build` locally before pushing |
| Vercel environment variable issues | App crashes in production | Test with production env locally using `vercel env pull` |
| Neon cold start latency | First request slow | Neon free tier has some cold start; acceptable for MVP |
| Missing toast/confirm somewhere | Inconsistent UX | Systematic audit of all action handlers |

## Next Steps

- MVP complete. Gather user feedback.
- Phase 2 planning: email sending, view tracking, status workflow, multi-user auth
