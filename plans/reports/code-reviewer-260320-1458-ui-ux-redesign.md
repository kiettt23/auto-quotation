## Code Review: UI/UX Redesign (Blue to Indigo/Violet)

### Scope
- Files: ~20 UI files (layout, sidebar, dashboard, shared components, page clients)
- Focus: Type safety, runtime issues, accessibility, edge cases

### Overall Assessment
Clean, well-structured redesign. Good component extraction (PageHeader, TableToolbar, TablePagination). Consistent design system. Two issues worth fixing, rest is solid.

---

### High Priority

**1. Fragile dynamic Tailwind class via string replace**
- `document-list-client.tsx:153` and `recent-documents-table.tsx:120`
- `config?.badgeBg?.replace("100", "500")` generates classes like `bg-indigo-500` dynamically
- Tailwind purges classes not found as complete strings in source. These will be missing in production builds.
- **Fix:** Add a `dotColor` field to `documentTypeConfig` in `document-helpers.ts` with the exact class string, or add a safelist.

**2. `useMemo` used as side-effect to reset page (anti-pattern)**
- `document-list-client.tsx:73`: `useMemo(() => setPage(1), [activeTab, search])`
- `useMemo` is for computing values, not triggering side effects. React may skip or re-run memos unpredictably.
- **Fix:** Use `useEffect` instead, or reset page inline in the tab/search change handlers.

### Medium Priority

**3. Action links invisible on mobile (opacity-0 + group-hover)**
- `document-list-client.tsx:167` and `recent-documents-table.tsx:134`
- `opacity-0 group-hover:opacity-100` means touch devices cannot access "Xem/Sua/Nhan ban/Xoa" actions
- **Fix:** Always show on mobile: `opacity-100 lg:opacity-0 lg:group-hover:opacity-100`

**4. Delete action has no confirmation dialog**
- `document-list-client.tsx:171`: `onClick={() => handleDelete(doc.id)}` deletes immediately
- Accidental click = data loss (soft delete, but still disruptive)
- **Fix:** Add a confirm dialog or undo toast

**5. Logout button lacks accessible label**
- `sidebar-user-card.tsx:38`: `title="Dang xuat"` is set but no `aria-label`
- Screen readers may announce just "button" with no context
- **Fix:** Add `aria-label="Dang xuat"`

**6. `getInitials` crashes on empty string**
- `sidebar-user-card.tsx:13`: `w[0]` on empty split segment is `undefined`
- If `userName` is `""` or `"  "`, produces empty/broken output
- **Fix:** Guard: `if (!name.trim()) return "?";`

### Low Priority

**7. Duplicate tab definitions**
- `tabs` array is defined identically in `recent-documents-table.tsx` and `document-list-client.tsx`
- Could extract to `document-helpers.ts`

**8. `--font-geist-sans` / `--font-geist-mono` CSS vars referenced but unused**
- `globals.css:9-10` references Geist font vars, but layout uses DM Sans. Non-breaking but confusing.

---

### Positive Observations
- Good component decomposition: PageHeader, TableToolbar, TablePagination are reusable
- NavItem type export is clean, badge support is forward-looking
- Stats service uses parallel Promise.all for 4 queries - efficient
- Proper soft-delete filtering in all queries
- Empty state component is well done
- CSS variable system is thorough and well-documented

### Recommended Actions (Priority Order)
1. Fix dynamic Tailwind class generation (will break production)
2. Replace `useMemo` side-effect with `useEffect`
3. Make action links visible on mobile
4. Add delete confirmation
5. Guard `getInitials` against empty strings

### Metrics
- TypeScript: 2 pre-existing errors (not from this PR)
- Build: Compiles successfully
- Linting: Not run (no lint script changes)

### Unresolved Questions
- Is dark mode planned? CSS vars only define light theme. If planned, the hardcoded `text-slate-*`, `bg-white`, `bg-indigo-*` classes throughout components will need refactoring to use CSS variables.
