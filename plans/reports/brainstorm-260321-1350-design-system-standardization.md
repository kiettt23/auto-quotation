# Design System Standardization — Brainstorm Report

## Problem
After multiple UI sessions, Documents page has a polished master-detail pattern. Other pages (Companies, Products, Customers, Settings) use older patterns (full-width table, gradient CTAs, PageHeader). Need to codify a unified design system and apply it everywhere.

## Font Decision
- **Body:** Plus Jakarta Sans (400, 500, 600, 700) — modern geometric, good Vietnamese diacritics, pairs well with Poppins
- **Logo:** Poppins (700) — keep as-is
- **Replaces:** Geist Sans (had inconsistent diacritics weight for Vietnamese)

## Typography Scale (Simplified from 7+ to 5 steps)
| Token | Size | Weight | Usage |
|---|---|---|---|
| xs | 11px | 400-600 | Labels, legends, meta, pagination |
| sm | 13px | 500-600 | Nav tabs, list primary, amounts |
| base | 14px | 400-500 | Body text, inputs, descriptions |
| lg | 18px | 600 | Section headings |
| xl | 24px | 700 | Page titles (rare in master-detail) |

## Border Radius (Simplified to 3 steps)
| Token | Class | Usage |
|---|---|---|
| lg | `rounded-2xl` (16px) | Panels, main cards |
| md | `rounded-xl` (12px) | Item cards, filter containers, buttons |
| sm | `rounded-lg` (8px) | Inputs, badges, small elements |

## Focus/A11y States
- All interactive elements: `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`
- Keyboard navigation support for filter tabs and list items

## Decisions Made

### Layout Pattern: Master-Detail Everywhere
- All CRUD pages (Documents, Companies, Products, Customers) use master-detail split
- Master panel: `flex-[3]`, detail panel: `flex-[2]` when open
- Panel animation: `transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]`
- Settings: master-detail with vertical tab list (left) + content (right)
- Dashboard: removed, `/` redirects to `/documents`

### Edit Pattern: Inline Edit Panel
- Click item -> right panel shows editable form
- Header: [Save (flex-1)] [In] [Sao] [Xoa] [X] — all outline, Save fills indigo when dirty
- Field groups with `<fieldset>` + uppercase legend
- No separate edit routes, no dialogs for primary editing

### Button System
- **Primary action (Save dirty):** `bg-indigo-600 text-white hover:bg-indigo-700`
- **Primary action (Save clean):** outline, `text-slate-400`
- **Secondary actions:** `variant="outline"` h-7 text-xs
- **Destructive:** outline + `text-red-500 hover:bg-red-50`
- **Add item (list):** `h-7 w-7 rounded-lg border border-slate-200` icon only
- **Add item (inline):** dashed border card `rounded-xl border-dashed`
- **NO gradient buttons anywhere.** Removed from design system.

---

## Codified Design System Tokens

### Colors
| Role | Class |
|---|---|
| Page bg | `bg-slate-50` (CSS var --background) |
| Card surface | `bg-white` |
| Header | `bg-slate-900` |
| Primary | `bg-indigo-600` / `text-indigo-600` |
| Primary hover | `hover:bg-indigo-700` |
| Accent surface | `bg-indigo-50` |
| Accent ring | `ring-1 ring-indigo-200` |
| Border default | `border-slate-200` / `border-slate-200/80` |
| Border muted | `border-slate-100` |
| Muted surface | `bg-slate-100` / `bg-slate-100/80` |
| Read-only input | `bg-slate-50 text-slate-500` |
| Destructive | `text-red-500`, hover: `bg-red-50 text-red-600` |
| Interactive hover | `hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600` |

### Typography
| Token | Class | Usage |
|---|---|---|
| brand | `font-poppins text-[28px] font-bold tracking-tight text-white` | Logo only |
| h1 (unused) | `text-2xl font-bold text-slate-900` | Deprecated — no page titles in master-detail |
| section-heading | `text-base font-semibold text-slate-900` | Rare, dashboard-style |
| fieldset-legend | `text-[11px] font-semibold uppercase tracking-wider text-slate-400` | Field group labels |
| input-label | `text-[10px] font-medium text-slate-400` | Above inputs (LabeledField) |
| nav-tab | `text-[13px] font-medium` | Header nav links |
| list-primary | `text-[13px] font-semibold text-slate-900` | List row title |
| list-secondary | `text-xs text-slate-400` | List row subtitle |
| list-amount | `text-[13px] font-semibold text-slate-700` | Money values in list |
| meta | `text-[11px] text-slate-400` | Dates, counts, pagination |
| badge | `text-[10px] font-medium` | Type badges |
| input | `text-xs` | All form inputs |
| button | `text-xs` | All action buttons |

