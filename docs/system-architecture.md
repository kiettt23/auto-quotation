# System Architecture - Auto Quotation

Last Updated: 2026-03-03

## Architecture Overview

Auto Quotation follows a modern Next.js architecture with server-side rendering for data fetching and client-side interactivity for user interactions. The system is divided into three main layers: presentation, business logic, and data persistence.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  React Components (19) + Tailwind CSS + shadcn/ui       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
┌────────────────────┴────────────────────────────────────┐
│                   Next.js 15 Server                       │
│  App Router │ Server Components │ API Routes │ Middleware│
└────────────────┬──────────────────────────────────────┬──┘
                 │                                      │
    ┌────────────┴────────────┐      ┌────────────────┴─────────┐
    │  Business Logic Layer    │      │   File Storage           │
    │  - Pricing Engine        │      │   - Vercel Blob (logos) │
    │  - PDF Generation        │      └──────────────────────────┘
    │  - Excel Export          │
    │  - Validation (Zod)      │
    │  - Import Parsing        │
    └────────────┬─────────────┘
                 │
    ┌────────────┴──────────────────┐
    │   Data Persistence Layer       │
    │   Prisma ORM + PostgreSQL      │
    │   (Neon serverless)            │
    └────────────────────────────────┘
```

## Layer Details

### 1. Presentation Layer

**Components:**
- Page components (`src/app/**/*.tsx`)
- Client components with forms and interactivity
- UI components from shadcn/ui (Button, Dialog, Table, etc.)
- Layout components (Navbar, Sidebar)

**Technology:**
- Next.js 15 App Router
- React 19 with Server & Client components
- Tailwind CSS 4 for styling
- shadcn/ui for consistent UI
- Lucide React for icons

**Key Patterns:**
- Server components fetch data from database
- Client components ('use client') handle user interactions
- Form submission via Server Actions or API routes

### 2. Business Logic Layer

**Modules:**

| Module | Location | Purpose |
|--------|----------|---------|
| Pricing Engine | `src/lib/pricing-engine.ts` | Calculate quote totals with tiered pricing, discounts, VAT |
| PDF Generator | `src/lib/generate-pdf-quote.tsx` | Create PDF documents with branding |
| Excel Generator | `src/lib/generate-excel-quote.ts` | Create Excel exports |
| Import Parser | `src/lib/import-excel-parser.ts` | Parse and validate Excel imports |
| Formatting | `src/lib/format-*.ts` | Format currency, numbers to text |
| Validation | `src/lib/validations/*.ts` | Zod schemas for forms |

**API Routes:**
- `src/app/api/export/pdf/[quoteId]` - PDF generation endpoint
- `src/app/api/export/excel/[quoteId]` - Excel generation endpoint
- `src/app/api/import/parse` - Parse Excel file
- `src/app/api/import/execute` - Execute import

### 3. Data Persistence Layer

**Database:** PostgreSQL (Neon serverless)

**ORM:** Prisma 7 with Neon adapter

**Connection:** Pooling via Neon serverless adapter for Vercel

## Data Models

### Domain: Company Settings

```
Settings (singleton)
├── companyName, address, phone, email, taxCode, website
├── bankName, bankAccount, bankOwner
├── logoUrl (Vercel Blob)
├── primaryColor, greetingText, defaultTerms
├── Display options (show signature blocks, VAT in words)
├── Quote defaults (prefix, number sequence, VAT percent)
└── Timestamps: createdAt, updatedAt
```

### Domain: Products & Pricing

```
Category
├── id, name, sortOrder
└── products []

Unit
├── id, name
└── products []

Product
├── id, code (unique), name, description, notes
├── category, unit
├── basePrice, pricingType (FIXED|TIERED)
├── pricingTiers [] (volume-based pricing)
├── volumeDiscounts [] (quantity-based discounts)
└── Timestamps

PricingTier
├── productId, minQuantity, maxQuantity, price
└── Enables price ranges: e.g., "1-10 units: 100k, 11-50: 90k"

VolumeDiscount
├── productId, minQuantity, discountPercent
└── Enables: "Order 100+: 10% off"
```

### Domain: Quotes & Orders

```
Customer
├── id, name, company, phone, email, address, notes
└── quotes []

Quote
├── id, quoteNumber (unique), status (DRAFT|SENT|ACCEPTED|REJECTED|EXPIRED)
├── customerId (optional), customer snapshot (denormalized)
├── Pricing:
│  ├── globalDiscountPercent, vatPercent
│  ├── shippingFee, otherFees, otherFeesLabel
│  ├── Computed: subtotal, discountAmount, vatAmount, total
├── Notes, terms, shareToken
├── items [] (QuoteItem[])
└── Timestamps

QuoteItem
├── quoteId, productId (optional)
├── name, description, unit, sortOrder
├── quantity, unitPrice
├── discountPercent (item-level)
├── lineTotal (computed)
├── isCustomItem (true if not from product catalog)
└── Supports both catalog products and custom line items
```

## Data Flow Diagrams

### Quote Creation Flow

```
┌─────────────────────┐
│  Dashboard Page     │
│  (Server Component) │
│  Fetches Quote Data │
└──────────┬──────────┘
           │
           ├─ Renders Quote Builder Client Component
           │  └─ User adds items, adjusts pricing
           │
           ├─ Submit (Server Action or API)
           │
           ├─ Validate with Zod Schema
           │
           ├─ Calculate totals (Pricing Engine)
           │
           ├─ Save to Database (Prisma)
           │
           └─ Revalidate page & show success
```

### PDF Export Flow

```
┌──────────────────────┐
│ Export PDF Request   │
│ GET /api/export/pdf/ │
│        [quoteId]     │
└──────────┬───────────┘
           │
           ├─ Fetch Quote + Items from DB
           │
           ├─ Load Company Settings (branding)
           │
           ├─ Generate PDF Layout
           │  └─ @react-pdf/renderer
           │     ├─ Header (company logo, contact)
           │     ├─ Greeting text
           │     ├─ Items table (name, qty, price, total)
           │     ├─ Pricing summary
           │     └─ Terms & signature blocks
           │
           ├─ Return PDF bytes
           │
           └─ Browser downloads as quote_[number].pdf
```

### Excel Import Flow

```
┌──────────────────────┐
│ User Uploads Excel   │
│ /import/parse        │
└──────────┬───────────┘
           │
           ├─ Parse file with ExcelJS
           │
           ├─ Validate columns (Code, Name, Category, Unit, Price)
           │
           ├─ Validate data types & ranges
           │
           ├─ Return preview (with validation errors if any)
           │
           └─ User reviews & confirms
               │
               └─→ /import/execute
                   ├─ Create/update categories & units
                   ├─ Create/update products
                   └─ Return summary (created, updated, errors)
```

## Pricing Calculation Engine

Located: `src/lib/pricing-engine.ts`

**Features:**

1. **Product-Level Pricing:**
   - Fixed pricing: Use `basePrice`
   - Tiered pricing: Find matching range in `pricingTiers`
   - Apply quantity-based `volumeDiscounts`

2. **Quote-Level Calculation:**
   ```
   For each item:
     itemPrice = quantity × unitPrice
     itemDiscount = itemPrice × (discountPercent / 100)
     itemTotal = itemPrice - itemDiscount

   subtotal = sum of all itemTotals
   globalDiscount = subtotal × (globalDiscountPercent / 100)
   afterDiscount = subtotal - globalDiscount
   subtotalWithFees = afterDiscount + shippingFee + otherFees
   vatAmount = subtotalWithFees × (vatPercent / 100)
   total = subtotalWithFees + vatAmount
   ```

3. **Multiple Price Formats:**
   - Numeric: 1000000 (VND without commas)
   - Formatted: 1.000.000₫
   - Text: "Một triệu đồng" (Vietnamese)

## API Endpoints

### Export Endpoints

**GET `/api/export/pdf/[quoteId]`**
- Generates PDF with company branding
- Returns PDF file download
- Fonts: Roboto (from `/public/fonts/`)

**GET `/api/export/excel/[quoteId]`**
- Generates Excel workbook
- Multiple sheets: Summary, Items, Breakdown
- Returns XLSX file download

### Import Endpoints

**POST `/api/import/parse`**
- Accepts FormData with Excel file
- Returns: `{ success: boolean, preview: [], errors: [] }`
- No database changes yet

**POST `/api/import/execute`**
- Accepts: `{ categoryId, unitId, products: [] }`
- Creates/updates categories, units, and products
- Returns: `{ created: number, updated: number, errors: [] }`

### Share Endpoint

**GET `/chia-se/[token]`**
- Public page for quote sharing
- No authentication required
- Token in Quote model: `shareToken` (unique, random)

## Storage

### Database Storage

- PostgreSQL on Neon (serverless, scalable)
- Automatic backups
- Connection pooling for Vercel

### File Storage

**Vercel Blob:**
- Stores company logos
- Accessed via public URLs
- Token: `BLOB_READ_WRITE_TOKEN`
- Usage: Settings form → Logo uploader

## Security Architecture

### Data Protection

- **Input validation:** Zod schemas prevent invalid data
- **SQL injection:** Prisma parameterized queries
- **CSRF protection:** Built into Next.js Server Actions
- **Denormalization:** Customer data snapshot in Quote prevents data loss

### Access Control (Phase 2)

- Authentication: Better Auth (planned)
- Authorization: User-based quote ownership
- Public sharing: Secure token-based access

### File Security

- Blob tokens: Read/Write separated in environment
- Logo uploads: Validated before storage
- PDF generation: Server-side only (prevents client memory DOS)

## Scalability Considerations

### Horizontal Scaling

- **Stateless API routes:** Can run on multiple edge functions
- **Database:** Neon handles scaling via connection pooling
- **Static assets:** Served via CDN (Vercel)

### Performance Optimization

- **Caching:** Next.js automatic revalidation after mutations
- **Pagination:** Quote list uses server-side pagination (100 items)
- **Lazy loading:** Components loaded on demand via dynamic imports
- **Image optimization:** Logos through Vercel Image Optimization

### Database Optimization

- **Indexes:** On `customerId`, `productId`, `quoteNumber`, `shareToken`
- **Connection pooling:** Neon serverless adapter
- **Computed columns:** Denormalized totals reduce calculation queries

## Deployment Architecture

### Vercel (Recommended)

```
┌─────────────────────┐
│  Git Push (main)    │
└──────────┬──────────┘
           │
           ├─ Vercel Build
           │  ├─ pnpm install
           │  ├─ prisma generate
           │  ├─ next build
           │  └─ Deploy edge functions & static
           │
           ├─ Serverless Functions (API routes)
           │
           ├─ Edge Network (CDN)
           │
           └─ Connected Services
              ├─ PostgreSQL (Neon)
              ├─ Blob Storage (Vercel)
              └─ Logs (Vercel Analytics)
```

See [Deployment Guide](./deployment-guide.md) for setup details.

## Technology Rationale

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | Next.js 15 | Server/Client components, built-in optimization, Vercel integration |
| Database | PostgreSQL + Neon | ACID compliance, JSON support, serverless pricing model |
| ORM | Prisma 7 | Type-safe, excellent DX, Neon native adapter |
| Validation | Zod | Runtime validation, great TypeScript integration |
| UI | shadcn/ui + Tailwind | Accessible, customizable, modern components |
| PDF | @react-pdf/renderer | Server-side generation, React integration |
| Excel | ExcelJS | Rich formatting, streaming support |
| Forms | React Hook Form | Minimal re-renders, good performance |
| Styling | Tailwind CSS 4 | Utility-first, custom properties (CSS 3) |

## Limitations & Trade-offs

| Trade-off | Benefit | Cost |
|-----------|---------|------|
| Denormalized customer data | Fast reads, historical accuracy | Extra disk space |
| Computed totals in Quote | Reduce calculation, audit trail | Must recompute on edit |
| Neon serverless | Cost-effective, auto-scale | Connection overhead |
| No authentication (Phase 1) | Fast MVP, public sharing | Insecure for multi-user |
| Server-side PDF gen | Prevents client DOS, professional output | Higher server load |

## Future Enhancements

**Phase 2 Architecture Changes:**

1. **Authentication Layer**
   - Better Auth middleware
   - User-scoped queries (WHERE userId = ?)
   - API authorization checks

2. **Notification System**
   - Resend email service integration
   - Webhook triggers on quote status changes
   - Async job queue (Bull/Bullmq)

3. **Analytics & Tracking**
   - View tracking for shared quotes
   - Audit logs for quote changes
   - Dashboard metrics (quotes by status, revenue)

4. **Advanced Features**
   - Quote templates (customizable defaults)
   - Bulk operations (export multiple quotes)
   - Recurring quotes (auto-create monthly)
   - API for third-party integrations

## Monitoring & Observability

**Current (Phase 1):**
- Vercel deployment logs
- Error pages (error.tsx boundaries)
- React DevTools for debugging

**Future (Phase 2):**
- Error tracking (Sentry or similar)
- Performance monitoring (Web Vitals)
- Database query logging
- API endpoint metrics
