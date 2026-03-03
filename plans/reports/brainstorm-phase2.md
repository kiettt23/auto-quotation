# Brainstorm Report: Phase 2 - Auto Quotation App

**Date:** 2026-03-02
**Status:** Agreed
**Phase 1 Status:** Complete (CRUD products/customers/quotes, Excel export, share link, dashboard)

---

## 1. Tong Quan Hien Trang

### Da co (Phase 1 MVP)
- Next.js 15 App Router, PostgreSQL (Neon), Prisma 7, shadcn/ui
- CRUD san pham, khach hang, bao gia voi pricing engine (fixed + tiered + volume discount)
- Excel export (ExcelJS), share link public (`/chia-se/[token]`)
- Dashboard thong ke, import Excel wizard
- Mobile bottom nav + form/preview toggle trong quote builder
- Font Roboto (Regular + Bold) tai `public/fonts/`
- `@react-pdf/renderer` v4.3.2 da cai nhung CHUA dung
- `@vercel/blob` v2.3.0 da cai nhung CHUA config token
- Deploy: Vercel free tier (10s serverless timeout)
- Khong co auth, khong co PDF export, khong co email

### Codebase Architecture
- `src/components/quote/quote-preview.tsx` - React component render bao gia (client-side, 193 lines)
- `src/components/quote/quote-public-actions.tsx` - Hien chi co nut "Tai Excel"
- `src/app/chia-se/[token]/page.tsx` - Public share page, fetch quote + settings tu DB
- `src/app/api/export/excel/[quoteId]/route.ts` - API route xuat Excel
- `src/lib/pricing-engine.ts` - Pure functions tinh toan gia
- `src/lib/format-currency.ts`, `src/lib/format-number-to-words.ts` - Utility
- Data types: `QuotePreviewData`, `CompanyInfo` duoc share giua cac component

---

## 2. Feature 1: PDF Export

### Van de
Xuat bao gia dang PDF voi font tieng Viet (dau), layout match voi share preview HTML hien co. Phai chay duoc tren Vercel serverless (10s timeout).

### Phuong an danh gia

#### A. @react-pdf/renderer (DA CAI - v4.3.2) -- KHUYEN NGHI
| Tieu chi | Danh gia |
|---|---|
| Font tieng Viet | Ho tro qua `Font.register()` voi Roboto TTF (da co tai `public/fonts/`) |
| Serverless | Chay tren Node.js, khong can browser/headless Chrome, nhanh |
| Layout match | KHONG match 1:1 voi HTML - phai tao rieng PDF layout bang `<Document>`, `<Page>`, `<View>`, `<Text>` |
| Bundle size | ~2MB, chap nhan duoc cho serverless |
| Performance | Nhanh (1-3s cho PDF don gian), trong 10s timeout |

**Pros:**
- Da co trong `package.json`, khong them dependency
- React-based, team quen React
- Text la vector (selectable, searchable), file size nho
- Chay tren server, khong can browser
- Font register tai module level, tai dung 1 lan

**Cons:**
- Layout KHONG phai HTML/CSS - dung Yoga layout (flexbox subset), phai viet lai UI
- Khong ho tro `table` native - phai tu build bang `<View>` rows
- Debug kho hon HTML: khong co browser devtools
- Nhieu GitHub issues ve font diacritics, can test ky voi tieng Viet
- Module-level `Font.register()` co the loi tren server components (can workaround)

#### B. Puppeteer/Playwright
| Tieu chi | Danh gia |
|---|---|
| Font tieng Viet | Dung browser rendering, ho tro native |
| Serverless | CAN Chromium (~50MB+), Vercel free tier KHONG du timeout/memory |
| Layout match | Match 100% voi HTML vi render chinh cai HTML do |
| Performance | Cham (5-15s khoi dong Chromium), RUI RO vuot 10s timeout |

**Pros:**
- Layout pixel-perfect voi share preview HTML
- Dung lai dung CSS da co, khong code them

**Cons:**
- **LOAI BO** - Chromium khong chay duoc tren Vercel free tier (timeout 10s, memory limit)
- Phai dung dich vu ngoai (Browserless.io, ApiFlash) => them chi phi, dependency
- Cold start cham

