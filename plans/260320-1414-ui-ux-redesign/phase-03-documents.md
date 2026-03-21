# Phase 3: Documents List Page

## Priority: P1 | Status: pending | Effort: 2h

## Overview
Redesign /documents page with same table pattern as dashboard but full-featured: pagination, all columns, bulk actions.

## Key Changes

### 1. Redesign document-list-client.tsx
**File:** `src/app/(app)/documents/document-list-client.tsx`

Current: simple list of DocumentRow cards with dropdown menu
New: table card layout matching dashboard pattern

Structure:
```
Page header (title + "Tao tai lieu" gradient CTA)
TableCard
  Toolbar: tabs (Tat ca | Bao gia | Giao hang | Xuat kho) + search
  shadcn Table with columns:
    - So tai lieu (indigo link)
    - Loai (dot + label)
    - Khach hang
    - Cong ty
    - Tong tien (formatted)
    - Ngay tao
    - Hanh dong (inline: Xem | Sua | Nhan ban | Xoa)
  Pagination footer
```

### 2. Extract reusable table toolbar
**File:** `src/components/shared/table-toolbar.tsx` (~60 lines)
- Props: `tabs: {label, value}[]`, `activeTab`, `onTabChange`, `search`, `onSearchChange`
- Reused in dashboard + documents + potentially products/customers
- Tab group: `bg-slate-100 rounded-lg p-0.5` with active `bg-white shadow-sm`
- Search: indigo focus ring

### 3. Extract reusable page header
**File:** `src/components/shared/page-header.tsx` (~30 lines)
- Props: `title`, `subtitle?`, `actions?: ReactNode`
- Consistent across all pages

### 4. Inline row actions
Replace DropdownMenu with visible inline action links:
```tsx
<td className="text-right">
  <div className="flex justify-end gap-3 text-xs font-medium">
    <Link href={`/documents/${id}`} className="text-slate-500 hover:text-indigo-600">Xem</Link>
    <Link href={`/documents/${id}/edit`} className="text-slate-500 hover:text-indigo-600">Sua</Link>
    <button onClick={onDuplicate} className="text-slate-500 hover:text-indigo-600">Nhan ban</button>
    <button onClick={onDelete} className="text-red-400 hover:text-red-600">Xoa</button>
  </div>
</td>
```

### 5. Client-side filtering by tab
- "Tat ca" shows all
- "Bao gia" filters type === "quotation"
- "Giao hang" filters type === "delivery_note"
- "Xuat kho" filters type === "export_note"
- Combined with search filter on documentNumber + customerName

### 6. Pagination
- Simple client-side pagination (10 items/page)
- Footer: "Hien thi 1-10 cua 42" + prev/next buttons
- Extract to `src/components/shared/table-pagination.tsx` (~40 lines)

### 7. Update DocumentRowCard
**File:** `src/components/documents/document-row-card.tsx`
- Keep for dashboard recent docs (simpler view)
- Update colors: blue -> indigo accent

## New Files
- `src/components/shared/table-toolbar.tsx`
- `src/components/shared/page-header.tsx`
- `src/components/shared/table-pagination.tsx`

## Modified Files
- `src/app/(app)/documents/document-list-client.tsx` — full rewrite
- `src/components/documents/document-row-card.tsx` — color update

## Todo
- [ ] Create table-toolbar.tsx (reusable tabs + search)
- [ ] Create page-header.tsx (reusable)
- [ ] Create table-pagination.tsx
- [ ] Rewrite document-list-client.tsx with table layout
- [ ] Add tab filtering + search
- [ ] Add pagination
- [ ] Update document-row-card colors
- [ ] Test: empty state, filter combinations, mobile scroll

## Success Criteria
- Table matches mockup: tabs, search, inline actions, pagination
- Shared components reusable in phase 4
- No backend changes needed
