## Phase 6: Share Links & Backward Compatibility

**Priority:** P2 | **Status:** pending | **Effort:** 2h

### Overview

Current quotes have share tokens (`/share/[token]`) for public viewing. After migration, share tokens live in `fieldData.shareToken`. This phase adds share link support to the document system and redirects old quote share URLs.

### Key Insights

- `quotes.shareToken` migrated into `doc_entries.fieldData.shareToken` (Phase 3)
- Current share page: `src/app/share/[token]/page.tsx` queries `quotes` table by shareToken
- Current share view: `src/components/share/share-quote-view.tsx` renders full quote preview
- Need to support share for Bao Gia documents (and potentially other doc types in future)
- Option A: Add `shareToken` column to `doc_entries` table (clean, queryable)
- Option B: Query fieldData JSON (Postgres JSON operators — works but slower)
- **Decision: Option A** — proper column is cleaner, indexable, and future-proof

### Related Code Files

**Modify (schema):**
- `src/db/schema/documents.ts` — add `shareToken text unique`, `shareTokenExpiresAt timestamp` columns to `doc_entries` table

**Create (migration script):**
- `src/db/migrations/add-share-token-to-documents.ts` — SQL ALTER TABLE to add columns + backfill from fieldData JSON for migrated quotes

**Modify (service):**
- `src/services/document-service.ts` — add `getDocumentByShareToken(token)`, `generateDocShareLink(tenantId, docId)`, `revokeDocShareLink(tenantId, docId)`

**Modify (share page):**
- `src/app/share/[token]/page.tsx` — rewrite to query `doc_entries` by shareToken; render based on template type (Bao Gia uses quote preview, others use generic doc view)

**Modify (share view):**
- `src/components/share/share-quote-view.tsx` — rename to `share-document-view.tsx`; adapt to accept `DocumentWithTemplate` + tenant; route to appropriate preview based on preset

**Modify (doc-entry components):**
- `src/components/doc-entry/doc-entry-form-page.tsx` — add "Share" button (for Bao Gia docs or any doc) that calls generateDocShareLink

**Modify (doc-entry list):**
- `src/components/doc-entry/doc-entry-list-client.tsx` — add share link column/action to document table rows

### Implementation Steps

1. Add columns to `doc_entries` schema:
   ```ts
   shareToken: text("share_token").unique(),
   shareTokenExpiresAt: timestamp("share_token_expires_at"),
   ```
   Add index on shareToken.

2. Create migration script to:
   - ALTER TABLE add columns
   - Backfill: `UPDATE doc_entries SET share_token = field_data->>'shareToken' WHERE field_data->>'shareToken' IS NOT NULL`
   - Clean up: remove shareToken/shareTokenExpiresAt from fieldData JSON

3. Add service functions:
   - `getDocumentByShareToken(token)` — find doc + template + tenant by share token, check expiry
   - `generateDocShareLink(tenantId, docId)` — generate UUID token, set 30-day expiry
   - `revokeDocShareLink(tenantId, docId)` — null out token

4. Rewrite share page:
   - Query `getDocumentByShareToken(token)`
   - If Bao Gia preset: render quote-style preview (reuse existing PDF preview logic)
   - If other template: render generic doc preview (fieldData + tableRows display)
   - Handle expired/invalid tokens with 404

5. Add share actions to doc-entry UI:
   - Share button in doc form page header
   - Copy link action in doc list table

6. Run `pnpm db:push` to apply schema changes

### Todo List

- [ ] Add shareToken columns to documents schema
- [ ] Create backfill migration script
- [ ] Add service functions for share CRUD
- [ ] Rewrite share/[token] page
- [ ] Rename and adapt share view component
- [ ] Add share button to doc-entry form
- [ ] Add share action to doc list
- [ ] Test share flow end-to-end
- [ ] Test backward compat with migrated share tokens

### Success Criteria

- Old share URLs (`/share/[token]`) still work for migrated quotes
- New Bao Gia documents can generate share links
- Expired tokens show appropriate message
- Share page renders correct preview based on template type

### Risk Assessment

- **Old bookmarked URLs**: Token-based lookup is URL-stable — no path change needed
- **Non-Bao Gia share**: Generic preview sufficient for now; can enhance per-preset later