#### C. jsPDF + html2canvas (html2pdf.js)
| Tieu chi | Danh gia |
|---|---|
| Font tieng Viet | html2canvas render thanh image => font tieng Viet OK |
| Serverless | CLIENT-SIDE only (can browser DOM) |
| Layout match | Gan giong HTML nhung la raster (image) |
| Output quality | Text KHONG selectable, file lon, blur khi zoom |

**Pros:**
- Chay tren client, khong ton serverless resource
- Code don gian: `html2pdf().from(element).save()`

**Cons:**
- Ket qua la image trong PDF, KHONG phai vector text
- Text khong copy/search duoc
- File size lon (500KB-2MB cho 1 trang don)
- In ra bi blur
- Khong chuyen nghiep cho bao gia thuong mai

#### D. jsPDF (pure)
| Tieu chi | Danh gia |
|---|---|
| Font tieng Viet | Ho tro nhung phai nhung font rieng, API phuc tap |
| Layout | Manual positioning (x, y coordinates) - rat kho maintain |

**Loai bo:** Code layout bang toa do qua fragile, khong ai muon maintain.

### QUYET DINH: @react-pdf/renderer

**Ly do chinh:**
1. Da co trong project, zero dependency cost
2. Text vector = chuyen nghiep, selectable, file nho
3. Chay duoc tren Vercel serverless trong 10s
4. React-based phu hop team skill

**Chien luoc implementation:**
- Tao `src/lib/generate-pdf-quote.tsx` - document component rieng cho PDF
- Dung chung type `QuotePreviewData` + `CompanyInfo` tu `quote-preview.tsx`
- Register font: `Font.register({ family: "Roboto", src: "/fonts/Roboto-Regular.ttf" })`
- Tao API route `src/app/api/export/pdf/[quoteId]/route.ts`
- Layout KHONG can match pixel-perfect voi HTML, chi can cung noi dung va cau truc

**Rui ro can xu ly:**
- Font path tren Vercel: co the can dung absolute URL hoac bundle font
- Test ky voi tieng Viet co dau (a, e, o, u, d)
- Performance: test voi bao gia 50+ items de dam bao < 10s

---

## 3. Feature 2: Authentication

### Van de
Bao ve dashboard, chi cho phep team (1-5 nguoi) dang nhap. Share link (`/chia-se/[token]`) phai van public.

### Phuong an danh gia

#### A. Clerk -- LOAI BO
| Tieu chi | Danh gia |
|---|---|
| Setup | 5 phut, pre-built UI components |
| Gia | Free 10,000 MAU, nhung du lieu KH o Clerk cloud |
| Tieng Viet | UI components tieng Anh, customize han che |
| Data ownership | KHONG - du lieu user nam tren Clerk server |
| Prisma integration | Khong native, phai sync webhook |

**Pros:** Nhanh nhat de setup, co san UI, session management tot
**Cons:**
- **Lock-in** - du lieu user khong nam o DB cua minh
- UI tieng Anh, kho custom sang tieng Viet hoan toan
- Webhook sync phuc tap khi can lien ket user voi data Prisma
- Chi 1-5 users ma dung managed service la OVERKILL
- Mat kiem soat neu Clerk thay doi pricing/policy

#### B. Better Auth -- KHUYEN NGHI
| Tieu chi | Danh gia |
|---|---|
| Setup | 30 phut - 1 gio, co Prisma adapter |
| Gia | FREE, open-source, self-hosted |
| Tieng Viet | Tu build UI => toan quyen custom |
| Data ownership | 100% - data trong PostgreSQL cua minh |
| Prisma integration | Native adapter, auto-generate schema |

**Pros:**
- **Data ownership 100%** - user table trong PostgreSQL, query truc tiep
- Prisma adapter native, phu hop stack hien tai
- Plugin architecture: teams, MFA, magic links (chi cai khi can)
- Tu build login UI = toan quyen tieng Viet, match design system
- Email/password out of the box, khong can CredentialProvider hack
- Active development, growing community
- Next.js App Router support voi `nextCookies()` plugin
- **Prisma co guide chinh thuc** cho Better Auth + Next.js

**Cons:**
- Phai tu build login/register UI (nhung chi can 1-2 trang)
- Moi hon Clerk/NextAuth, community nho hon
- Self-manage session, password hashing (nhung library lo het)

