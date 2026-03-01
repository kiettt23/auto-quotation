# Design System - Auto Quotation App

**Date:** 2026-03-01
**Style:** Flat Design — Clean, Professional, B2B
**Stack:** Next.js 15 + shadcn/ui + Tailwind CSS

---

## 1. Color Palette

### Primary Palette (shadcn/ui CSS variables)

| Token | Hex | Tailwind Class | Dùng cho |
|---|---|---|---|
| `--primary` | `#0369A1` | `bg-primary` | Buttons chính, links, active states |
| `--primary-foreground` | `#F8FAFC` | `text-primary-foreground` | Text trên nền primary |
| `--secondary` | `#F1F5F9` | `bg-secondary` | Buttons phụ, badges, tags |
| `--secondary-foreground` | `#0F172A` | `text-secondary-foreground` | Text trên nền secondary |
| `--accent` | `#F97316` | `bg-accent` | CTA nổi bật, notifications, warnings |
| `--accent-foreground` | `#FFFFFF` | `text-accent-foreground` | Text trên nền accent |
| `--background` | `#F8FAFC` | `bg-background` | Nền chính app |
| `--foreground` | `#0F172A` | `text-foreground` | Text chính |
| `--muted` | `#F1F5F9` | `bg-muted` | Nền muted areas |
| `--muted-foreground` | `#64748B` | `text-muted-foreground` | Text phụ, labels, placeholders |
| `--border` | `#E2E8F0` | `border-border` | Borders, dividers |
| `--card` | `#FFFFFF` | `bg-card` | Card backgrounds |
| `--destructive` | `#DC2626` | `bg-destructive` | Xóa, lỗi, cảnh báo |

### Semantic Colors

| Mục đích | Color | Hex | Dùng khi |
|---|---|---|---|
| Success | Green | `#16A34A` | Lưu thành công, trạng thái "Chốt" |
| Warning | Amber | `#D97706` | Sắp hết hiệu lực, cần review |
| Info | Blue | `#0284C7` | Thông báo, tooltip |
| Danger | Red | `#DC2626` | Xóa, lỗi, trạng thái "Từ chối" |

### Quote Status Colors

| Trạng thái | Badge Color | Class |
|---|---|---|
| Nháp | Slate | `bg-slate-100 text-slate-700` |
| Đã gửi | Blue | `bg-blue-100 text-blue-700` |
| Đã xem | Amber | `bg-amber-100 text-amber-700` |
| Chốt đơn | Green | `bg-green-100 text-green-700` |
| Từ chối | Red | `bg-red-100 text-red-700` |
| Hết hạn | Gray | `bg-gray-100 text-gray-500` |

---

## 2. Typography

### Font: Inter (default shadcn) + Fallback Vietnamese

```css
/* Tailwind config */
fontFamily: {
  sans: ['Inter', 'sans-serif'],  /* shadcn default, hỗ trợ Vietnamese tốt */
}
```

**Lý do chọn Inter thay vì Plus Jakarta Sans:**
- Inter là default của shadcn/ui → zero config
- Hỗ trợ Vietnamese diacritics hoàn hảo
- Được thiết kế cho UI/screens, rất dễ đọc ở size nhỏ
- Tabular numbers (tnum) → số liệu thẳng hàng trong bảng giá

### Type Scale

| Element | Size | Weight | Line Height | Class |
|---|---|---|---|---|
| Page title | 24px (1.5rem) | Semibold 600 | 1.33 | `text-2xl font-semibold` |
| Section title | 18px (1.125rem) | Semibold 600 | 1.44 | `text-lg font-semibold` |
| Card title | 16px (1rem) | Medium 500 | 1.5 | `text-base font-medium` |
| Body | 14px (0.875rem) | Regular 400 | 1.57 | `text-sm` |
| Label | 14px (0.875rem) | Medium 500 | 1.43 | `text-sm font-medium` |
| Caption/Helper | 12px (0.75rem) | Regular 400 | 1.5 | `text-xs` |
| Number/Price | 14px (0.875rem) | Medium 500 | 1.43 | `text-sm font-medium tabular-nums` |
| Total price | 20px (1.25rem) | Bold 700 | 1.4 | `text-xl font-bold tabular-nums` |

### Vietnamese Text Rules

- Dùng `tabular-nums` cho tất cả cột số tiền → thẳng hàng
- Format VND: `1.234.567` (dấu chấm ngăn cách, KHÔNG có ₫ symbol trong bảng)
- Viết hoa chữ cái đầu cho labels: "Tên sản phẩm", "Đơn giá"

---

## 3. Spacing & Layout

### Spacing Scale (Tailwind default)

