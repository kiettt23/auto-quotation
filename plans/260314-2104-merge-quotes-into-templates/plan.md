---
title: "Merge Quotes into Unified Templates + Documents"
description: "Eliminate separate quotes workflow; quote becomes a preset template within the existing doc system"
status: pending
priority: P1
effort: 16h
branch: main
tags: [refactor, unification, preset-templates, migration]
created: 2026-03-14
---

# Merge Quotes into Unified Templates + Documents

## Summary

Collapse the separate "Quotes" (Bao gia) workflow into the existing "Templates + Documents" system. A quote becomes a preset template (`preset-bao-gia`) alongside PGH and PXK. All output documents live in "Tai lieu". Quote-specific DB tables, pages, API routes, components, and services are removed.

## Architecture Change

```
BEFORE:                              AFTER:
Bao gia  -> quotes table             Mau tai lieu (preset-bao-gia)
San pham -> products table              -> doc_templates + doc_entries
Khach hang -> customers table        Tai lieu (all docs: quotes, PGH, PXK, custom)
Mau tai lieu -> doc_templates        San pham (shared catalog)
Tai lieu -> doc_entries              Khach hang (shared catalog)
```

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 1 | Create Bao Gia preset template | pending | 3h | [phase-01](phase-01-bao-gia-preset.md) |
| 2 | Enhance doc-entry form with autocomplete | pending | 3h | [phase-02](phase-02-autocomplete-integration.md) |
| 3 | DB migration: quotes -> documents | pending | 3h | [phase-03](phase-03-data-migration.md) |
| 4 | Remove quote-specific code | pending | 3h | [phase-04](phase-04-remove-quotes-code.md) |
| 5 | Update sidebar, dashboard, settings | pending | 2h | [phase-05](phase-05-navigation-dashboard.md) |
| 6 | Share links & backward compat | pending | 2h | [phase-06](phase-06-share-links.md) |

## Key Dependencies

- Phase 2 depends on Phase 1 (preset must exist)
- Phase 4 depends on Phase 3 (data migrated before code removed)
- Phase 5 depends on Phase 4 (no dead references)
- Phase 6 can start after Phase 3

## Risk Assessment

- **Data loss during migration**: Mitigated by transaction-wrapped migration + backup SQL
- **Share links break**: Phase 6 adds redirect from old `/share/[token]` to new doc view
- **Quote-specific pricing logic**: Preserved inside preset renderer, reuses `pricing-engine.ts`