### Border Radius
| Token | Class | Usage |
|---|---|---|
| panel | `rounded-2xl` | Main panels, cards |
| card | `rounded-xl` | Item cards, filter container, dashed add |
| element | `rounded-lg` | Buttons, inputs, list rows, indicators |
| input-search | `rounded-[10px]` | Search input |
| badge | `rounded-md` | Small badges, close button |

### Spacing
| Token | Value | Usage |
|---|---|---|
| page-padding | `px-10 py-6` | Page wrapper (consistent everywhere) |
| page-height | `h-[calc(100vh-48px)]` | Full viewport minus header |
| panel-content | `px-4 py-3` | Scrollable panel content |
| panel-header | `px-3 py-1.5` | Action bar |
| toolbar | `px-4 py-3` | Filter/search toolbar |
| field-group | `mb-3` + `space-y-1.5` | Fieldset spacing |
| separator | `<Separator />` with `my-3` | Between groups |
| list-items | `space-y-1` + `px-3 py-2` | Item list |
| section-gap | `gap-6` (detail open) or `ml-6` | Between master and detail |

### Shadows
| Token | Class | Usage |
|---|---|---|
| panel | `shadow-sm` | Cards, panels |
| tab-active | `shadow-sm` | Filter tab indicator |
| none | — | Everything else |

### Animation
| Token | Class | Usage |
|---|---|---|
| panel-slide | `duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]` | Panel open/close |
| tab-indicator | `duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]` | Sliding tab pill |
| color | `transition-colors duration-200` | Hover states |

### Component Patterns

#### Master Panel
```
rounded-2xl border border-slate-200/80 bg-white shadow-sm
  toolbar: filter tabs + search + add button
  list: scrollable, space-y-1, selectable rows
  pagination: border-t border-slate-100
```

#### Detail/Edit Panel
```
rounded-2xl border border-slate-200/80 bg-white shadow-sm
  header: [Save flex-1] [Action buttons] [X]
  separator
  scrollable content:
    fieldset groups with legends
    separators between groups
    item cards (rounded-xl border-slate-100 bg-slate-50/50)
    dashed add button
    total row (rounded-lg bg-indigo-50)
    notes textarea
```

#### Filter Tabs (Sliding Indicator)
```
container: rounded-xl bg-slate-100/80 p-1
indicator: bg-white shadow-sm rounded-lg (animated position)
tab: px-3 py-1.5 text-xs font-medium rounded-lg
active: text-slate-900, inactive: text-slate-500
```

#### List Row
```
flex w-full items-center gap-4 rounded-xl px-3 py-2.5
selected: bg-indigo-50 ring-1 ring-indigo-200
hover: hover:bg-slate-50
icon: h-9 w-9 rounded-lg text-xs font-bold text-white bg-{color}
```

---

## Implementation Plan

### Phase 1: Shared Components
- Extract reusable `MasterDetailLayout` wrapper
- Extract `DetailEditPanel` shell (header with save/actions, scrollable body)
- Extract `FilterTabsWithIndicator` component
- Keep existing `TableToolbar`, `TablePagination` for reference but deprecate

### Phase 2: Companies Page
- Convert to master-detail with inline edit
- Fields: name, address, phone, email, taxCode, bankName, bankAccount, logoUrl

### Phase 3: Customers Page
- Convert to master-detail with inline edit
- Fields: name, address, phone, email, taxCode, deliveryAddress, receiverName, receiverPhone

### Phase 4: Products Page
- Convert to master-detail with inline edit
- Fields: name, specification, unitName, price

### Phase 5: Settings Page
- Convert to master-detail (vertical tabs left, content right)
- Tabs: Company, Bank, Categories, Units

### Phase 6: Cleanup
- Remove unused components: PageHeader, gradient button patterns, dashboard-client
- Remove unused shared components if fully replaced
- Update docs/design-guidelines.md

---

## Unresolved Questions
- None at this time
