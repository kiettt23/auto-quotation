# Template Creation Guide

How to add a new PDF template to the auto-quotation system. Follow this pattern exactly to ensure autofill, combobox, and PDF rendering all work correctly.

## Quick Checklist

1. Create template component
2. Register in template-registry.ts
3. Verify product combobox picks up new columns
4. Test autofill end-to-end
5. Test PDF render

## Step 1: Analyze Reference

Identify from the reference PDF/image:
- Header layout (logo position, company info)
- Info grid (customer, date, document number, extra fields)
- Table columns (what data each column shows)
- Signature blocks (how many, labels)
- Fonts, borders, colors

## Step 2: Create Template Component

Create `src/lib/pdf/templates/{name}-template.tsx` using `@react-pdf/renderer`.

The template receives `PdfTemplateProps`:
```ts
interface PdfTemplateProps {
  title: string;
  documentNumber: string;
  date: string;
  company: { name, address?, phone?, taxCode?, logoUrl?, headerLayout? };
  data: DocumentData;       // items[], templateFields?, columns?, notes?, etc.
  columns: ColumnDef[];     // from registry
  showTotal: boolean;       // from registry
  signatureLabels: string[];// from registry
}
```

```tsx
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { PdfTemplateProps } from "../template-props";

export function MyTemplate(props: PdfTemplateProps) {
  // Pixel-perfect: hardcode layout, read data from props.data
  // Dynamic: use props.columns, props.signatureLabels
}
```

**Reference implementations:**
- Pixel-perfect: `jesang-delivery-template.tsx`
- Dynamic: `default-template.tsx`

## Step 3: Register Template

Add entry in `src/lib/pdf/template-registry.ts`:

```ts
{
  id: "my-template",
  name: "Tên Template",
  description: "Mô tả ngắn",
  shortLabel: "MT",  // MUST be unique! Used for doc numbers: MT-2026-001
  columns: [
    { key: "stt", label: "STT", type: "number", width: "5%", align: "center", system: true },
    { key: "productName", label: "Tên hàng", type: "text", width: "22%", system: true },
    // Custom columns — use camelCase keys, Vietnamese labels:
    { key: "lotNo", label: "Số Lô", type: "text", width: "12%" },
    { key: "boxQty", label: "Số thùng/kiện", type: "number", width: "12%", align: "center" },
  ],
  showTotal: false,   // true → renders totals row in table (form + PDF)
  signatureLabels: ["Người giao", "Người nhận"],
  color: { badgeBg: "bg-blue-100", badgeText: "text-blue-700", dotColor: "bg-blue-500" },
  extraFormFields: [
    { key: "deliveryName", label: "Nơi giao", placeholder: "..." },
  ],
  get component() {
    return require("./templates/my-template").MyTemplate;
  },
},
```

### Column Key Rules

| Category | Keys | Notes |
|----------|------|-------|
| System | `stt`, `productName` | Set `system: true`. Auto-handled, excluded from everything |
| Builtin | `specification`, `unit`, `quantity`, `unitPrice`, `amount`, `note` | Auto-handled by core autofill. Excluded from product combobox |
| Custom | Any camelCase key | Appears in product combobox dropdown. Stored in `item.customFields` |

**IMPORTANT:** Custom column keys must be **camelCase** (e.g., `lotNo`, `boxQty`, `netWeight`). Labels must be **Vietnamese** (e.g., "Số Lô", "Số thùng/kiện"). The label-to-key mapping depends on this.

## Step 4: Autofill Flow

```
Product.customData: { "Số Lô": "LOT-001" }
                          ↓ mapCustomDataToColumnKeys()
                    matches column { key: "lotNo", label: "Số Lô" }
                          ↓
                    item.customFields.lotNo = "LOT-001"
                          ↓
                    Renders in "Số Lô" column ✓
```

### Where autofill happens:
- **New document**: `src/components/documents/document-items-table.tsx` → `handleProductSelect()`
- **Edit document**: `src/app/(app)/documents/document-detail-edit-panel.tsx` → `handleProductSelect()`
- **Mapping function**: `src/lib/utils/document-helpers.ts` → `mapCustomDataToColumnKeys()`

