# Project Changelog - Auto Quotation

All notable changes to Auto Quotation are documented here. Format based on Keep a Changelog.

## [Unreleased]

### Planned (Phase 2)
- User authentication with Better Auth
- Email notifications with Resend
- Quote view tracking
- Advanced analytics and reporting
- Quote templates
- Role-based access control

---

## [1.0.0] - 2026-02-28

### Initial Release

Complete quote management system for Vietnamese businesses.

#### Added

**Core Features:**
- Dashboard with recent quotes and statistics
- Quote creation and management (CRUD)
- Product catalog with categories and units
- Tiered pricing and volume discounts
- Customer management and history
- Professional PDF export with branding
- Excel export with multi-sheet breakdown
- Secure quote sharing via token-based links
- Company settings and customization
- Excel import wizard for bulk product upload

**Technical:**
- Next.js 15 App Router with TypeScript
- PostgreSQL database with Prisma ORM
- Neon serverless database
- Vercel deployment with auto-scaling
- React 19 with Server/Client components
- Tailwind CSS 4 for styling
- shadcn/ui component library
- React Hook Form + Zod validation
- @react-pdf/renderer for PDF generation
- ExcelJS for Excel handling
- Vitest for unit testing

**Infrastructure:**
- Vercel hosting with edge functions
- Neon PostgreSQL (serverless)
- Vercel Blob for file storage
- Automatic deployments from git
- SSL/HTTPS everywhere
- CDN for static assets
- Error boundaries and error pages

**Documentation:**
- Comprehensive README
- System architecture documentation
- Code standards and guidelines
- Deployment guide
- Codebase summary
- Development roadmap

#### Features by Category

**Quote Management:**
- Create quotes from product catalog
- Add custom line items
- Drag-and-drop item reordering
- Quantity, price, discount per line
- Global discount and VAT controls
- Shipping and other fees
- Custom payment terms
- Auto-increment quote numbering
- Quote status tracking (Draft, Sent, Accepted, Rejected, Expired)
- Quote validity dates
- Denormalized customer snapshot for historical accuracy
- Period selector for subscription items

**Product Management:**
- Product CRUD with code, name, description
- Category organization
- Unit/measurement support (Tháng, Cái, Bộ, etc.)
- Base pricing
- Tiered pricing (quantity-based price ranges)
- Volume discounts (automatic discount thresholds)
- Pricing type selection (Fixed or Tiered)
- Search and filtering
- Data table with pagination
- Excel import with validation

**Customer Management:**
- Customer CRUD
- Contact information (phone, email, address)
- Company association
- Custom notes
- Quote history linking
- Search and filtering
- Data table with sorting

**Settings & Configuration:**
- Company information (name, address, contact)
- Tax code, website, bank details
- Logo upload and storage (Vercel Blob)
- Brand color customization
- Greeting text for quotes
- Default payment terms
- Quote number prefix configuration
- Default VAT percentage
- Default quote validity period
- Shipping fee defaults
- Display options (signature blocks, bank info, etc.)
- Amount in words display

**Export Features:**
- PDF export with professional layout
  - Company logo and branding
  - Customizable colors
  - Items table with totals
  - Amount in Vietnamese words
  - Payment terms and signature blocks
  - Bank information display
  - Responsive layout
- Excel export with multiple sheets
  - Summary sheet
  - Items detail
  - Calculation breakdown
  - Formatted headers and totals

**Sharing:**
- Generate secure share tokens
- Public quote view (no auth required)
- Read-only presentation
- Direct PDF download from share page
- Company branding in share page

**Import:**
- Excel file upload validation
- Column mapping (Code, Name, Category, Unit, Price, Description)
- Data type validation
- Duplicate detection
- Auto-create categories/units
- Preview before import
- Detailed import report (created, updated, errors)

**UI/UX:**
- Responsive design (desktop, tablet, mobile)
- Dark-friendly Tailwind styling
- Loading states and skeletons
- Error boundaries with helpful messages
- Form validation with clear error messages
- Confirmation dialogs for destructive actions
- Toast notifications for feedback
- Keyboard navigation support
- Mobile-optimized layouts
- Quick actions and shortcuts

**Data Management:**
- Database seeding with FPT Internet packages
- 10 sample products for testing
- Category "Gói Internet"
- Unit "Tháng" (Month)
- Computed totals for quotes (denormalized)
- Index optimization for queries
- Transaction support for multi-step operations

#### Testing

- Unit tests for pricing engine
- Schema validation tests
- Import parser tests
- Currency formatting tests
- Quote number generation tests
- 90%+ test coverage
- All critical paths tested

#### Deployment

- Vercel production environment
- Neon PostgreSQL database (ap-southeast-1 region)
- Automatic CI/CD via git push
- Environment variables for secrets
- Zero-downtime deployments
- Rollback capability
- Health checks and monitoring

#### Bug Fixes & Improvements (Phase 1)

