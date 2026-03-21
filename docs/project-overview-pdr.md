# Project Overview & PDR (Product Development Requirements)

## Executive Summary

**autoquotation** is a web application designed to streamline business document management. Users can create, manage, and export professional quotations, warehouse export documents, and delivery orders as PDF files. The system supports multi-company management, allowing a single user to handle multiple business entities with separate customer and product lists.

**Current Version:** Post-refactor (March 2026)
**Status:** Active Development / Production-Ready
**Architecture:** Multi-company user-based isolation

## Problem Statement

### User Pain Points
- Traditional quotation creation is manual and time-consuming
- Companies struggle to manage multiple business entities with separate records
- PDF document generation requires external tools or manual formatting
- No centralized system for document numbering and historical tracking
- Customer and product information not reusable across related companies

### Market Opportunity
Small to medium enterprises (SMEs) in Vietnam and Southeast Asia need lightweight document management without heavy ERP systems.

## Product Vision

Enable SMEs to:
1. Manage multiple companies from one account
2. Quickly generate professional PDF documents with company branding
3. Maintain separate customer and product databases per user
4. Track document numbers sequentially per company
5. Customize document types and their numbering patterns

## Core Features

### 1. Multi-Company Management
- **What:** Users can create and manage multiple companies from a single account
- **Why:** Enables agency model and multi-entity businesses
- **How:** `/companies` CRUD page with full create/edit/delete/list operations
- **Data Model:** Company → User (1:N relationship)

### 2. Document Management
- **What:** Create, list, view, edit, and export documents as PDF
- **Supported Types:** Quotations, Warehouse Exports (PXK), Delivery Orders (PGH)
- **Features:**
  - Company-scoped document numbering
  - Customer auto-fill from database
  - Product selection with categories
  - Custom document types with numbering patterns
  - PDF rendering with company branding

