---
title: "Multi-Company Refactor"
description: "Refactor from tenant-based (1 user = 1 company) to user-based (1 user = N companies) with company as CRUD entity"
status: completed
priority: P1
effort: 8h
branch: staging
tags: [refactor, schema, auth, company]
created: 2026-03-19
completed: 2026-03-19
---

# Multi-Company Refactor

## Summary

Change data isolation from `companyId` to `userId`. Company becomes a CRUD entity (like Products/Customers) selected via dropdown on document form. Removes tenant middleware entirely.

## Current State

- `requireCompanyId()` fetches single company by `ownerId` (1:1)
- All services filter by `companyId`: customer, product, category, unit, document, document-type
- `CompanyProvider` context passes single `companyId` to client
- App layout redirects to `/onboarding` if no company
- Settings page manages company info + doc types + categories + units

## Target State

- Company = CRUD page at `/companies` (1 user → N companies)
- All data (products, customers, categories, units, doc types) owned by `userId`, NOT `companyId`
- Documents keep `companyId` FK (which company issued it)
- Document form has company dropdown first field, auto-fills PDF header
- Company table gains `driverName`, `vehicleId` fields
- Customer table gains `deliveryName` field
- Settings loses company info section, keeps doc types + categories + units
- `requireCompanyId()` deleted, replaced by `requireUserId()` (= `requireSession().user.id`)

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [DB Migration](phase-01-db-migration.md) | completed | 2h |
| 2 | [Auth Middleware Refactor](phase-02-auth-middleware-refactor.md) | completed | 1.5h |
| 3 | [Company CRUD Page](phase-03-company-crud-page.md) | completed | 2h |
| 4 | [Document Form Company Dropdown](phase-04-document-form-company-dropdown.md) | completed | 1.5h |
| 5 | [Settings Cleanup](phase-05-settings-cleanup.md) | completed | 1h |

## Progress

**Overall Status: 100% Complete**

All phases completed successfully with no regressions. Multi-company architecture fully implemented and verified on staging DB.

## Dependencies

- Phase 1 (DB) must complete first
- Phase 2 (Auth) depends on Phase 1
- Phases 3, 4, 5 depend on Phase 2
- Phases 3, 4, 5 can run in parallel

## Risk

- Data migration for existing rows: must update `userId` columns from company.ownerId
- Document number uniqueness: constraint changes from `(companyId, documentNumber)` — keep as-is since documents still have companyId
- Onboarding flow: user no longer needs a company to enter app — adjust redirect logic