#### C. NextAuth v5 (Auth.js)
| Tieu chi | Danh gia |
|---|---|
| Setup | 1-2 gio, config phuc tap |
| Gia | Free, open-source |
| Docs | Nhieu nguoi phan nan docs v5 kem, config kho |

**Pros:** Pho bien nhat, nhieu tai lieu, nhieu provider
**Cons:**
- Docs v5 bi phan nan nhieu ("horrible docs, config doesn't work")
- CredentialsProvider van la hack, khong chuan
- Config callback maze phuc tap
- Session management qua phuc tap cho 1-5 users

### QUYET DINH: Better Auth

**Ly do chinh:**
1. Data ownership 100% - user data trong PostgreSQL, khong dependency ngoai
2. Prisma adapter native - phu hop stack hien tai
3. Tu build UI = tieng Viet hoan toan, match shadcn/ui design
4. Plugin architecture - chi cai nhung gi can, YAGNI
5. Chi 1-5 users, khong can managed service

**Implementation plan:**
- Cai `better-auth` + Prisma adapter
- Them User model vao Prisma schema (Better Auth tu generate)
- Tao `/dang-nhap` page voi shadcn/ui form
- Middleware protect `/` (dashboard routes), skip `/chia-se/*`
- Seed 1-2 user accounts ban dau
- Phase sau moi them roles (admin/viewer) neu can

**QUAN TRONG:** Share link `/chia-se/[token]` KHONG bi anh huong boi auth. Route nay nam ngoai dashboard layout.

---

## 4. Feature 3: Email Bao Gia

### Phuong an danh gia

#### A. Resend -- KHUYEN NGHI
| Tieu chi | Danh gia |
|---|---|
| Free tier | 3,000 emails/thang (du cho team 1-5, ~50-100 bao gia/thang) |
| DX | API don gian nhat, 3 dong code gui email |
| React Email | Ho tro `@react-email/components` de build template |
| Attachment | Ho tro attach file (PDF) |
| Domain | Can verify domain de gui tu email cong ty |

**Pros:**
- API cuc don gian: `resend.emails.send({ from, to, subject, html, attachments })`
- React Email templates = build email bang React components
- 3,000 email/thang free = du dung
- Attach PDF truc tiep (generate PDF -> attach buffer)
- Vercel-friendly, nhieu example

**Cons:**
- Free tier: log retention chi 1 ngay
- Can custom domain de gui tu email cong ty (khong dung @resend.dev)
- Khong co open/click tracking tren free tier

#### B. SendGrid
**Pros:** 100 email/ngay free, lon hon va stable
**Cons:** API phuc tap hon, UI console nang ne, overkill cho use case nay

#### C. Nodemailer + Gmail SMTP
**Pros:** Free, quen thuoc
**Cons:** Gmail gioi han 500/ngay, hay bi block, "Less secure apps" deprecated, khong reliable cho production

### QUYET DINH: Resend

**Ly do:** API don gian nhat, React Email support, free tier 3,000/thang du dung, Vercel integration tot.

**Implementation plan:**
- Cai `resend` package
- Tao email template React component (`src/lib/email-templates/quote-email.tsx`)
- API route `src/app/api/email/send-quote/route.ts`
- Flow: Generate PDF buffer -> attach vao email + include share link
- UI: nut "Gui email" trong quote detail page va share page

**HONEST ASSESSMENT:** Feature nay KHONG nen lam truoc PDF export. Gui email can PDF attachment de chuyen nghiep. Neu chi gui link thi lam truoc duoc, nhung gia tri thap hon.

---

## 5. Feature 4: Theo Doi Khach Xem Link

### Danh gia thuc te

**MUC DO CAN THIET: THAP - co the delay sang Phase 3**

Ly do:
- Team 1-5 nguoi, 50-100 bao gia/thang => nho du de nho ai da gui cho ai
- Phan lon gui qua Zalo => KH nhan la biet
- ROI thap so voi effort

### Neu van muon lam (simple version)

**Schema:**
```prisma
model QuoteView {
  id        String   @id @default(cuid())
  quoteId   String   @map("quote_id")
  quote     Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  viewedAt  DateTime @default(now()) @map("viewed_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")

  @@index([quoteId])
  @@map("quote_views")
}
```

