## Phase 5: Update Sidebar, Dashboard, Settings

**Priority:** P2 | **Status:** pending | **Effort:** 2h

### Overview

Update navigation to remove "Bao gia" sidebar item, promote "Mau tai lieu" and "Tai lieu" to primary nav, and rebuild dashboard stats to query documents instead of quotes.

### Related Code Files

**Modify:**
- `src/components/layout/nav-items.ts` — remove Bao gia entry; reorder: Tong quan, Mau tai lieu, Tai lieu, San pham, Khach hang, Cai dat; set Mau tai lieu and Tai lieu `showInBottomNav: true`
- `src/components/layout/mobile-bottom-nav.tsx` — verify it respects `showInBottomNav` (should work automatically)
- `src/services/dashboard-service.ts` — rewrite `getDashboardStats` and `getRecentQuotes` to query `doc_entries` + `doc_templates` instead of `quotes`
- `src/components/dashboard/dashboard-stats-cards.tsx` — rename "Bao gia" stats to "Tai lieu" stats; adjust labels
- `src/components/dashboard/recent-quotes-section.tsx` — already deleted in Phase 4; create replacement `src/components/dashboard/recent-documents-section.tsx`
- `src/components/dashboard/stat-card.tsx` — no changes needed (generic)
- `src/app/(dashboard)/dashboard/page.tsx` — import new recent-documents-section
- `src/components/settings/settings-page-client.tsx` — remove Quote Template tab; keep Company Info, Defaults (general), Categories/Units
- `src/components/settings/defaults-form.tsx` — remove quote-specific fields (quotePrefix, quoteNextNumber, defaultValidityDays, defaultShipping) or keep only VAT default as general setting

**Create:**
- `src/components/dashboard/recent-documents-section.tsx` — table of 5 most recent doc_entries across all templates, showing docNumber, template name, createdAt

### Implementation Steps

1. Update `nav-items.ts`:
   - Remove `{ label: "Bao gia", icon: FileText, href: "/quotes", showInBottomNav: true }`
   - Move Mau tai lieu to position 2 with `showInBottomNav: true`
   - Move Tai lieu to position 3 with `showInBottomNav: true`

2. Rewrite dashboard service:
   - `getDashboardStats`: count total documents, group by template name, count customers, count products
   - `getRecentDocuments`: join doc_entries with doc_templates, return last 5 with template name

3. Create `recent-documents-section.tsx`:
   - Reuse table layout from deleted recent-quotes-section
   - Columns: Doc Number, Template, Created, link to `/documents/{id}`

4. Update dashboard page to use new component

5. Simplify settings:
   - Remove Quote Template form
   - Keep `defaultVatPercent` in defaults form (useful for any doc type)
   - Remove `quotePrefix`, `quoteNextNumber`, `defaultValidityDays`, `defaultShipping` from defaults form

### Todo List

- [ ] Update nav-items.ts
- [ ] Rewrite dashboard-service.ts
- [ ] Create recent-documents-section.tsx
- [ ] Update dashboard page
- [ ] Simplify settings page
- [ ] Simplify defaults form
- [ ] Verify mobile bottom nav
- [ ] Smoke test all pages

### Success Criteria

- Sidebar shows: Tong quan | Mau tai lieu | Tai lieu | San pham | Khach hang | Cai dat
- No "Bao gia" anywhere in navigation
- Dashboard shows document-based stats
- Settings has no quote-specific configuration
