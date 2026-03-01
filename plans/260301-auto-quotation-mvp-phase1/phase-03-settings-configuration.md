# Phase 03: Settings & Configuration

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Settings](../reports/wireframes-auto-quotation.md#10-cai-dat)
- [Design System - Form Patterns](../reports/design-system-auto-quotation.md#7-form-patterns)

## Overview

- **Priority:** P1 - Needed before quote generation (company info, template config, defaults)
- **Status:** Pending
- **Effort:** 4h
- **Description:** Settings page with 4 tabs for company info, quote template config, defaults, and category/unit CRUD management.

## Key Insights

- Settings is a singleton row - always upsert, never insert multiple rows
- Logo upload uses Vercel Blob (@vercel/blob) for persistent storage across deploys
<!-- Updated: Validation Session 1 - Changed from public/uploads/ to Vercel Blob -->
- Categories and units are managed inline (no separate pages) - add/edit/delete in place
- Default terms text is multiline - use textarea
- Quote template preview is deferred to Phase 09 (PDF preview component)
- Categories/units with linked products/quote items cannot be deleted (show warning)

## Requirements

### Functional
- **Tab 1 - Cong ty:** Company name, address, phone, email, tax code, website, logo upload, bank info (bank name, account number, account holder)
- **Tab 2 - Mau bao gia:** Primary color picker, greeting text, default terms textarea, display toggles (amount in words, bank info, signature blocks, footer note)
- **Tab 3 - Mac dinh:** Quote prefix, starting number, default VAT %, default validity days, default shipping fee
- **Tab 4 - Danh muc & DVT:** Category list with add/edit/delete; Unit list with add/edit/delete
- Toast notification on successful save
- Confirm dialog before deleting categories/units

### Non-Functional
- Form validation with zod
- Server Actions for all mutations (no API routes)
- Optimistic UI for category/unit inline operations

## Architecture

### Component Tree

```
src/app/(dashboard)/cai-dat/page.tsx (Server Component)
├── Fetches Settings, Categories, Units from DB
└── SettingsPageClient (Client Component)
    ├── Tabs
    │   ├── Tab "Cong ty" -> CompanyInfoForm
    │   ├── Tab "Mau bao gia" -> QuoteTemplateForm
    │   ├── Tab "Mac dinh" -> DefaultsForm
    │   └── Tab "Danh muc & DVT" -> CategoriesUnitsManager
    │       ├── CategoryList (inline CRUD)
    │       └── UnitList (inline CRUD)
    └── Toast notifications
```

### Server Actions

```
src/app/(dashboard)/cai-dat/actions.ts
├── updateCompanyInfo(formData)     # Upsert Settings fields
├── updateQuoteTemplate(formData)   # Upsert template fields
├── updateDefaults(formData)        # Upsert default fields
├── uploadLogo(formData)            # Save file, update logoUrl
├── createCategory(name)            # Insert Category
├── updateCategory(id, name)        # Update Category
├── deleteCategory(id)              # Delete if no linked products
├── createUnit(name)                # Insert Unit
├── updateUnit(id, name)            # Update Unit
└── deleteUnit(id)                  # Delete if no linked products
```

## Related Code Files

### Files to Create

```
src/
├── app/(dashboard)/cai-dat/
│   ├── page.tsx                         # Server component: fetch data + render client
│   └── actions.ts                       # Server Actions for all settings mutations
├── components/settings/
│   ├── settings-page-client.tsx         # Tabs container (client component)
│   ├── company-info-form.tsx            # Company info + bank info form
│   ├── quote-template-form.tsx          # Template config form
│   ├── defaults-form.tsx                # Quote defaults form
│   ├── categories-units-manager.tsx     # Categories + Units inline CRUD
│   ├── category-list.tsx                # Category list with inline edit/delete
│   └── unit-list.tsx                    # Unit list with inline edit/delete
└── lib/
    └── validations/
        └── settings-schemas.ts          # Zod schemas for settings forms
```

## Implementation Steps

1. **Define zod schemas** (`src/lib/validations/settings-schemas.ts`)
   - `companyInfoSchema`: name (required), address (required), phone (required), email (optional), taxCode (optional), website (optional), bankName, bankAccount, bankOwner
   - `quoteTemplateSchema`: primaryColor, greetingText, defaultTerms, showAmountInWords, showBankInfo, showSignatureBlocks, showFooterNote
   - `defaultsSchema`: quotePrefix (required), quoteNextNumber (min 1), defaultVatPercent (0-100), defaultValidityDays (min 1), defaultShipping (min 0)
   - `categorySchema`: name (min 1 char, required)
   - `unitSchema`: name (min 1 char, required)

2. **Create Server Actions** (`src/app/(dashboard)/cai-dat/actions.ts`)
   - All actions use `"use server"` directive
   - Use `revalidatePath("/cai-dat")` after mutations
   - `updateCompanyInfo`: parse with zod, upsert Settings row (use fixed id or "default" key)
   - `uploadLogo`: validate file type (PNG/JPG) and size (max 2MB), save to `public/uploads/logo-{timestamp}.{ext}`, update Settings.logoUrl
   - `deleteCategory`: check if any Product references this category before deleting, return error message if linked
   - `deleteUnit`: same check for products referencing this unit

3. **Build settings page** (`src/app/(dashboard)/cai-dat/page.tsx`)
   - Fetch Settings (or create default if none exists), all Categories, all Units
   - Pass data to SettingsPageClient

4. **Build SettingsPageClient** with shadcn Tabs component
   - 4 tab triggers: "Cong ty", "Mau bao gia", "Mac dinh", "Danh muc & DVT"
   - Each tab renders its form component
   - URL sync: use search params to persist active tab across refreshes

5. **Build CompanyInfoForm**
   - react-hook-form with zodResolver
   - Logo upload: file input + preview image (if logoUrl exists)
   - All text inputs for company fields
   - Bank info section with separator
   - Submit calls `updateCompanyInfo` server action
   - Show toast on success/error

6. **Build QuoteTemplateForm**
   - Color input (HTML native `<input type="color">`) for primaryColor
   - Textarea for greeting text and default terms
   - Checkboxes for display toggles
   - Submit calls `updateQuoteTemplate`

7. **Build DefaultsForm**
   - Input for quote prefix with hint: "BG-{YYYY}-"
   - Number input for starting number
   - Number inputs for VAT %, validity days, shipping fee
   - Submit calls `updateDefaults`

8. **Build CategoriesUnitsManager**
   - Two sections side by side (or stacked on mobile)
   - CategoryList: table with name column + edit/delete buttons
   - Add category: inline input with "Them" button at top
   - Edit: click name to toggle inline input mode
   - Delete: AlertDialog confirmation, check for linked products
   - Same pattern for UnitList

9. **Handle logo file storage (Vercel Blob)**
   <!-- Updated: Validation Session 1 - Changed from fs.writeFile to Vercel Blob -->
   - Use `put()` from `@vercel/blob` to upload logo
   - Returns persistent blob URL (e.g., `https://xxxxx.public.blob.vercel-storage.com/logo-xxx.png`)
   - Store blob URL in Settings.logoUrl
   - Use `del()` to remove old logo when uploading new one
   - Requires `BLOB_READ_WRITE_TOKEN` env var (auto-provisioned on Vercel)

## Todo List

- [ ] Define zod schemas for all 4 settings forms
- [ ] Create all Server Actions (settings upsert, logo upload, category/unit CRUD)
- [ ] Build settings page.tsx (server component with data fetching)
- [ ] Build SettingsPageClient with 4 tabs
- [ ] Build CompanyInfoForm with logo upload
- [ ] Build QuoteTemplateForm with color picker and toggles
- [ ] Build DefaultsForm with numeric inputs
- [ ] Build CategoriesUnitsManager with inline CRUD for categories and units
- [ ] Add delete protection (prevent deleting categories/units with linked products)
- [ ] Add toast notifications for all actions
- [ ] Test all CRUD operations

## Success Criteria

- All 4 tabs render correctly and persist active tab in URL
- Company info saves and loads correctly (including logo)
- Logo uploads and displays preview
- Default values populate correctly in forms
- Categories: add, edit, delete works (delete blocked if products linked)
- Units: add, edit, delete works (delete blocked if products linked)
- Toast shows success/error for all operations
- Form validation errors display inline

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vercel Blob token not configured | Logo upload fails | Document BLOB_READ_WRITE_TOKEN in .env.example; auto-provisioned on Vercel |
| Settings singleton race condition | Data corruption | Use Prisma upsert with fixed ID |
| Category/unit deletion cascade | Orphaned products | Check references before delete; return user-friendly error |

## Security Considerations

- File upload: validate MIME type and file size server-side (not just client)
- Sanitize file names to prevent path traversal

## Next Steps

- Phase 04: Products reference categories and units created here
- Phase 08: Quote builder reads default settings (VAT, terms, prefix)
- Phase 09: PDF template uses company info, template config, and display toggles