**Implementation:**
- Trong `/chia-se/[token]/page.tsx`: insert 1 record `QuoteView` moi lan load page
- Dashboard: hien so luot xem ben canh moi bao gia
- **KHONG can real-time notification** - batch hien thi tren dashboard la du
- Deduplicate: co the group theo IP + ngay de tranh dem nhieu lan

**Privacy:**
- Chi luu IP + user agent, KHONG luu cookie/fingerprint
- Hien thi chung chung: "Da xem 3 lan" thay vi chi tiet IP
- Khong anh huong UX cua khach xem

**KHUYEN NGHI:** Delay feature nay. Neu muon lam, chi can < 1 gio code. Khong dang de phai plan chi tiet.

---

## 6. Feature 5: Upload Logo (Vercel Blob)

### Hien trang
- `@vercel/blob` v2.3.0 da cai
- Prisma schema: `Settings.logoUrl` da co
- Chua config `BLOB_READ_WRITE_TOKEN` env var

### Danh gia

**Vercel Blob la lua chon dung, KHONG can migrate.**

| Tieu chi | Danh gia |
|---|---|
| Free tier | Vercel Hobby: da bao gom blob storage |
| File size | Logo < 500KB, trong limit |
| Integration | `@vercel/blob` da co, chi can config token |
| CDN | Vercel Blob tu dong co CDN URL |

**Implementation (< 2 gio):**
1. Generate `BLOB_READ_WRITE_TOKEN` trong Vercel dashboard
2. Them env var vao `.env.local` va Vercel project settings
3. Tao upload route dung client upload (bypass 4.5MB serverless limit)
4. Update settings form de co file input cho logo
5. Hien thi logo trong quote preview + PDF

**Co nen migrate sang solution khac?**
**KHONG.** Vercel Blob phu hop hoan toan:
- Chi upload 1 file duy nhat (logo cong ty)
- Da co package, chi can config
- CDN built-in, integrates voi `next/image`
- Supabase Storage la overkill cho 1 file logo

---

## 7. Feature 6: Mobile Responsive Polish

### Hien trang da co
- `MobileBottomNav` (bottom nav bar, an tren md+)
- Quote builder: toggle "Nhap lieu" / "Xem truoc" tren mobile
- Dashboard layout: `pb-20 md:pb-6` cho bottom nav spacing

### Pain Points chinh

#### 7.1 Quote Items Table
- Grid layout `grid-cols-[24px_1fr_60px_100px_100px_80px_100px_32px]` voi `min-w-[600px]`
- Tren mobile: scroll ngang bat buoc, UX kem
- **Giai phap:** Card-based layout tren mobile thay vi table rows

#### 7.2 Quote Preview
- `maxWidth: 800px` co dinh, tren mobile text qua nho
- Table bao gia voi nhieu cot bi tran
- **Giai phap:** Responsive breakpoints, stack columns tren mobile

#### 7.3 Data Tables (San pham, Khach hang, Bao gia)
- Chua biet layout chinh xac nhung kha nang dung table standard
- **Giai phap:** Dung responsive card pattern hoac horizontal scroll voi shadow indicator

#### 7.4 Forms
- Settings forms, product forms co the qua rong tren mobile
- **Giai phap:** Stack layout, full-width inputs

### HONEST ASSESSMENT
Mobile polish la **nice-to-have, KHONG critical.** Ly do:
- Team 1-5 nguoi dung app tren laptop/desktop la chinh
- Khach hang xem share link tren mobile => share link page (`/chia-se/[token]`) moi can responsive that su
- Quote builder tren mobile la sub-optimal experience bat ke the nao (nhieu fields, con so)

**KHUYEN NGHI:** Chi polish share link page cho mobile. Quote builder/dashboard chi can usable, khong can perfect.

---

## 8. Thu Tu Trien Khai Toi Uu

### Dependency Chain Analysis

```
PDF Export ──┐
             ├──> Email Bao Gia (can PDF de attach)
Auth ────────┤
             └──> View Tracking (can auth de biet ai la owner)
Upload Logo ────> (doc lap, bat ky luc nao)
Mobile Polish ──> (doc lap, bat ky luc nao)
```

### De xuat thu tu

