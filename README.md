# autoquotation

Web app quản lý chứng từ kinh doanh (báo giá, phiếu giao hàng) với PDF generation chuyên nghiệp.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, shadcn/ui, Tailwind CSS 4
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: better-auth (email/password)
- **PDF**: @react-pdf/renderer với template registry
- **Storage**: Vercel Blob

## Getting Started

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env  # fill in DATABASE_URL, BETTER_AUTH_SECRET, etc.

# Push schema to database
pnpm db:push

# Seed sample data (optional)
pnpm db:seed

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Run tests (vitest) |
| `pnpm db:push` | Push schema to DB |
| `pnpm db:seed` | Seed sample data |
| `pnpm db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── app/(auth)/        # Login, register
├── app/(app)/         # Protected pages (documents, products, customers, companies, settings)
├── actions/           # Server actions (CRUD)
├── components/        # UI components (layout, documents, shared, ui)
├── db/                # Schema, seed, migrations
├── lib/
│   ├── pdf/           # Template registry, PDF templates, font registration
│   ├── types/         # DocumentData, ColumnDef
│   ├── validations/   # Zod schemas
│   └── utils/         # Helpers (document-helpers, cn)
└── services/          # Business logic (document, product, customer, company)
```

## Key Concepts

- **Template Registry** — single source of truth for document types. See [docs/template-creation-guide.md](docs/template-creation-guide.md)
- **customData JSONB** — flexible key-value storage on product/customer/company for template-specific autofill
- **Master-detail UI** — list + inline detail panel pattern across all entity pages

## Documentation

- [Template Creation Guide](docs/template-creation-guide.md)
- [System Architecture](docs/system-architecture.md)
- [Codebase Summary](docs/codebase-summary.md)
- [Code Standards](docs/code-standards.md)
- [Development Roadmap](docs/development-roadmap.md)