| Token | Value | Dùng cho |
|---|---|---|
| `gap-1` | 4px | Inline elements, icon + text |
| `gap-2` | 8px | Form field spacing, compact lists |
| `gap-3` | 12px | Card padding nhỏ |
| `gap-4` | 16px | Default padding, gap giữa items |
| `gap-6` | 24px | Section padding, card padding |
| `gap-8` | 32px | Giữa các sections |

### Layout Structure

```
┌─ Sidebar (w-60, collapsible to w-16) ─┬─ Main Content ─────────────────┐
│                                        │ Header (h-14, sticky)          │
│  Logo (collapsed: icon only)           ├────────────────────────────────┤
│  ──────────                            │                                │
│  Nav items (icon + label)              │  Content Area                  │
│  - Tổng quan                           │  max-w-7xl mx-auto             │
│  - Báo giá                             │  px-6 py-6                     │
│  - Sản phẩm                            │                                │
│  - Khách hàng                          │                                │
│  ──────────                            │                                │
│  Settings (bottom)                     │                                │
└────────────────────────────────────────┴────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Layout Behavior |
|---|---|---|
| Mobile | < 768px | Sidebar → bottom nav hoặc hamburger, single column |
| Tablet | 768-1023px | Sidebar collapsed (icon only), content full width |
| Desktop | 1024-1439px | Sidebar expanded, content area |
| Wide | 1440px+ | Sidebar expanded, content max-w-7xl centered |

### Quote Builder Responsive

| Breakpoint | Layout |
|---|---|
| Mobile (< 768px) | Stack: Form trên, Preview dưới (tab switch) |
| Tablet (768-1023px) | Stack: Form trên, Preview dưới (scroll) |
| Desktop (1024px+) | Split-view: Form trái (55%), Preview phải (45%) |

---

## 4. Component Patterns (shadcn/ui)

### Components cần dùng (MVP)

| Component | Dùng cho | shadcn name |
|---|---|---|
| **Sidebar** | Navigation chính | `sidebar` |
| **Data Table** | Danh sách SP, KH, báo giá | `table` + `data-table` |
| **Dialog** | Thêm/sửa SP, KH | `dialog` |
| **Sheet** | Quick view, mobile forms | `sheet` |
| **Command** | Fuzzy search SP (Cmd+K style) | `command` |
| **Form** | Tất cả forms | `form` (react-hook-form + zod) |
| **Input** | Text inputs | `input` |
| **Select** | Dropdowns (danh mục, ĐVT) | `select` |
| **Button** | Actions | `button` |
| **Badge** | Trạng thái báo giá | `badge` |
| **Card** | Dashboard stats, containers | `card` |
| **Tabs** | Settings sections | `tabs` |
| **Tooltip** | Helper text | `tooltip` |
| **Toast** | Success/error notifications | `sonner` |
| **Skeleton** | Loading states | `skeleton` |
| **Separator** | Dividers | `separator` |
| **Dropdown Menu** | Actions menu (3 dots) | `dropdown-menu` |
| **Alert Dialog** | Confirm xóa | `alert-dialog` |
| **Popover** | Date picker, filter | `popover` |
| **Calendar** | Chọn ngày hiệu lực | `calendar` |

### Button Variants

```
Primary:    [Tạo báo giá]     → variant="default" (bg-primary)
Secondary:  [Hủy]             → variant="outline"
Danger:     [Xóa]             → variant="destructive"
Ghost:      [✏️ Sửa]          → variant="ghost"
Icon:       [🔍]              → variant="ghost" size="icon"
Loading:    [⏳ Đang lưu...]   → disabled + spinner
```

### Command Palette (Fuzzy Search SP)

```
┌─────────────────────────────────────────┐
│ 🔍 Tìm sản phẩm... (Ctrl+K)           │
├─────────────────────────────────────────┤
│ Gần đây                                │
│   Switch Cisco SG350-28          5.5tr │
│   Access Point Unifi U6 Pro      3.2tr │
│ ──────────                              │
│ Thiết bị mạng                           │
│   Router Cisco RV340             4.8tr │
│   Firewall Fortinet FG-40F     12.5tr │
│ ──────────                              │
│ Dịch vụ                                │
│   Thi công lắp đặt mạng LAN     Liên hệ│
└─────────────────────────────────────────┘
```

Dùng `<CommandDialog>` của shadcn/ui:
- Fuzzy matching: gõ "cisco sw" → tìm "Switch Cisco SG350"
- Group theo danh mục
- Hiển thị giá bên phải
- Phím tắt Ctrl+K để mở nhanh

---

## 5. Icon System

### Library: Lucide React (default shadcn)

| Screen | Icons cần dùng |
|---|---|
| Sidebar | `LayoutDashboard`, `FileText`, `Package`, `Users`, `Settings` |
| Actions | `Plus`, `Pencil`, `Trash2`, `Copy`, `Download`, `Send`, `ExternalLink` |
| Status | `Clock`, `Eye`, `Check`, `X`, `AlertTriangle` |
| File | `FileDown` (PDF), `Sheet` (Excel), `Link` (share link) |
| Search | `Search`, `Filter`, `SlidersHorizontal` |
| Misc | `ChevronDown`, `MoreHorizontal`, `ArrowUpDown`, `Loader2` (spinner) |

### Icon Rules
- Size: `w-4 h-4` (16px) cho inline, `w-5 h-5` (20px) cho sidebar
- Color: Inherit từ text color (`currentColor`)
- Gap: `gap-2` giữa icon và text
- KHÔNG dùng emoji thay icon trong UI production

---

## 6. Data Table Pattern

### Bảng báo giá (quotes list)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ☐ │ Mã BG ↕   │ Khách hàng ↕ │ Tổng tiền ↕ │ Ngày ↕  │ T.Thái  │⋯│
├───┼────────────┼──────────────┼─────────────┼─────────┼─────────┼──┤
│ ☐ │ BG-2026-42 │ Cty XYZ      │  60.115.000 │ 28/02   │ 🟢 Gửi  │⋯│
│ ☐ │ BG-2026-41 │ Anh Tùng     │  12.500.000 │ 27/02   │ ⚪ Nháp │⋯│
│ ☐ │ BG-2026-40 │ Cty DEF      │ 155.000.000 │ 26/02   │ 🟢 Chốt │⋯│
├───┴────────────┴──────────────┴─────────────┴─────────┴─────────┴──┤
│ ☐ Chọn tất cả    Đã chọn: 0                  1-20 / 42   < 1 2 > │
└─────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Column sorting (↕)
- Row selection (checkbox)
- Pagination
- Row actions (⋯): Xem, Sửa, Clone, Xóa, Xuất PDF
- Filter bar phía trên: Status, Date range, Search text
- `tabular-nums` cho cột tiền

### Bảng SP trong quote builder

```
┌───┬──────────────────┬───────┬─────┬────────────┬───────┬────────────┐
│ ⋮ │ Sản phẩm         │ ĐVT   │ SL  │ Đơn giá    │ CK %  │ Thành tiền │
├───┼──────────────────┼───────┼─────┼────────────┼───────┼────────────┤
│ ⋮ │ Switch Cisco...  │ Cái   │ [2] │ [5.500.000]│ [0]%  │ 11.000.000 │
│ ⋮ │ Unifi U6 Pro     │ Cái   │[10] │ [3.200.000]│ [5]%  │ 30.400.000 │
│ ⋮ │ Cáp Cat6 AMP     │ Mét   │[500]│ [12.000]   │ [0]%  │  6.000.000 │
├───┼──────────────────┼───────┼─────┼────────────┼───────┼────────────┤
│   │ [+ Thêm SP] [+ Thêm dòng tùy chỉnh]       │ Tạm tính: 47.400.000│
└───┴──────────────────┴───────┴─────┴────────────┴───────┴────────────┘
```

**Features:**
- ⋮ Drag handle để reorder dòng (dnd-kit)
- Inline edit: SL, Đơn giá, CK% có thể sửa trực tiếp
- Auto-calculate thành tiền realtime
- Swipe/hover để hiện nút xóa dòng

---

## 7. Form Patterns

### Validation Rules (zod)

```typescript
// Sản phẩm
productSchema = z.object({
  code: z.string().min(1, "Bắt buộc"),
  name: z.string().min(1, "Nhập tên sản phẩm"),
  categoryId: z.string().min(1, "Chọn danh mục"),
  unit: z.string().min(1, "Chọn đơn vị"),
  basePrice: z.number().min(0, "Giá >= 0"),
})

