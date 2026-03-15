## Phase 1: Create Bao Gia Preset Template

**Priority:** P1 | **Status:** pending | **Effort:** 3h

### Overview

Create a `preset-bao-gia` preset template definition that captures all current quote fields (customer info, line items with product search, pricing/discounts/VAT/shipping, notes, terms, validity). Build corresponding PDF and Excel renderers reusing existing `generate-pdf-quote.tsx` and `generate-excel-quote.ts` logic.

### Key Insights

- Current quote has: customer snapshot (6 fields), items table (name, desc, unit, qty, unitPrice, discountPercent), global discount, VAT, shipping, other fees, notes, terms, validUntil
- Preset system already supports `placeholders` (key-value fields) and `tableColumns` (repeating rows)
- Existing `render-quote-pdf.ts` and `render-quote-excel.ts` in template-engine already exist — just need to wire them to preset routing
- `PresetPlaceholder` supports `autoFill` from tenant settings (e.g. company info, VAT defaults)

### Requirements

**Functional:**
- Preset captures all current quote fields as placeholders + table columns
- PDF output matches current quote PDF layout exactly
- Excel output matches current quote Excel layout exactly
- Auto-fill company info from tenant, default VAT from tenant settings

**Non-functional:**
- No new dependencies; reuse `pricing-engine.ts`, `format-currency.ts`, `format-number-to-words.ts`

### Architecture

Preset definition follows existing pattern (PGH, PXK):
```
src/lib/preset-templates/bao-gia-quotation-preset.ts  (metadata)
src/lib/pdf-layouts/bao-gia-quotation-layout.tsx       (PDF layout)
src/lib/preset-templates/preset-renderers.ts           (register renderer)
src/lib/template-engine/index.ts                       (remove legacy builtin matchers)
```

### Related Code Files

**Create:**
- `src/lib/preset-templates/bao-gia-quotation-preset.ts` — preset definition with all quote placeholders + table columns

**Modify:**
- `src/lib/preset-templates/index.ts` — register `baoGiaQuotationPreset` in `PRESET_TEMPLATES` array
- `src/lib/preset-templates/preset-renderers.ts` — map `preset-bao-gia` to existing `renderQuotePdf` / `renderQuoteExcel`
- `src/lib/template-engine/index.ts` — remove `BUILTIN_QUOTE_PDF_NAMES` / `BUILTIN_QUOTE_EXCEL_NAMES` legacy matchers (preset routing handles it)
- `src/lib/pdf-layouts/bao-gia-quotation-layout.tsx` — extract/adapt layout from `src/lib/generate-pdf-quote.tsx`

**Keep (reuse as-is):**
- `src/lib/template-engine/render-quote-pdf.ts`
- `src/lib/template-engine/render-quote-excel.ts`
- `src/lib/pricing-engine.ts`
- `src/lib/format-currency.ts`
- `src/lib/format-number-to-words.ts`

### Implementation Steps

1. Create `bao-gia-quotation-preset.ts`:
   - `id: "preset-bao-gia"`
   - `namePatterns: ["bao gia", "báo giá", "quotation"]`
   - `fileType: "pdf"` (primary; Excel handled via renderer dispatch)
   - `docPrefix: "BG-{YYYY}-"`
   - Placeholders: customerName, customerCompany, customerPhone, customerEmail, customerAddress, validUntil, globalDiscountPercent, vatPercent, shippingFee, otherFees, otherFeesLabel, notes, terms + autoFill for company fields
   - Table columns: name, description, unit, quantity, unitPrice, discountPercent (mirrors quoteItems)

2. Register in `index.ts` — add to `PRESET_TEMPLATES` array

3. Update `preset-renderers.ts`:
   - Import `renderQuotePdf` and `renderQuoteExcel`
   - Map `preset-bao-gia` to appropriate renderer
   - Renderer must parse pricing fields from `fieldData` and compute totals via `pricing-engine`

4. Remove legacy builtin matchers from `template-engine/index.ts`:
   - Delete `BUILTIN_QUOTE_PDF_NAMES`, `BUILTIN_QUOTE_EXCEL_NAMES`, `matchesBuiltin` function
   - Preset routing (step 1 in `renderDocument`) now handles it

5. Create `bao-gia-quotation-layout.tsx` if current `render-quote-pdf.ts` doesn't already have a reusable layout component; otherwise just ensure the renderer works with fieldData/tableRows format

### Todo List

- [ ] Create preset definition file
- [ ] Register preset in index
- [ ] Wire renderer in preset-renderers
- [ ] Remove legacy builtin quote matchers from template engine
- [ ] Verify PDF render with sample data
- [ ] Verify Excel render with sample data

### Success Criteria

- `getPresetById("preset-bao-gia")` returns valid preset
- `renderDocument()` with a template named "Bao gia" routes through preset, not legacy matchers
- PDF and Excel output identical to current quote export