- Fixed @react-pdf/renderer font resolution
- Fixed PDF error details in response
- Added @react-pdf/renderer to serverExternalPackages
- Fixed Prisma config for Vercel compatibility
- Fixed pnpm v10 script compatibility for Vercel

### Breaking Changes
None (initial release)

### Deprecations
None (initial release)

### Known Issues

- No user authentication (implemented in Phase 2)
- No email notifications (implemented in Phase 2)
- View tracking not available (Phase 2)
- Limited to single-user operation (auth in Phase 2)
- No API for external integrations (future)

### Dependencies Added

**Production:**
- next@16.1.6
- react@19.2.4
- react-dom@19.2.4
- typescript@5
- @prisma/client@7.4.2
- @prisma/adapter-neon@7.4.2
- @neondatabase/serverless@1.0.2
- @react-pdf/renderer@4.3.2
- @vercel/blob@2.3.0
- react-hook-form@7.71.2
- zod@4.3.6
- tailwindcss@4
- @tailwindcss/postcss@4
- shadcn@3.8.5
- class-variance-authority@0.7.1
- clsx@2.1.1
- cmdk@1.1.1
- date-fns@4.1.0
- exceljs@4.4.0
- lucide-react@0.575.0
- radix-ui@1.4.3
- sonner@2.0.7
- tailwind-merge@3.5.0
- @hookform/resolvers@5.2.2
- @dnd-kit/core@6.3.1
- @dnd-kit/sortable@10.0.0
- @dnd-kit/utilities@3.2.2

**Development:**
- prisma@7.4.2
- vitest@4.0.18
- eslint@9
- eslint-config-next@16.1.6
- tsx@4.21.0
- tw-animate-css@1.4.0

### Database Schema (Version 1.0)

**Tables:**
1. settings - Company configuration singleton
2. categories - Product categories
3. units - Measurement units
4. products - Product catalog
5. pricing_tiers - Tiered pricing
6. volume_discounts - Quantity-based discounts
7. customers - Customer information
8. quotes - Quotation documents
9. quote_items - Quote line items

**Key Enums:**
- PricingType: FIXED, TIERED
- QuoteStatus: DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED

---

## [0.1.0] - 2026-01-27

### Project Setup

Initial project setup with Next.js create-next-app boilerplate.

#### Added
- Next.js 15 project structure
- TypeScript configuration
- Tailwind CSS setup
- ESLint configuration
- Empty README from create-next-app

---

## Unreleased - Phase 2 (Planned)

### Planned Features (Not Yet Implemented)

#### Authentication & Authorization
- User registration and login system
- Better Auth integration
- Role-based access control (Admin, Sales, View-only)
- User-scoped data access
- Session management
- Password reset flow

#### Notifications
- Email service integration (Resend)
- Send quote via email
- Status change notifications
- Quote expiration reminders
- Email templates
- Notification preferences
- Async job queue

#### Analytics & Tracking
- Quote view tracking (anonymized)
- Quote status history log
- Customer communication timeline
- Sales pipeline visualization
- Revenue metrics
- Export reports
- Dashboard analytics

#### UX Improvements
- Quote templates
- Bulk operations (create/export multiple)
- Advanced search and filters
- Custom fields
- Recurring quotes
- Quote comparison
- Mobile app (future)

---

## Documentation History

| Date | Version | Status | Changes |
|------|---------|--------|---------|
| 2026-02-28 | 1.0.0 | Released | Initial production release |
| 2026-03-03 | 1.0.1 (in docs) | Documented | Complete documentation created |

## How to Use This Changelog

- **Unreleased** section captures planned work
- **Version sections** document releases in reverse chronological order
- **Added** lists new features and functionality
- **Changed** lists modifications to existing features
- **Deprecated** lists features to be removed in future versions
- **Removed** lists deleted features
- **Fixed** lists bug fixes
- **Security** lists vulnerability fixes
- **Known Issues** section documents current limitations

## Version Numbering

Following Semantic Versioning 2.0.0:
- MAJOR version for incompatible API changes
- MINOR version for new functionality (backward compatible)
- PATCH version for bug fixes (backward compatible)

## Release Process

1. Update this changelog with new version and date
2. Update version in package.json
3. Create git tag: `git tag v1.0.0`
4. Deploy to production
5. Announce in team channels

## Future Release Notes

### Phase 2 Release (Estimated April 2026)

Expected improvements:
- User authentication and multi-user support
- Email notification system
- Analytics dashboard
- View tracking for quotes
- Advanced filters and search
- Quote templates
- Significantly improved scalability for enterprise use

### Phase 3 Release (Estimated June 2026)

Expected improvements:
- Third-party API integrations
- CRM integrations
- Mobile applications
- Advanced reporting and BI features
- Custom fields and metadata
- Multi-currency support

---

## Related Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [Development Roadmap](./development-roadmap.md)
- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