// Khách hàng
customerSchema = z.object({
  name: z.string().min(1, "Nhập tên KH"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
})
```

### Error Display
- Inline errors dưới mỗi field (text-destructive, text-xs)
- Toast cho success/error toàn cục (sonner)
- Confirm dialog trước khi xóa (AlertDialog)

---

## 8. Interaction & Animation

### Transition Defaults

```css
/* Tailwind defaults */
transition-colors: 150ms ease
transition-all: 200ms ease

/* Custom */
.sidebar-collapse: transition-[width] 200ms ease-in-out
.preview-update: transition-opacity 150ms ease
```

### Loading States

| Action | Loading UI |
|---|---|
| Page load | Skeleton screens (card shapes) |
| Table load | Table skeleton (rows) |
| Save/Submit | Button: disabled + Loader2 spinner + "Đang lưu..." |
| PDF export | Full-screen overlay + progress indicator |
| Search | Debounce 300ms + spinner in search input |

### Keyboard Shortcuts (MVP)

| Phím | Action |
|---|---|
| `Ctrl+K` | Mở search sản phẩm |
| `Ctrl+N` | Tạo báo giá mới |
| `Ctrl+S` | Lưu nháp |
| `Ctrl+P` | Preview PDF |
| `Escape` | Đóng dialog/modal |

---

## 9. PDF Template Design

### Layout Specs

| Element | Spec |
|---|---|
| Page size | A4 (210 × 297mm) |
| Margins | Top: 20mm, Bottom: 25mm, Left/Right: 15mm |
| Primary color | `#0369A1` (header, borders, accents) |
| Font | Roboto (hỗ trợ Vietnamese tốt trong PDF) |
| Table header | `bg: #0369A1`, `text: #FFFFFF` |
| Table rows | Alternating `#FFFFFF` / `#F8FAFC` |
| Total row | `bg: #0F172A`, `text: #FFFFFF`, `font-bold` |

### Structure

```
[Page 1]
┌─ Header ──────────────────────────────────────────┐
│ [Logo]  Company Name                               │
│         Address | Phone | Email | MST              │
├────────────────────────────────────────────────────┤
│              BẢNG BÁO GIÁ                          │
│         Số: BG-2026-XXXX | Ngày: DD/MM/YYYY       │
├─ Customer Info ────────────────────────────────────┤
│ Kính gửi: [Company] | Người LH: [Name]            │
│ ĐT: [Phone] | Email: [Email]                      │
├─ Product Table ────────────────────────────────────┤
│ STT | Sản phẩm | ĐVT | SL | Đơn giá | Thành tiền │
│ ... rows ...                                       │
│                          Tạm tính | xxx.xxx.xxx    │
│                          Chiết khấu | -xx.xxx.xxx  │
│                          VAT (10%)  |  xx.xxx.xxx  │
│                          Phí vận chuyển | x.xxx.xxx│
│                          TỔNG CỘNG  | xxx.xxx.xxx  │
│ Bằng chữ: [số tiền bằng chữ Việt Nam]             │
├─ Terms ────────────────────────────────────────────┤
│ • Thời gian giao hàng: ...                         │
│ • Bảo hành: ...                                    │
│ • Thanh toán: ...                                  │
├─ Signatures ───────────────────────────────────────┤
│ Người lập          Giám đốc                        │
├─ Footer ───────────────────────────────────────────┤
│ Thông tin chuyển khoản: Bank | STK | Chủ TK        │
└────────────────────────────────────────────────────┘
```

---

## 10. Responsive & Mobile UX

### Mobile Priorities (< 768px)

1. **Quote list** → Card layout thay vì table
2. **Quote builder** → Tab switch: "Nhập liệu" | "Xem trước"
3. **Product search** → Full-screen command palette
4. **Navigation** → Bottom tab bar (4 items: Home, BG, SP, KH)

### Mobile Quote Card

```
┌──────────────────────────────┐
│ BG-2026-42        🟢 Đã gửi │
│ Công ty XYZ                  │
│ 60.115.000₫        28/02/26 │
│                    [⋯ Menu] │
└──────────────────────────────┘
```

---

## 11. Accessibility Checklist

- [x] Contrast ratio >= 4.5:1 (primary #0369A1 on white = 5.57:1)
- [x] Focus rings visible on all interactive elements
- [x] Form labels associated with inputs (label + htmlFor)
- [x] Touch targets >= 44x44px
- [x] `aria-label` trên icon-only buttons
- [x] Tab order follows visual order
- [x] `prefers-reduced-motion` respected
- [x] No color-only status indicators (icon + color + text)
- [x] Skeleton loading screens thay vì blank states

---

## 12. File Structure (UI-related)

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Header layout
│   │   ├── page.tsx                # Dashboard home
│   │   ├── bao-gia/
│   │   │   ├── page.tsx            # Quote list
│   │   │   ├── tao-moi/page.tsx    # Quote builder
│   │   │   └── [id]/page.tsx       # Quote detail/edit
│   │   ├── san-pham/
│   │   │   └── page.tsx            # Product management
│   │   ├── khach-hang/
│   │   │   └── page.tsx            # Customer management
│   │   └── cai-dat/
│   │       └── page.tsx            # Settings
│   └── chia-se/
│       └── [token]/page.tsx        # Public quote view (share link)
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   └── app-header.tsx
│   ├── quote/
│   │   ├── quote-builder-form.tsx
│   │   ├── quote-preview.tsx
│   │   ├── quote-item-row.tsx
│   │   ├── quote-summary.tsx
│   │   └── quote-status-badge.tsx
│   ├── product/
│   │   ├── product-table.tsx
│   │   ├── product-dialog.tsx
│   │   ├── product-search-command.tsx
│   │   └── product-import-wizard.tsx
│   └── customer/
│       ├── customer-table.tsx
│       └── customer-dialog.tsx
└── lib/
    ├── format-currency.ts          # VND formatting
    ├── format-number-to-words.ts   # Số → chữ Việt
    └── pricing-engine.ts           # Tính giá logic
```
