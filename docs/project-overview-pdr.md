# Project Overview & Product Development Requirements - Auto Quotation

Last Updated: 2026-03-03 | Phase: 1 Complete, Phase 2 In Planning

## Executive Summary

Auto Quotation is a web-based quotation (báo giá) management system for Vietnamese businesses. It enables businesses to quickly create professional quote documents with company branding, manage product catalogs with tiered pricing, maintain customer relationships, and export quotes as PDF or Excel.

The application is built with Next.js 15, PostgreSQL, and Prisma, deployed on Vercel. Phase 1 MVP delivers core quote generation features; Phase 2 will add user authentication, email notifications, and analytics.

## Vision & Goals

### Vision
Empower Vietnamese SMEs to create and manage professional quotations efficiently, reducing administrative overhead and improving customer communication.

### Core Goals
1. **Simplify quoting:** Quick quote creation from product catalog
2. **Professional presentation:** Customizable branding and formatting
3. **Easy sharing:** Secure, shareable quote links
4. **Data management:** Product, customer, and quote history
5. **Export flexibility:** PDF and Excel formats for various use cases

## Product Definition

### Product Name
**Auto Quotation** (Công cụ tạo báo giá tự động)

### Target Users
- Small to medium Vietnamese businesses (10-100 employees)
- Sales teams, operations, account managers
- Businesses in any industry (IT, manufacturing, services, etc.)

### Primary Use Cases
1. Sales creates quote from product list
2. Customize pricing for customer/order size
3. Export as PDF for email/print
4. Share quote link for customer review
5. Track quote history and customer communication

## Phase 1 - MVP (COMPLETE)

### Phase 1 Objectives
Deliver a functional quote management system with core features.

### Functional Requirements

#### 1. Dashboard
- **Display:**
  - Recent quotes (last 10)
  - Quote statistics (total, by status)
  - Quick links to main functions
  - Mobile responsive

- **Metrics:**
  - Total quotes created
  - Quotes by status (Draft, Sent, Accepted, Rejected)
  - Recent activity timeline

#### 2. Quote Management
- **Create Quotation:**
  - Start from template or blank
  - Select customer (or add inline)
  - Add products from catalog
  - Support custom line items
  - Adjust quantity, unit price, discounts per line
  - Apply global discount and VAT
  - Add shipping, other fees
  - Include payment terms and notes
  - Auto-generate quote number with custom prefix
  - Save as Draft
  - Period selector for subscription items (1/3/6/12 months)

- **Edit Quotation:**
  - All create features available
  - Change customer, items, pricing
  - Update status (Draft → Sent → Accepted/Rejected)
  - Delete items with undo support
  - Drag-and-drop to reorder items

- **View & Export:**
  - Preview in PDF format
  - Download PDF with company branding
  - Export to Excel with detailed breakdown
  - Share via secure token-based link
  - Copy quote (create new from existing)

- **Quote List:**
  - Filter by status (All, Draft, Sent, Accepted, Rejected)
  - Sort by date, customer, amount
  - Search by quote number or customer name
  - Pagination (100 per page)
  - Bulk actions (export multiple)
  - Mobile-friendly list view

#### 3. Product Management
- **Catalog:**
  - Organize by category (e.g., "Gói Internet", "Dịch vụ")
  - Assign unit (e.g., "Tháng", "Cái", "Bộ")
  - Set base price
  - Add description and notes
  - Support two pricing models:
    - **Fixed:** Single base price
    - **Tiered:** Price ranges by quantity (e.g., 1-10 units: 100k, 11-50: 90k)
  - Volume discounts (automatic discount above quantity threshold)
  - Unique product codes for reference

- **Import:**
  - Upload Excel file with columns: Code, Name, Category, Unit, Price, Description
  - Preview before import
  - Validate data types and required fields
  - Create missing categories/units automatically
  - Update existing products or skip
  - Show import summary (created, updated, errors)

- **UI:**
  - Data table with search, filter, sort
  - Create/edit dialog modal
  - Delete with confirmation
  - Mobile list view

#### 4. Customer Management
- **Store Customer Info:**
  - Name, company, phone, email, address
  - Custom notes
  - Creation date, last modified

- **Manage:**
  - Create/edit customer details
  - View customer quote history
  - Search by name or company
  - Delete customer (keeps existing quotes)
  - Bulk import from Excel (future)

- **UI:**
  - Data table with search, sort
  - Create/edit dialog
  - Mobile list view

#### 5. Settings & Configuration
- **Company Info:**
  - Company name, address, phone, email
  - Tax code, website
  - Bank name, account number, account holder
  - Logo upload (stored in Vercel Blob)

- **Quote Defaults:**
  - Quote number prefix (e.g., "BG-{YYYY}-")
  - Next quote number (auto-increment)
  - Default VAT percentage
  - Default quote validity (days)
  - Default shipping fee
  - Default payment terms

