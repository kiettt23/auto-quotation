# Auto Quotation - Professional Quote Management Software

Auto Quotation is a modern web application designed for Vietnamese businesses to create, manage, and share professional quotations (báo giá) efficiently. Built with Next.js and PostgreSQL, it provides an intuitive interface for managing products, customers, and generating PDF/Excel exports.

## Key Features

- **Quote Management** - Create, edit, and manage quotes with automatic numbering
- **Product Catalog** - Organize products by categories with support for tiered pricing and volume discounts
- **Customer Database** - Store and manage customer information for quick quote generation
- **Multi-format Export** - Generate professional PDF and Excel exports with company branding
- **Share & Track** - Generate shareable links for quote viewing with secure tokens
- **Settings & Branding** - Customize company information, colors, terms, and default settings
- **Excel Import Wizard** - Bulk import products from Excel files with validation
- **Dashboard** - Quick overview of recent quotes and key metrics
- **Responsive Design** - Full mobile support for on-the-go quote management

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui components |
| **Database** | PostgreSQL (Neon), Prisma 7 ORM |
| **File Storage** | Vercel Blob |
| **Export** | @react-pdf/renderer (PDF), ExcelJS (Excel) |
| **Forms & Validation** | React Hook Form, Zod |
| **UI Components** | Radix UI, Lucide Icons |
| **Build Tools** | TypeScript, ESLint, pnpm |

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- Vercel Blob token (optional, for logo uploads)

### Installation

```bash
# Clone and install
git clone <repo-url>
cd auto-quotation
pnpm install

# Set up environment variables
cp .env.example .env
# Update DATABASE_URL and BLOB_READ_WRITE_TOKEN in .env
```

### Environment Variables

Required variables in `.env`:

```env
# Database connection (PostgreSQL/Neon)
DATABASE_URL="postgresql://user:password@host/dbname"

# Vercel Blob storage token (for logo uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Optional: API keys for future integrations
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Development

```bash
# Setup database schema
pnpm db:push

# Seed sample data (FPT Internet packages)
pnpm db:seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build application
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── bao-gia/            # Quote management
│   │   ├── san-pham/           # Product management
│   │   ├── khach-hang/         # Customer management
│   │   ├── cai-dat/            # Settings
│   │   └── page.tsx            # Dashboard home
│   ├── api/                     # API routes
│   │   ├── export/             # PDF/Excel export endpoints
│   │   └── import/             # Excel import endpoints
│   ├── chia-se/                # Share quote public page
│   └── layout.tsx              # Root layout
├── components/                   # React components
│   ├── ui/                      # shadcn/ui base components
│   ├── dashboard/              # Dashboard components
│   ├── quote/                  # Quote builder & display
│   ├── product/                # Product management
│   ├── customer/               # Customer management
│   ├── settings/               # Settings forms
│   └── layout/                 # Layout components
├── lib/                         # Utilities & helpers
│   ├── db.ts                   # Database client
│   ├── pricing-engine.ts       # Pricing calculations
│   ├── generate-pdf-quote.tsx  # PDF generation
│   ├── generate-excel-quote.ts # Excel generation
│   ├── import-excel-parser.ts  # Excel parsing
│   ├── validations/            # Zod schemas
│   └── __tests__/              # Unit tests
└── generated/                   # Generated Prisma types
```

## Database Schema

Core entities:

- **Settings** - Singleton company configuration
- **Category** - Product categories
- **Unit** - Measurement units (Tháng, Cái, Bộ, etc.)
- **Product** - Products with pricing tiers and volume discounts
- **Customer** - Customer information
- **Quote** - Quotation documents with line items
- **QuoteItem** - Individual line items in quotes

See [System Architecture](./docs/system-architecture.md) for detailed ER diagram.

## Database Commands

```bash
# Create or update schema
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Prisma Studio (visual database editor)
pnpm db:studio

# Generate Prisma client
pnpm db:generate

# Seed with sample data
pnpm db:seed
```

## Development Commands

```bash
# Development server
pnpm dev

# Run linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

### Vercel (Recommended)

```bash
# Link to Vercel
vercel link

# Deploy
vercel deploy --prod
```

Environment variables must be set in Vercel project settings before deployment.

See [Deployment Guide](./docs/deployment-guide.md) for detailed instructions.

## Documentation

- [Project Overview & PDR](./docs/project-overview-pdr.md) - Requirements and product specifications
- [System Architecture](./docs/system-architecture.md) - Technical design and data flow
- [Code Standards](./docs/code-standards.md) - Development guidelines and patterns
- [Codebase Summary](./docs/codebase-summary.md) - File organization and key modules
- [Deployment Guide](./docs/deployment-guide.md) - Deployment and configuration
- [Development Roadmap](./docs/development-roadmap.md) - Project phases and progress

## Project Phases

**Phase 1 (Complete)** - Core quote generation, product/customer management, PDF/Excel export

**Phase 2 (Planned)** - Authentication (Better Auth), Email notifications (Resend), View tracking

## Contributing

1. Follow code standards in [Code Standards](./docs/code-standards.md)
2. Ensure all tests pass: `pnpm test`
3. Run linting: `pnpm lint`
4. Create clear, conventional commit messages
5. Submit PR with descriptive title and changelog notes

## License

Proprietary - Auto Quotation

## Support

For issues, documentation improvements, or feature requests, refer to the development roadmap and create an issue in the project repository.
