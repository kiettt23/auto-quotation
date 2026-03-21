# Phase 2: Dashboard Page

## Priority: P1 | Status: pending | Effort: 3h

## Overview
Transform homepage from simple doc list to full dashboard with greeting, stat cards, quick actions, and recent documents table.

## Key Changes

### 1. Dashboard page (server component)
**File:** `src/app/(app)/page.tsx`
- Fetch stats: total docs, this-month quotes, customer count, product count
- Fetch recent documents (existing `listRecentDocuments`)
- Fetch session for user name greeting
- Render: `<DashboardClient stats={stats} documents={documents} userName={name} />`

### 2. New DashboardClient
**File:** `src/app/(app)/dashboard-client.tsx` (~120 lines)

Layout structure:
```
PageHeader (greeting + quick actions)
StatCardsGrid (4 cards)
RecentDocumentsTable (table card with tabs + search)
```

### 3. Page Header
```tsx
<div className="flex items-start justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">Xin chao, {name}</h1>
    <p className="mt-1 text-sm text-slate-400">{dateString} · {docCount} tai lieu moi</p>
  </div>
  <div className="flex gap-2.5">
    <Button variant="outline" className="rounded-xl border-slate-200">Xuat bao cao</Button>
    <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
      <Plus className="mr-1.5 h-4 w-4" /> Tao tai lieu
    </Button>
  </div>
</div>
```

### 4. Stat Cards
**File:** `src/components/dashboard/stat-card-grid.tsx` (~80 lines)

Each card:
```tsx
<div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5">
  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 transition-opacity group-hover:opacity-100" />
  <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-[10px]", iconBgClass)}>
    <Icon className={cn("h-[18px] w-[18px]", iconColorClass)} />
  </div>
  <p className="text-xs font-medium text-slate-400">{label}</p>
  <p className="text-[28px] font-bold tracking-tight">{value}</p>
  <TrendBadge direction={trend.dir} value={trend.pct} />
</div>
```

Grid: `grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7`

4 stat configs:
| Label | Icon | Color | Data source |
|-------|------|-------|-------------|
| Tong tai lieu | FileText | indigo | COUNT documents |
| Bao gia thang nay | ClipboardCheck | green | COUNT docs WHERE type=quote AND month=current |
| Khach hang | Users | amber | COUNT customers |
| San pham | Package | blue | COUNT products |

### 5. Recent Documents Table
**File:** `src/components/dashboard/recent-documents-table.tsx` (~150 lines)

Structure:
```
TableCard (rounded-xl border bg-white)
  TableToolbar: title + tabs (Tat ca | Bao gia | Giao hang | Xuat kho) + search input
  Table (shadcn Table component)
    columns: So tai lieu, Loai, Khach hang, Cong ty, Ngay tao, Trang thai, Actions
```

- **Tabs**: use inline button group with `bg-slate-100 rounded-lg p-0.5` wrapper, active tab `bg-white shadow-sm rounded-md`
- **Search**: `Input` with search icon, `rounded-[10px] bg-slate-50 border-slate-200 w-56`
- **Doc number**: `font-semibold text-indigo-600` (clickable link)
- **Type column**: colored dot + label (`<span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />Bao gia</span>`)
- **Status badges**: use shadcn Badge with custom variants
  - Hoan thanh: `bg-emerald-50 text-emerald-600`
  - Cho duyet: `bg-amber-50 text-amber-600`
  - Nhap: `bg-indigo-50 text-indigo-600`
- **Inline actions**: Xem | Sua | Nhan ban links (visible on hover row) instead of dropdown menu
  - `<div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">`

### 6. Stats service
**File:** `src/services/stats.service.ts` (~40 lines)
- `getDashboardStats(userId)` — returns { totalDocs, monthlyQuotes, customerCount, productCount }
- Uses existing db queries with COUNT

## New Files
- `src/app/(app)/dashboard-client.tsx`
- `src/components/dashboard/stat-card-grid.tsx`
- `src/components/dashboard/recent-documents-table.tsx`
- `src/services/stats.service.ts`

## Modified Files
- `src/app/(app)/page.tsx` — rewrite to fetch stats + render client

## Todo
- [ ] Create stats.service.ts with getDashboardStats
- [ ] Rewrite page.tsx to fetch stats, session, documents
- [ ] Create dashboard-client.tsx with page layout
- [ ] Create stat-card-grid.tsx
- [ ] Create recent-documents-table.tsx with tabs, search, inline actions
- [ ] Add gradient CTA button variant or inline styles
- [ ] Test: empty state, mobile responsive (2-col stats on mobile)

## Success Criteria
- Dashboard matches mockup layout: greeting, 4 stat cards, table with tabs
- Inline actions on table rows reduce clicks vs current dropdown
- Mobile: stats stack 2x2, table scrolls horizontally