- **Display Options:**
  - Primary brand color (hex)
  - Greeting text in quote
  - Default payment terms and conditions
  - Show/hide signature blocks
  - Show/hide bank info
  - Show/hide amount in words (Vietnamese)
  - Footer note (optional)

- **UI:**
  - Form with sections (Company, Bank, Quote Defaults, Display)
  - Logo uploader with preview
  - Color picker for brand color
  - Rich text editor for terms
  - Save confirmation

#### 6. Public Share
- **Share Quote:**
  - Generate secure token-based link
  - Share via email or messaging
  - Recipient views read-only quote
  - No authentication required
  - Link never expires (until deleted)
  - Can download PDF directly
  - Cannot modify quote
  - Display company branding, payment terms

#### 7. Data Exports
- **PDF Export:**
  - Professional layout
  - Company logo (if set)
  - Company info and contact
  - Quote details and validity
  - Items table (name, quantity, unit price, amount)
  - Totals section (subtotal, discount, VAT, total)
  - Amount in Vietnamese words
  - Payment terms and signature blocks
  - Branded colors
  - A4 page format

- **Excel Export:**
  - Multiple sheets:
    - Summary (quote details, customer, settings)
    - Items (line-by-line breakdown)
    - Calculations (pricing breakdown)
  - Formatted headers and totals
  - Ready for further editing

### Non-Functional Requirements

#### Performance
- Quote creation: < 2 seconds
- PDF generation: < 5 seconds
- Excel export: < 3 seconds
- Page load: < 1.5 seconds (after first load)
- Database queries optimized (no N+1)

#### Reliability
- 99.5% uptime target (Vercel standard)
- Database backups (Neon automatic)
- Error boundaries for failed routes
- Graceful error messages to users

#### Security
- HTTPS only
- SQL injection protection (Prisma parameterized queries)
- CSRF protection (Next.js Server Actions)
- File upload validation
- Secure token generation for share links
- No hardcoded secrets in code
- Environment variables for sensitive data

#### Scalability
- Serverless architecture (Vercel)
- Database connection pooling (Neon)
- Stateless API routes
- CDN for static assets
- Support for 1000+ quotes, 100+ customers

#### Accessibility
- WCAG 2.1 Level AA compliance
- Semantic HTML
- Keyboard navigation
- Screen reader support for forms
- Responsive design (mobile-first)

#### Usability
- Intuitive navigation
- Clear error messages
- Confirmation for destructive actions
- Undo/redo support where possible
- Mobile support for essential features
- Fast response to user actions

### Testing Coverage (Phase 1)

| Area | Status | Coverage |
|------|--------|----------|
| Pricing engine | Implemented | 100% |
| Schema validation | Implemented | 100% |
| Quote number generation | Implemented | 100% |
| Excel import parser | Implemented | 95% |
| Currency formatting | Implemented | 100% |
| UI components | Basic | 60% |
| API endpoints | Manual | 80% |

### Data Seed (Phase 1)

**FPT Internet Packages:**
- 10 products seeded
- Category: "Gói Internet" (Internet Packages)
- Unit: "Tháng" (Month)
- Various price points and bandwidth options

### Known Limitations (Phase 1)

1. **No user authentication** → All data is shared (Phase 2)
2. **No email notifications** → Manual sharing via link (Phase 2)
3. **No view tracking** → Cannot see if customer opened quote
4. **No multi-user** → Single user per instance
5. **No templates** → Every quote created from scratch
6. **Limited reporting** → Basic dashboard only
7. **No API** → Internal use only

## Phase 2 - Enhancement (PLANNED)

### Phase 2 Objectives
Add user management, automation, and analytics.

### Planned Features

#### Authentication & Authorization
- User registration and login (Better Auth)
- Multiple user roles (Admin, Sales, View-only)
- User-scoped data (users see only their quotes)
- Permission-based feature access

#### Notifications
- Email integration (Resend)
- Send quote via email with link
- Status change notifications
- Quote expiration reminders
- Scheduled email reminders

#### Analytics & Tracking
- View tracking for shared quotes (anonymized)
- Quote status history log
- Customer communication timeline
- Sales pipeline (quotes by stage)
- Revenue by customer, product, date range
- Export reports

#### Advanced Features
- Quote templates (save and reuse)
- Bulk operations (create multiple quotes)
- Recurring quotes (auto-create monthly)
- API for integrations
- Zapier integration
- CRM integrations (HubSpot, Salesforce)

#### UX Improvements
- Advanced search and filters
- Custom fields for quotes/customers
- Quote comparison
- A/B testing for quote versions
- Mobile app (iOS/Android)

### Phase 2 Architecture Changes

**Authentication Middleware:**
- User middleware checks auth on all protected routes
- Prisma User model added
- Data filtering by userId

**Notification System:**
- Background job queue (Bull/Bullmq)
- Webhook triggers
- Email templates with Resend

**Analytics:**
- Event logging to separate table
- Dashboard with charts
- Export capability

## Technical Specifications

