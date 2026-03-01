# Brainstorm Report: Auto Quotation App

**Date:** 2026-02-28
**Status:** Agreed
**Domain:** Telecom (IT/Software + Wholesale/Trading)

---

## 1. Problem Statement

Mỗi lần KH hỏi giá phải: tra giá rải rác (Excel, trong đầu) → tính toán thủ công (combo, CK, VAT, ship) → format file Word/Excel → gửi KH. Mất thời gian, dễ sai, không tìm lại được báo giá cũ.

**Pain points:**
- Giá nằm rải rác, không thống nhất
- Tính toán phức tạp (nhiều mô hình giá)
- Format báo giá mất công mỗi lần
- Không truy xuất được lịch sử báo giá

## 2. Business Context

- **Sản phẩm:** Thiết bị mạng (router, switch, AP, firewall, cáp), thiết bị viễn thông (IP phone, tổng đài, camera, đầu ghi), dịch vụ triển khai, giải pháp trọn gói
- **Mô hình giá:** Cố định + bậc thang (volume) + custom + biến động thị trường
- **Team:** 1-5 người
- **Kênh KH:** Zalo, Messenger, phone, email, trực tiếp
- **Workflow hiện tại:** Không chuẩn hóa - KH lớn làm báo giá chi tiết, KH nhỏ báo miệng
- **Budget:** Free / gần free
- **Timeline:** Phân giai đoạn - MVP ASAP, iterate dần

## 3. Key Insights

1. **KHÔNG niêm yết giá công khai** - giá flexible theo KH, markup khác nhau → chia sẻ qua quote link riêng
2. **Tái sử dụng báo giá** - trong 100 KH có thể 2-3 KH yêu cầu giống nhau → clone + đổi info = tiết kiệm rất nhiều thời gian
3. **Không cần Zalo OA integration** ngay - gửi PDF/link qua Zalo thủ công đã đủ dùng
4. **Quote tracking qua link** - nếu gửi link online thay vì PDF, có thể biết KH đã xem chưa

## 4. Recommended Architecture

### Tech Stack: Next.js Full-stack Monolith

| Component | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | User knows React, SSR for quote links, API routes = no separate backend |
| Database | PostgreSQL (Supabase/Neon free) | Relational data fits product-category-quote relationships |
| ORM | Prisma | Type-safe queries, easy migrations |
| PDF Export | @react-pdf/renderer | React-based, full control over layout |
| Excel Export | exceljs | Professional Excel output |
| Email | Resend (100/day free) | Simple API, generous free tier |
| Auth | NextAuth.js v5 | Admin panel protection |
| Deploy | Vercel | Zero config, free tier sufficient |
| Storage | Supabase Storage | Store PDFs, logos, attachments |
| UI | shadcn/ui + Tailwind | Professional, accessible, fast to build |

**Monthly cost: $0** (all services on free tier, sufficient for small team)

### Why NOT Other Approaches

| Approach | Why Not |
|---|---|
| SPA + separate backend | 2 codebases, overkill for small team |
| Firebase/Firestore | NoSQL poor fit for relational product data |
| No-code (Retool, etc.) | Not flexible enough for complex pricing logic |
| Django/FastAPI | Extra language, React user → Next.js more natural |

## 5. Data Model (High-level)

```
Category (danh mục)
  └── Product (sản phẩm/dịch vụ)
        ├── base_price
        ├── pricing_tiers[] (bậc thang giá)
        └── unit (cái, bộ, mét, giờ...)

Customer (khách hàng)
  ├── name, company, phone, email
  └── quotes[] (lịch sử báo giá)

Quote (báo giá)
  ├── customer_id
  ├── quote_number (mã báo giá tự động)
  ├── status (draft, sent, viewed, accepted, rejected)
  ├── valid_until (hiệu lực)
  ├── notes, terms
  ├── share_token (unique URL)
  └── items[]
        ├── product_id
        ├── quantity
        ├── unit_price (có thể override)
        ├── discount_%
        └── line_total

QuoteTemplate (mẫu báo giá)
  ├── logo, header, footer
  ├── company_info
  └── terms_template
```

