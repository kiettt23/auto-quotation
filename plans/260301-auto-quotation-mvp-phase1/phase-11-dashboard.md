# Phase 11: Dashboard

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Dashboard](../reports/wireframes-auto-quotation.md#2-dashboard-tong-quan)

## Overview

- **Priority:** P2 - Nice to have but not critical path
- **Status:** Pending
- **Effort:** 2h
- **Description:** Dashboard overview page with stats cards (monthly quotes count, pending count, monthly total value), recent quotes table, and quick action button.

## Key Insights

- All data fetched via Server Components (no client-side loading)
- Stats are computed from Quote table with date filtering (current month)
- Recent quotes table reuses column patterns from Phase 10 (but only 5 rows, no pagination)
- Dashboard wireframe shows "SP ban chay" and "Can follow up" sections - defer "Can follow up" to Phase 2 (requires view tracking). "SP ban chay" is simple aggregate query.
- Quick action "+ Tao bao gia" is the primary CTA

## Requirements

### Functional
- **Stats cards** (3):
  - "Bao gia thang nay": count of quotes created this month
  - "Dang cho phan hoi": count of quotes with status SENT
  - "Tong gia tri thang": sum of totals for quotes this month
- **Recent quotes table**: last 5 quotes with columns: Ma BG, Khach hang, Tong tien, Ngay, Trang thai, Actions
- **Quick action button**: "+ Tao bao gia" links to `/bao-gia/tao-moi`
- All data rendered server-side

### Non-Functional
- Page loads fast (single DB round-trip where possible)
- Responsive: cards stack on mobile

## Architecture

### Component Tree

```
src/app/(dashboard)/page.tsx (Server Component)
├── Fetch dashboard data (stats + recent quotes)
└── DashboardPage
    ├── DashboardStatsCards
    │   ├── StatCard (Bao gia thang nay)
    │   ├── StatCard (Dang cho phan hoi)
    │   └── StatCard (Tong gia tri thang)
    ├── RecentQuotesSection
    │   ├── Header: "Bao gia gan day" + [+ Tao bao gia] button
    │   └── RecentQuotesTable (5 rows, simplified columns)
    └── (Optional) TopProductsSection (deferred if time-limited)
```

### Data Queries

```typescript
// All in single server component
const now = new Date()
const monthStart = startOfMonth(now)

// Stats
const monthlyCount = prisma.quote.count({ where: { createdAt: { gte: monthStart } } })
const pendingCount = prisma.quote.count({ where: { status: 'SENT' } })
const monthlyTotal = prisma.quote.aggregate({
  where: { createdAt: { gte: monthStart } },
  _sum: { total: true }
})

// Recent quotes
const recentQuotes = prisma.quote.findMany({
  take: 5,
  orderBy: { createdAt: 'desc' },
  select: { id, quoteNumber, customerName, customerCompany, total, createdAt, status }
})
```

## Related Code Files

### Files to Create

```
src/
├── components/dashboard/
│   ├── dashboard-stats-cards.tsx        # 3 stat cards in grid
│   ├── stat-card.tsx                    # Single stat card component
│   └── recent-quotes-section.tsx        # Recent quotes with table
```

### Files to Modify

```
src/app/(dashboard)/page.tsx             # Replace placeholder with dashboard
```

## Implementation Steps

1. **Build StatCard component**
   - shadcn Card with: title (text-sm text-muted-foreground), value (text-2xl font-bold), optional subtitle/change indicator
   - Icon slot (Lucide icon)
   - Used 3 times with different data

2. **Build DashboardStatsCards**
   - 3-column grid on desktop, stack on mobile
   - Card 1: FileText icon, "Bao gia thang nay", count
   - Card 2: Clock icon, "Dang cho phan hoi", count (SENT status)
   - Card 3: formatted VND, "Tong gia tri thang", sum

3. **Build RecentQuotesSection**
   - Header: "Bao gia gan day" + "+ Tao bao gia" button (link to /bao-gia/tao-moi)
   - Simple table (not full TanStack Table, just shadcn Table)
   - Columns: Ma BG, Khach hang, Tong tien, Ngay, Trang thai, Actions (simple dropdown)
   - 5 rows only, no pagination
   - Reuse QuoteStatusBadge from Phase 10
   - Row click or "Xem" action navigates to quote detail

4. **Build dashboard page** (`src/app/(dashboard)/page.tsx`)
   - Server Component: run all queries in parallel with Promise.all
   - Pass data to sub-components
   - No client components needed (purely static render)

5. **Handle empty state**
   - If no quotes: show empty dashboard with CTA "Tao bao gia dau tien"

## Todo List

- [ ] Build StatCard component
- [ ] Build DashboardStatsCards with 3 stats
- [ ] Build RecentQuotesSection with simplified table
- [ ] Build dashboard page.tsx with server-side data fetching
- [ ] Handle empty state (no quotes yet)
- [ ] Test: stats show correct counts and totals
- [ ] Test: responsive layout (cards grid on desktop, stack on mobile)

## Success Criteria

- Dashboard shows 3 stat cards with correct data
- "Bao gia thang nay" reflects current month's quote count
- "Dang cho phan hoi" reflects SENT status count
- "Tong gia tri thang" shows formatted VND total
- Recent quotes table shows last 5 quotes with all columns
- "+ Tao bao gia" button navigates to quote builder
- Page loads quickly (server-rendered)
- Responsive: cards reflow on mobile

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Aggregate query performance | Slow dashboard | Add index on createdAt; queries are simple |
| Month boundary timezone issues | Wrong counts | Use consistent UTC or server timezone |

## Next Steps

- Phase 12: Add loading skeletons for dashboard cards and table