### Technology Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Database:** PostgreSQL 15 (Neon serverless)
- **ORM:** Prisma 7
- **UI Framework:** React 19 with Tailwind CSS 4
- **Component Library:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **PDF Generation:** @react-pdf/renderer
- **Excel Generation:** ExcelJS
- **File Storage:** Vercel Blob
- **Deployment:** Vercel
- **Testing:** Vitest
- **Linting:** ESLint 9

### Database Schema
See [System Architecture](./system-architecture.md) for ER diagram and detailed schema.

### API Design
RESTful endpoints for data export and import:

```
GET  /api/export/pdf/[quoteId]      → PDF file
GET  /api/export/excel/[quoteId]    → Excel file
POST /api/import/parse              → Validate Excel
POST /api/import/execute            → Execute import
```

## Success Metrics

### Phase 1 Success Criteria
- ✓ All core features functional and tested
- ✓ No critical bugs in production
- ✓ < 2 second quote creation time
- ✓ < 100ms API response time (p95)
- ✓ Mobile responsive on all pages
- ✓ PDF/Excel exports accurate

### Phase 2 Success Criteria (Target)
- 50+ active users
- 1000+ quotes created
- 90%+ user satisfaction (NPS)
- < 5% quote export failure rate
- Email delivery rate > 98%

## Timeline & Roadmap

### Phase 1 (COMPLETED)
- Design & Architecture: 1 week
- Core Development: 3 weeks
- Testing & Polish: 1 week
- Deployment: 3 days
- **Total:** ~1 month (Jan 27 - Feb 28, 2026)

### Phase 2 (ESTIMATED)
- Planning & Requirements: 1 week
- Authentication & Migrations: 2 weeks
- Notification System: 1 week
- Analytics Implementation: 1 week
- Testing & Refinement: 1 week
- Deployment: 3 days
- **Total:** ~2 months (March - April 2026)

## Stakeholders

- **Product Owner:** Decision maker on features and requirements
- **Dev Team:** Implementation and technical decisions
- **Users:** Feedback on usability and requirements
- **Support:** Customer feedback and bug reporting

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Database scale (10k+ quotes) | Low | Medium | Database optimization, archival strategy |
| PDF generation failures | Low | Medium | Error tracking, fallback to download |
| Storage cost (logos) | Low | Low | Implement image compression |
| Neon connectivity issues | Very Low | High | Connection retry logic, error handling |
| User data loss | Very Low | Critical | Automated backups, transaction support |

## Budget & Resources

### Development Costs (Phase 1)
- Estimated: 4 weeks x 1 developer
- Infrastructure: ~$50/month (Neon DB + Vercel)

### Phase 2 Estimated
- 5 weeks x 1-2 developers
- Infrastructure: ~$100-150/month (email service, analytics)

## Dependencies

### External Services
- **Vercel** - Hosting and deployment
- **Neon** - PostgreSQL database
- **Vercel Blob** - Logo storage
- **Better Auth** - Authentication (Phase 2)
- **Resend** - Email service (Phase 2)

### Development Dependencies
- Node.js 18+
- pnpm package manager
- TypeScript 5+

## Acceptance Criteria (Definition of Done)

### For Each Feature
1. Code review passed
2. Unit tests written and passing
3. Manual testing on desktop & mobile
4. Error handling implemented
5. Documentation updated
6. No console errors or warnings
7. Performance benchmarks met
8. Accessibility checklist completed

### For Phase Release
1. All features complete and tested
2. Security audit passed
3. Load testing completed
4. Deployment runbook created
5. User documentation written
6. Training materials prepared (Phase 2)
7. Backup and recovery tested
8. Monitoring and alerting configured

## Compliance & Legal

- **Data Privacy:** GDPR-ready (no personal data collection beyond customer contact)
- **Terms of Service:** Required for Phase 2 multi-user
- **License:** Proprietary (not open source)
- **Accessibility:** WCAG 2.1 Level AA compliance

## Change Log

| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| Jan 27 - Feb 28 | Phase 1 | Complete | MVP released with core features |
| Mar 1 - Mar 3 | Phase 1 | Polish | FPT data integration, bug fixes |
| Mar 3 onwards | Phase 2 | Planning | Auth system design, roadmap refinement |

## Next Steps

1. **Immediate (This Week):**
   - Complete Phase 1 documentation
   - Gather Phase 2 requirements
   - Plan authentication architecture

2. **Short Term (2-4 Weeks):**
   - Begin Phase 2 planning
   - Design Better Auth integration
   - Create Phase 2 technical specs

3. **Medium Term (1-2 Months):**
   - Implement authentication
   - Add email notifications
   - Launch Phase 2 beta

## Document Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | - | - | Pending |
| Tech Lead | - | - | Pending |
| QA Lead | - | - | Pending |

## References

- [README.md](../README.md) - Quick start guide
- [System Architecture](./system-architecture.md) - Technical design
- [Code Standards](./code-standards.md) - Development guidelines
- [Codebase Summary](./codebase-summary.md) - Code organization
- [Development Roadmap](./development-roadmap.md) - Phase tracking