### Product combobox:
- `src/components/shared/key-value-editor.tsx` with `keyOptions` prop
- Options come from `getAllCustomColumnKeys()` in template-registry.ts
- New custom columns auto-appear — no manual UI changes needed
- Builtin keys (specification, unit, quantity, etc.) are excluded via `BUILTIN_KEYS` set

## Step 5: Extra Form Fields

For template-specific metadata (not per-item):

```ts
extraFormFields: [
  { key: "deliveryName", label: "Nơi giao", placeholder: "..." },
  { key: "vehicleId", label: "Số xe", placeholder: "50E-12345" },
],
```

These render automatically in the document form. Values stored in `data.templateFields`.

Autofill sources:
- Customer.customData → `data.templateFields`
- Company.customData → `data.templateFields`
- Customer core fields (deliveryName, deliveryAddress) → `data.templateFields`
- Company core fields (driverName, vehicleId) → `data.templateFields`

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/pdf/template-registry.ts` | Central registry, `getAllCustomColumnKeys()`, `BUILTIN_KEYS` |
| `src/lib/pdf/template-props.ts` | `PdfTemplateProps` interface |
| `src/lib/types/document-data.ts` | `DocumentData` interface |
| `src/lib/types/column-def.ts` | `ColumnDef` type |
| `src/lib/utils/document-helpers.ts` | `mapCustomDataToColumnKeys()` |
| `src/components/shared/key-value-editor.tsx` | KeyValueEditor with combobox |
| `src/components/documents/document-items-table.tsx` | Item table + product autofill |
| `src/components/documents/document-form.tsx` | New document form |
| `src/app/(app)/documents/document-detail-edit-panel.tsx` | Edit document panel |

## Document Numbering

Format: `{shortLabel}-{year}-{sequence}` (e.g., `BG-2026-001`), scoped per company.

- `shortLabel` comes from the registry entry — **must be unique** across all templates
- Sequence auto-increments per company + shortLabel + year
- Logic: `src/services/document.service.ts` → `generateDocumentNumber()`
- Existing shortLabels: `BG` (Báo giá), `PGH` (Phiếu giao hàng)

## showTotal Behavior

- `showTotal: true` → form shows "Thành tiền" column + totals row. PDF renders sum. Template component can rely on `props.showTotal`
- `showTotal: false` → no amount column, no totals. Use for delivery orders, inventory sheets, etc.
- Pixel-perfect templates may ignore this flag and hardcode their own layout

## Legacy Notes

- `legacyTypeToTemplateId()` / `templateIdToLegacyType()` exist for backward compat with old `type` enum column
- **New templates do NOT need entries** in these mapping functions — they only cover pre-existing `QUOTATION`/`DELIVERY_ORDER` enum values
- `color` field uses **full Tailwind class strings** (e.g., `"bg-blue-100"`). Do NOT use computed classes — Tailwind JIT won't generate them

## Verification Steps

1. **Combobox**: Open a product → click "Thêm field" → your new custom column labels should appear in dropdown
2. **Autofill**: Create product with customData → create document with new template → select that product → custom columns should fill
3. **PDF render**: Fill all fields → click preview/download → verify layout matches reference

## Common Mistakes

1. **Wrong key format**: Using `"Số Lô"` as column key instead of `lotNo` → autofill won't map
2. **Forgetting `system: true`**: On stt/productName → they show in product combobox
3. **Flat templateFields**: Storing extra fields at top-level of `data` instead of `data.templateFields`
4. **Not testing autofill**: Create product with customData → create document → select product → verify columns fill
5. **Duplicate shortLabel**: Picking a shortLabel already used by another template → doc numbers collide
6. **Adding legacy mapping**: New templates don't need `legacyTypeToTemplateId` entries
7. **Computed Tailwind classes**: `"bg-" + color` won't work — use full static class strings