### 3. Customer Management
- **What:** Centralized database of customers for each user
- **Fields:** Name, address, contact (phone, email, tax code), delivery info
- **Scope:** User-level (accessible across all user's companies)

### 4. Product & Category Management
- **What:** Reusable products with categories and units
- **Units:** Support custom units (Cái, Tấn, Lít, etc.)
- **Scope:** User-level (accessible across all user's companies)

### 5. Document Type Customization
- **What:** Define custom document types with naming patterns
- **Pattern Format:** e.g., "QUOTATION-{shortLabel}-{number}" → "QUOTATION-C-001"
- **Scope:** User-level configuration

### 6. PDF Generation
- **What:** Professional PDF export with company branding
- **Customization:**
  - Company logo (upload as base64 or URL)
  - Header layout (left-aligned or centered)
  - Company defaults (driverName, vehicleId for delivery docs)
- **Output:** Downloadable PDF with historical data

## Non-Functional Requirements

### Performance
- Document list must load within 2 seconds (< 100 docs)
- PDF generation must complete within 5 seconds
- Database queries optimized with indexes on `userId` columns

### Scalability
- Support 10,000+ users with 1M+ documents
- Company-scoped document numbering prevents contention
- Soft delete strategy preserves audit trail

### Security
- User authentication via better-auth with email/password
- Session-based access control via `requireUserId()` helper
- All data access controlled by `userId`
- No cross-user data leakage
- Soft deletes for data recovery
- SQL-level ownership checks on all queries

### Reliability
- PostgreSQL transactions ensure data consistency
- Unique constraints prevent duplicate document numbers
- Error handling with user-friendly messages

### Usability
- Responsive design for mobile/tablet/desktop
- Familiar UI patterns (cards, tables, dialogs)
- Keyboard navigation support via shadcn/ui
- Vietnamese localization support

## Current Architecture

### Tech Stack
- **Frontend:** Next.js 16.1, React 19, TypeScript, shadcn/ui 3.8.5
- **Backend:** Next.js Server Actions, Node.js runtime
- **Database:** PostgreSQL 14+ with Drizzle ORM 0.45.1
- **Auth:** better-auth 1.5.5 (email/password authentication)
- **PDF:** @react-pdf/renderer 4.3.2 with template registry
- **Storage:** @vercel/blob for file uploads
- **Styling:** Tailwind CSS 4, shadcn/ui components
- **Validation:** Zod 4 for input validation
- **Package Manager:** pnpm

### Data Model
| Entity | Scope | Purpose |
|--------|-------|---------|
| User | Global | Root entity from auth provider |
| Company | Per User | Business entity with branding |
| Customer | Per User | Contact information |
| Product | Per User | Saleable items |
| Category | Per User | Product grouping |
| Unit | Per User | Measurement units |
| Document Type | Per User | Custom document templates |
| Document | Per User + Per Company | Generated business documents |

### Access Control Model
- **User-level data:** Customers, products, categories, units, document types (filtered by `userId`)
- **Company-level data:** Documents (filtered by both `userId` and `companyId`)
- **Company operations:** Full CRUD at `/companies`

## Acceptance Criteria

### Functional Acceptance
- [x] Users can create multiple companies
- [x] Each company has separate company information
- [x] Users can manage customers (CRUD) at user level
- [x] Users can manage products (CRUD) at user level
- [x] Users can manage categories (CRUD) at user level
- [x] Users can manage units (CRUD) at user level
- [x] Users can customize document types with patterns
- [x] Users can create documents with company selection
- [x] Document forms auto-fill from company defaults
- [x] Document numbers are scoped per company
- [x] Users can view document history
- [x] PDFs render with company branding
- [x] Soft delete enabled for all entities
- [x] Settings page updated (removed company info)

### Non-Functional Acceptance
- [x] All data isolation by `userId`
- [x] Type-safe database layer (Drizzle)
- [x] No auth bypass vulnerabilities
- [x] Database indexes on `userId` columns
- [x] Unique constraints prevent duplicates
- [x] Error handling with rollback on failure

### User Experience
- [x] Navigation shows `/companies` link
- [x] Onboarding creates first company
- [x] Company management is intuitive
- [x] Document form UX is clear (company first)
- [x] No CompanyProvider complexity exposed to users

## Success Metrics

### Adoption
- Number of active users
- Average companies per user
- Monthly documents created

### Engagement
- Document creation frequency
- Document view/export rate
- User retention (30-day, 90-day)

### Quality
- Zero security incidents
- PDF generation success rate > 99.9%
- User support ticket resolution time < 24h

## Roadmap (Planned Features)

### Phase 2: Templates & Customization
- Template library for document types
- Custom CSS styling for PDFs
- Multi-language support

### Phase 3: Collaboration
- Share documents with team members
- Document approval workflow
- Signature/stamp integration

### Phase 4: Integration
- Email integration (send documents)
- Integration with accounting software
- API for third-party apps

### Phase 5: Analytics
- Document creation trends
- Customer analysis
- Revenue forecasting

## Known Limitations & Constraints

### Current Limitations
1. **No team collaboration** — Single user per account
2. **No document versioning** — Changes overwrite history (future: soft delete preserves)
3. **Limited template customization** — Fixed header layouts only
4. **No payment integration** — Manual customer payment tracking
5. **No API layer** — Direct UI only (future: REST/GraphQL API)

### Technical Constraints
1. **PDF generation speed** — @react-pdf/renderer runs client-side (may be slow for large batch exports)
2. **File storage** — Logos uploaded via @vercel/blob (embedded as URLs in documents)
3. **Template customization** — Currently 2 fixed templates (default + jesang-delivery)
4. **Database tuning** — Staging DB only (production DB needs performance review)
5. **No caching layer** — All queries hit database (consider Redis at scale)

### Deployment Constraints
1. **Staging DB only** — Must promote to production manually
2. **No CDN** — Logos and PDFs served from app server
3. **No backup automation** — Manual database backups required
4. **Single region** — No disaster recovery setup

## Risk Assessment

### High Risk
- **Data loss in production:** Mitigation: Regular automated backups
- **Auth bypass vulnerabilities:** Mitigation: Security audit, rate limiting
- **Performance degradation at scale:** Mitigation: Database optimization, caching

### Medium Risk
- **Cross-user data leakage:** Mitigation: Code review, test coverage
- **Concurrent document creation:** Mitigation: Unique constraints, transaction handling
- **PDF generation failures:** Mitigation: Error handling, retry logic

### Low Risk
- **UI/UX usability issues:** Mitigation: User testing, feedback loop
- **Browser compatibility:** Mitigation: Progressive enhancement, testing

## Dependencies & Prerequisites

### External Services
- **Auth System:** better-auth (self-hosted in app, no external provider)
- **Database:** PostgreSQL 14+ (Neon serverless recommended)
- **File Storage:** @vercel/blob (built-in, serverless)
- **Email Service:** Needed for future notifications/sharing features

### Internal Dependencies
- Drizzle ORM for database access
- shadcn/ui component library
- Next.js 14+ server components

### Development Tools
- Node.js 18+
- PostgreSQL client (psql)
- Drizzle Kit for migrations

## Next Steps

1. **Code Review & Testing** — Validate multi-company refactor on staging
2. **Production Promotion** — Promote staging database changes to production
3. **Monitoring Setup** — Configure alerts for production errors
4. **User Documentation** — Create help guides for end users
5. **Phase 2 Planning** — Define next feature priorities

## Change History

### March 21, 2026 — UI/UX Redesign (IN PROGRESS)
**Summary:** Complete visual redesign with improved layouts and components.

**Changes:**
- Redesigned header with user card and navigation
- Master-detail inline edit panels for CRUD pages (no modal dialogs)
- Added date picker, calendar, popover UI components
- Responsive layout with mobile bottom navigation
- Upgraded to Tailwind CSS 4 and modern component library
- Added page headers with breadcrumbs and actions

### March 19, 2026 — Multi-Company Refactor (COMPLETED)
**Summary:** Migrated from tenant-based (1 user = 1 company) to user-based (1 user = N companies) architecture.

**Changes:**
- Added `userId` to 6 tables (customer, product, category, unit, document_type, document)
- Removed `companyId` FK from user-level entities
- Renamed `company.ownerId` → `company.userId`
- Added `company.driverName`, `company.vehicleId`
- Created `/companies` CRUD page with full CRUD operations
- Updated document form with company dropdown
- Removed company info from settings page (now at /companies)
- Replaced `requireCompanyId()` → `requireUserId()` in all actions
- Deleted CompanyProvider context

**Impact:** Backward-incompatible database changes. Production deployment requires migration.

## Sign-Off

**Version:** 1.1 (Post-Refactor)
**Last Updated:** 2026-03-19
**Owner:** Product Team
**Status:** Approved for Production (pending final deployment)

This PDR aligns with the completed multi-company refactor and reflects the current production-ready system state.
