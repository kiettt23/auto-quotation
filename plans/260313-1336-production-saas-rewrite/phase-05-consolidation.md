---
title: "Phase 5: Consolidation (Layer 2)"
status: pending
priority: P2
effort: 0.5w
---

# Phase 5: Consolidation (Layer 2)

## Context Links

- [plan.md](./plan.md) | All previous phases

## Overview

Review ALL code from Phases 1-4. Fix integration gaps, remove duplication, ensure naming consistency, run full test suite. This is the quality gate before final audit.

**Depends on:** Phases 1-4 all complete.

## Key Insights

- Multiple agents wrote code independently — expect inconsistencies in: error messages, import paths, type definitions, naming conventions
- Look for: duplicated utility functions, inconsistent Result type usage, missing tenant checks, unused imports
- This phase does NOT add features — only refactors, fixes, and cleans

## Requirements

- All imports resolve correctly
- No duplicate utility functions
- Consistent error message format (Vietnamese)
- All server actions use Result<T> pattern
- All Drizzle queries include tenant filter
- No files > 200 lines
- All tests pass
- `pnpm build` succeeds with 0 type errors
- `pnpm lint` passes

## Implementation Steps

### Step 1: Full codebase audit
- Read every file in `src/db/schema/` — verify relations, indexes, types
- Read every file in `src/services/` — verify tenant scoping, error handling
- Read every file in `src/app/(dashboard)/*/actions.ts` — verify getTenantContext + Result pattern
- Read every component — verify no Prisma imports, no old Vietnamese routes

### Step 2: Fix integration issues
- Verify Phase 2 services correctly import Phase 1 schema
- Verify Phase 3 template engine correctly calls Phase 2 quote/product services
- Verify Phase 4 RBAC is applied to all write actions
- Test cross-module flows: create product -> create quote with product -> export PDF

### Step 3: Remove duplication
- Search for duplicate type definitions
- Search for duplicate validation logic
- Consolidate any shared helper functions
- Ensure single source of truth for constants

### Step 4: Naming consistency
- All DB columns: snake_case
- All TypeScript variables: camelCase
- All file names: kebab-case
- All route segments: English lowercase
- All UI strings: Vietnamese
- All error messages: Vietnamese

### Step 5: Run full test suite
```bash
pnpm lint
pnpm test
pnpm build
```
Fix all failures.

### Step 6: File size check
Find files > 200 lines, split as needed.

## TODO Checklist

- [ ] Audit schema files
- [ ] Audit service files
- [ ] Audit action files
- [ ] Audit components
- [ ] Fix integration gaps
- [ ] Remove duplication
- [ ] Verify naming consistency
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Lint passes
- [ ] No file > 200 lines

## Success Criteria

- `pnpm build` — 0 errors
- `pnpm lint` — 0 errors
- `pnpm test` — all pass
- Manual: register -> onboard -> create product -> create quote -> export PDF -> share link -> view share page

## Agent Instructions

**File ownership:** ALL files (read + modify). This is the only phase with full codebase write access.
**Focus:** Quality, not features. If you find a missing feature, document it but don't implement it.
**Method:** Systematic file-by-file review. Use Grep to find patterns (`JSON.parse`, `prisma`, old route names).
