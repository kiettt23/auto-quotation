# UI Test Plan - Auto Quotation App

**App:** Vietnamese Quotation Management Tool | **Tech:** Next.js 15, shadcn/ui, Tailwind CSS | **Date:** 2026-03-02

---

## 1. Pages to Test

| Route | Purpose | Priority |
|-------|---------|----------|
| `/` | Dashboard (stats, recent quotes) | P1 |
| `/san-pham` | Product management | P1 |
| `/khach-hang` | Customer management | P1 |
| `/bao-gia` | Quote list & history | P1 |
| `/bao-gia/tao-moi` | Quote builder (create) | P1 |
| `/bao-gia/[id]` | Quote detail/edit | P1 |
| `/bao-gia/[id]/xem-truoc` | Quote preview | P2 |
| `/cai-dat` | Settings (company info, template) | P2 |
| `/chia-se/[token]` | Public share link | P3 |

---

## 2. Test Categories

### Navigation
- [ ] All sidebar/menu links work correctly
- [ ] Breadcrumbs display & navigate properly
- [ ] Back/forward browser buttons function
- [ ] Routing between pages is smooth (no lag)

### Forms & Input
- [ ] Product form: add/edit validation (name, price, unit)
- [ ] Customer form: add/edit validation (name, email, phone)
- [ ] Quote builder: line item add/remove, quantity/price updates
- [ ] Settings form: save/update company info
- [ ] Required field validation (error messages appear)
- [ ] Input constraints: numbers, emails, character limits

### Responsive Design
- [ ] Desktop (1920px): layout, spacing, font sizes
- [ ] Tablet (768px): sidebar collapse, table responsiveness
- [ ] Mobile (375px): touch-friendly buttons, readable text, single-column layout
- [ ] Tables: horizontal scroll on mobile, no overlapping content
- [ ] Forms: label/input stacking, button width

### Accessibility
- [ ] Tab navigation order (logical flow)
- [ ] ARIA labels on buttons, icons, tables
- [ ] Color contrast ratios (WCAG AA minimum)
- [ ] Focus indicators visible on interactive elements
- [ ] Screen reader compatibility (test with NVDA/JAWS)

### Performance
- [ ] Page load time < 3s (first contentful paint)
- [ ] Quote list pagination: smooth scrolling, lazy load
- [ ] Quote preview PDF generation: no freezing UI
- [ ] Form submission: loading spinner, disabled button state
- [ ] Image/font optimization (no layout shift)

---

## 3. Key User Flows

### Create & Edit Quote
1. `/bao-gia/tao-moi` → Select customer → Add products → Set quantities/discounts → Save
2. `/bao-gia/[id]` → Edit line items → Update totals → Preview → Share/Export

### Product Inventory
1. `/san-pham` → Add product (name, price, unit) → Edit → Delete → List updates

### Customer Management
1. `/khach-hang` → Add customer (name, email, phone) → Edit info → Link to quotes

### Dashboard Overview
1. `/` → Load stats cards (order count, revenue) → Click "Recent Quotes" → Navigate to `/bao-gia`

### Public Share
1. `/bao-gia/[id]` → Generate share token → Open `/chia-se/[token]` → View without login

---

## 4. Error Scenarios

- [ ] Empty required fields → validation error
- [ ] Network failure → retry/offline indicator
- [ ] Duplicate product name → warning
- [ ] Delete product in active quote → cascade warning
- [ ] Invalid share token → 404 page
- [ ] Session timeout → redirect to login

---

## 5. Visual Regression
- [ ] Compare dashboard layout across runs
- [ ] Quote preview styling consistency
- [ ] Form label alignment
- [ ] Table row height & padding

---

## 6. Testing Tools
- **Automated:** Playwright/Cypress for E2E (forms, navigation, flows)
- **Manual:** Chrome DevTools, Accessibility Insights, Wave
- **Performance:** Lighthouse, WebPageTest
- **Responsive:** Chrome DevTools device emulation, real devices