| # | Feature | Effort | Dependency | Gia tri |
|---|---------|--------|------------|---------|
| 1 | **Upload Logo** | 2h | None | Trung binh - hoan thien branding |
| 2 | **PDF Export** | 1-2 ngay | None (dung Roboto da co) | CAO - KH can PDF, chuyen nghiep |
| 3 | **Authentication** | 1 ngay | None | CAO - bao ve data, bat buoc truoc khi dua nhieu nguoi dung |
| 4 | **Email Bao Gia** | 0.5-1 ngay | PDF Export (de attach) | TRUNG BINH - tien loi nhung gui Zalo van OK |
| 5 | **Mobile Polish** | 0.5 ngay | None | THAP - chi polish share link page |
| 6 | **View Tracking** | 2h | None | THAP - delay duoc, ROI thap |

### Sprint plan de xuat

**Sprint 1 (3-4 ngay):**
1. Upload Logo (2h) - nhanh, doc lap, unlock logo trong PDF
2. PDF Export (1-2 ngay) - feature gia tri cao nhat
3. Them nut "Tai PDF" vao share page + quote detail

**Sprint 2 (2-3 ngay):**
4. Authentication (1 ngay) - Better Auth + Prisma
5. Email Bao Gia (0.5-1 ngay) - gui link + attach PDF

**Sprint 3 (0.5-1 ngay, optional):**
6. Mobile polish (chi share link page)
7. View tracking (neu con thoi gian)

**Tong estimate: ~6-8 ngay lam viec**

---

## 9. Nhung Cai KHONG Nen Lam (Brutal Honesty)

### Over-engineering risks
1. **Real-time notifications cho view tracking** - WebSocket/SSE cho 1-5 users la overkill. Polling hoac chi hien tren dashboard khi reload la du.
2. **Role-based access phuc tap** - Chi can 1 role: authenticated user. Admin/viewer distinction khong can thiet voi 1-5 nguoi cung team.
3. **Email template builder** - Khong can. 1 template co dinh la du. KH nhan email chi can biet: ai gui, bao gia so may, click link/open PDF.
4. **PDF template customization** - Khong can. 1 layout chuyen nghiep, co dinh. Tuy chinh mau sac qua `primaryColor` da co la du.
5. **Quote comparison/versioning** - Phase 1 brainstorm co nhac nhung YAGNI. Clone quote da du cho use case "sua va gui lai".
6. **Analytics dashboard cho email** - Resend free khong co. Va 50-100 email/thang thi tu nho cung duoc.

### Nhung cai nen lam nhung de bi bo qua
1. **Error handling cho PDF generation** - Timeout, font load fail, memory limit. Can try-catch + user-friendly error message.
2. **Loading states** - PDF generation mat 1-3s. Can loading indicator.
3. **PDF preview truoc khi tai** - Optional nhung UX tot. Co the dung `@react-pdf/renderer` voi `PDFViewer` component tren client.
4. **Email validation truoc khi gui** - Check email format, confirm dialog.

---

## 10. Rui Ro Va Mitigation

| Rui ro | Kha nang | Impact | Mitigation |
|--------|----------|--------|------------|
| Font tieng Viet bi loi trong PDF | Trung binh | Cao | Test som voi moi ky tu dac biet: a, e, o, u, d. Fallback: dung Noto Sans thay Roboto |
| PDF generation vuot 10s timeout | Thap | Cao | Limit items/page, lazy font load, test voi 100+ items |
| Better Auth breaking changes | Thap | Trung binh | Pin version, doc changelog truoc khi upgrade |
| Resend domain verification | Thap | Trung binh | Config DNS som, co the mat 24-48h propagate |
| Vercel Blob token misconfiguration | Thap | Thap | Test local truoc, check env vars tren Vercel dashboard |

---

## 11. Ky Thuat Chi Tiet - PDF Export

### Font Strategy
```typescript
// src/lib/pdf/register-fonts.ts
import { Font } from "@react-pdf/renderer";
import path from "path";

// Register tai module level, chi chay 1 lan
Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf") },
    { src: path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf"), fontWeight: "bold" },
  ],
});
```

**LUU Y VERCEL:** `process.cwd()` tren Vercel co the khong tro dung cho. Can test. Fallback: host font tren Vercel Blob hoac dung absolute URL.