## 6. Phased Implementation

### Phase 1 - MVP: "Tạo báo giá nhanh" ⭐ Priority
**Goal:** Từ KH hỏi giá → gửi báo giá PDF/Excel trong < 5 phút

- Product/Service catalog CRUD
- Import sản phẩm từ Excel/CSV
- Quote builder: search SP → thêm → nhập SL, CK → auto tính
- Pricing engine: fixed + tiered + custom override + VAT + phí phụ
- Quote template với branding (logo, header, footer, terms)
- Export PDF + Excel
- Quote history: search, filter, sort
- Clone quote: duplicate → đổi KH info → gửi lại
- Customer management (basic CRUD)

### Phase 2 - "Gửi & chia sẻ"
- Send quote via email (from app)
- Quote link sharing (unique URL, KH xem online)
- View tracking (KH đã mở link chưa)
- Quote status management (draft → sent → viewed → accepted/rejected)
- Dashboard: stats, recent quotes, pending follow-ups
- Quote comparison (so sánh versions)

### Phase 3 - "Nâng cao" (tương lai)
- Multi-user + role-based access
- Customer portal (KH login xem quotes)
- AI-powered product search & suggestion
- Chatbot integration (Zalo/Messenger)
- Zalo OA integration (khi có)
- Report & analytics

## 7. Core User Flow

```
KH hỏi giá
    ↓
Mở app → Search/chọn sản phẩm (fuzzy search)
    ↓
Thêm vào báo giá → Nhập SL, override giá nếu cần
    ↓
App tự tính: (đơn giá × SL) - chiết khấu + VAT + ship = tổng
    ↓
Chọn/edit template → Preview báo giá realtime
    ↓
Xuất PDF / Excel / Copy share link
    ↓
Gửi KH (email từ app hoặc Zalo thủ công)
    ↓
Lưu lịch sử → Tra cứu & tái sử dụng sau
```

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Pricing logic quá phức tạp | Tính sai giá | Modular pricing engine, unit test kỹ |
| Data migration từ Excel | Mất data, sai format | Import wizard với preview & validation |
| Free tier limits | App chậm/hết quota | Monitor usage, upgrade khi cần |
| PDF rendering issues | Báo giá xấu | Test nhiều template, preview trước khi gửi |
| Single point of failure | Mất data | Supabase auto backup, export data regularly |

## 9. Success Metrics

- Thời gian tạo báo giá: từ 15-30 phút → dưới 5 phút
- Tỷ lệ sai sót tính toán: giảm về 0 (auto calculate)
- Tra cứu báo giá cũ: từ "không tìm được" → tìm trong < 10 giây
- KH chờ báo giá: từ "phải chờ" → nhận ngay hoặc trong vài phút

## 10. Additional Specs (từ vòng hỏi bổ sung)

- **Tiền tệ:** Chỉ VND
- **Ngôn ngữ:** Tiếng Việt toàn bộ (UI + báo giá)
- **Giá bậc thang:** Cả 2 kiểu - giá cố định theo mức SL (1-10: A, 11-50: B) VÀ chiết khấu % (mua 10+ giảm 5%)
- **Data hiện tại:** Có Excel nhưng lộn xộn → cần import wizard với validation & preview
- **Zalo OA:** Chưa có → gửi PDF/link qua Zalo thủ công

## 11. Next Steps

1. Tạo implementation plan chi tiết cho Phase 1 (MVP)
2. Thiết kế database schema
3. Setup project (Next.js + Prisma + Supabase)
4. Import dữ liệu sản phẩm từ Excel hiện tại
5. Build quote builder UI
6. Implement pricing engine
7. PDF/Excel export
8. Deploy & test
