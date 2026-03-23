# Docs Refresh — customData autofill & KeyValueEditor combobox

**Date:** 2026-03-23

## Changes Made

### `docs/project-changelog.md`
- Added new `[Unreleased] — 2026-03-23` section documenting:
  - `mapCustomDataToColumnKeys()` utility
  - `BUILTIN_KEYS` set in template-registry
  - `getAllCustomColumnKeys()` function
  - KeyValueEditor key input → shadcn Popover combobox
  - New `docs/template-creation-guide.md`

### `docs/codebase-summary.md`
- Updated `document-helpers.ts` comment to include `mapCustomDataToColumnKeys`
- Updated customData JSONB pattern to describe key-mapping behavior and combobox source
- Added `BUILTIN_KEYS` and `getAllCustomColumnKeys()` exports to template-registry section

## Unresolved Questions
- None