### PDF Document Structure
```
QuotePdfDocument (React component)
  ├── Page
  │   ├── Header (logo + company info)
  │   ├── Title ("BANG BAO GIA" + so + ngay)
  │   ├── Customer info box
  │   ├── Items table (View-based rows)
  │   ├── Summary (tam tinh, CK, VAT, tong)
  │   ├── Amount in words
  │   ├── Terms
  │   ├── Signature blocks
  │   └── Bank info footer
  └── (Additional pages auto-paginate)
```

### API Route
```
GET /api/export/pdf/[quoteId]
  1. Fetch quote + settings tu DB
  2. Map data sang QuotePreviewData + CompanyInfo (reuse types)
  3. renderToBuffer(<QuotePdfDocument data={...} company={...} />)
  4. Return Response voi Content-Type: application/pdf
```

---

## 12. Ky Thuat Chi Tiet - Authentication

### Better Auth Schema Addition
```prisma
// Them vao schema.prisma (Better Auth tu generate)
model User {
  id            String   @id
  name          String
  email         String   @unique
  emailVerified Boolean  @default(false) @map("email_verified")
  image         String?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  sessions Session[]
  accounts Account[]
  @@map("users")
}

model Session {
  id        String   @id
  expiresAt DateTime @map("expires_at")
  token     String   @unique
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("sessions")
}

model Account {
  id                String  @id
  accountId         String  @map("account_id")
  providerId        String  @map("provider_id")
  userId            String  @map("user_id")
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken       String? @map("access_token")
  refreshToken      String? @map("refresh_token")
  idToken           String? @map("id_token")
  accessTokenExpiresAt  DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope             String?
  password          String?
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("accounts")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("verifications")
}
```

### Route Protection Strategy
```
/                     -> PROTECTED (dashboard)
/(dashboard)/*        -> PROTECTED
/api/*                -> PROTECTED (tru /api/export/* neu can public)
/chia-se/[token]      -> PUBLIC (khong can auth)
/dang-nhap            -> PUBLIC (login page)
```

Middleware: check session, redirect `/dang-nhap` neu chua login. Skip cho `/chia-se/*` va static assets.

---

## 13. Success Metrics Phase 2

| Metric | Target |
|--------|--------|
| PDF export time | < 5s cho bao gia 50 items |
| PDF font rendering | 100% ky tu tieng Viet hien dung |
| Login flow | < 3s tu nhap credentials den dashboard |
| Email delivery | > 95% inbox (khong spam folder) |
| Share link load time | < 2s tren mobile 4G |

---

## 14. Unresolved Questions

1. **Font path tren Vercel production:** Can verify `process.cwd() + "/public/fonts/"` hoat dong tren Vercel serverless. Neu khong, can host font tren URL khac.
2. **Email domain:** Team da co custom domain de verify voi Resend chua? Neu chua, can dung `@resend.dev` sender (it chuyen nghiep).
3. **Better Auth version pinning:** Current latest version la bao nhieu? Can pin chinh xac trong package.json.
4. **PDF export cho share link:** Khach hang co the tai PDF tu share link (`/chia-se/[token]`) hay chi team noi bo tai? Anh huong den auth strategy cho API route.
5. **Vercel Blob pricing:** Free tier co bao gom blob storage khong hay can Vercel Pro? Can verify truoc khi implement.

---

## 15. References

- [@react-pdf/renderer fonts](https://react-pdf.org/fonts)
- [Better Auth + Prisma + Next.js guide](https://www.prisma.io/docs/guides/betterauth-nextjs)
- [Better Auth installation](https://better-auth.com/docs/installation)
- [Resend pricing](https://resend.com/pricing)
- [Vercel Blob docs](https://vercel.com/docs/vercel-blob)
- [Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [PDF generation comparison](https://npm-compare.com/html2pdf.js,jspdf,react-pdf,react-to-pdf)
- [Clerk vs Better Auth comparison](https://clerk.com/articles/better-auth-clerk-complete-authentication-comparison-react-nextjs)
- [NextAuth vs Clerk comparison 2025](https://chhimpashubham.medium.com/nextauth-js-vs-clerk-vs-auth-js-which-is-best-for-your-next-js-app-in-2025-fc715c2ccbfd)
