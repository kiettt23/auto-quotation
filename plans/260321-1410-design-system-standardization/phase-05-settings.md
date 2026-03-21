# Phase 5: Settings Page → Master-Detail Tabs

## Priority: Medium
## Status: pending
## Depends on: Phase 1

## Overview
Convert Settings from horizontal Tabs to master-detail with vertical tab list (left) + content (right). Like macOS/VS Code settings.

## Files to Modify
- `src/app/(app)/settings/settings-page-client.tsx` — Rewrite: left panel = tab list, right panel = tab content

## Layout
- Left panel (flex-[1]): vertical list of setting categories, styled like list rows
- Right panel (flex-[2]): current tab content (Categories, Units, DocumentTypes editors)
- No inline edit panel pattern — content varies per tab

## Tabs
1. Danh muc (Categories) — SimpleListManager
2. Don vi (Units) — SimpleListManager
3. Loai chung tu (DocumentTypes) — DocumentTypeColumnEditor

## Todo
- [ ] Rewrite settings-page-client.tsx as master-detail vertical tabs
- [ ] Style tab list items consistent with list row pattern
- [ ] Keep existing tab content components as-is
- [ ] Type-check + visual verify
