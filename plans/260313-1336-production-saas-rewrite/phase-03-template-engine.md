---
title: "Phase 3: Unified Template Engine"
status: pending
priority: P1
effort: 3w
---

# Phase 3: Unified Template Engine

## Context Links

- [plan.md](./plan.md) | [Phase 1](./phase-01-foundation.md) | [Phase 2](./phase-02-core-business.md)
- Current doc template: `src/app/(dashboard)/mau-chung-tu/actions.ts`
- Current PGH module: `src/components/pgh/pgh-form-page.tsx`
- Current PDF overlay: `src/lib/generate-pdf-overlay.ts`

## Overview

Build the Unified Template Engine — the core SaaS differentiator. Users can upload Excel/PDF templates, define placeholders, and generate documents. Quote PDF/Excel and PGH (delivery order) become built-in templates.

**Depends on:** Phase 1 (schema, auth) + Phase 2 (quote/product/customer services for data binding)

## Key Insights

- Current system has 3 separate document generation paths: Quote PDF (react-pdf), Doc Template Excel (ExcelJS fill), Doc Template PDF (pdf-lib overlay). Unify under one engine.
- Built-in templates are NOT user-uploadable — they're code-defined templates seeded into `document_templates` with `is_builtin: true`. Their rendering uses specialized code paths (react-pdf for quote, pdf-lib for PGH).
- Custom templates use the upload+placeholder+fill approach (existing doc template system, refined).
- PGH module currently uses localStorage and hardcoded company name. Rewrite: PGH becomes a built-in template in the engine. Data stored in `documents` table, not localStorage.
- Template config stored as JSON in `placeholders` and `table_region` columns.

## Requirements

### Functional
- **Template CRUD:** Create, edit, delete templates. Upload Excel/PDF file. Define placeholders (cell refs for Excel, positioned regions for PDF). Define table regions (repeating rows).
- **Document CRUD:** Create document from template, fill in field data + table rows, save, export as Excel/PDF.
- **Built-in templates:**
  - **Quote PDF** — renders quote data as formatted PDF (react-pdf). Seeded as built-in, not editable by user.
  - **Quote Excel** — renders quote data as Excel workbook (ExcelJS). Seeded as built-in.
  - **PGH (Delivery Order)** — renders delivery order as PDF (pdf-lib or react-pdf). Seeded as built-in. Replaces hardcoded PGH module.
- **Rendering:** Template + data -> filled document (PDF or Excel download).
- **Numbering:** Each template has its own prefix + auto-increment.

### Non-Functional
- PDF generation < 5s
- Template file upload max 10MB
- Support Excel (.xlsx) and PDF files

## Architecture

### Template Engine Design
```
┌────────────────────────────────────────┐
│          Template Registry             │
│  (document_templates table)            │
│  ┌──────────┐ ┌──────────┐            │
│  │ Built-in │ │ Custom   │            │
│  │ (code)   │ │ (upload) │            │
│  └────┬─────┘ └────┬─────┘            │
│       │             │                  │
│  ┌────▼─────────────▼────┐            │
│  │   Data Binding Layer   │            │
│  │   template + data →    │            │
│  │   filled placeholders  │            │
│  └────────────┬──────────┘            │
│  ┌────────────▼──────────┐            │
│  │   Render Adapters      │            │
│  │  ┌──────┐ ┌─────────┐ │            │
│  │  │Excel │ │PDF      │ │            │
│  │  │(fill)│ │(overlay/ │ │            │
│  │  │      │ │ react-pdf│ │            │
│  │  └──────┘ └─────────┘ │            │
│  └───────────────────────┘            │
└────────────────────────────────────────┘
```

### Built-in Template Rendering

| Template | Renderer | Input Data |
|----------|----------|-----------|
| Quote PDF | react-pdf (`generate-pdf-quote.tsx`) | Quote + items + tenant settings |
| Quote Excel | ExcelJS (`generate-excel-quote.ts`) | Quote + items + tenant settings |
| PGH | react-pdf (`pgh-delivery-order-layout.tsx`) | PGH form fields + items + tenant settings |

Built-in templates have `is_builtin: true`. Their rendering calls specialized functions. They still have records in `document_templates` for numbering/config, but their `file_base64` is empty (rendering is code-based).

### Custom Template Rendering

| File Type | Renderer | Process |
|-----------|----------|---------|
| Excel | ExcelJS | Load base64 workbook -> fill cells from `field_data` -> insert table rows -> export |
| PDF | pdf-lib | Load base64 PDF -> overlay text at placeholder coordinates from `field_data` -> export |

## New Directory/File Structure

```
src/
  lib/
    template-engine/
      index.ts                           # Main entry: renderDocument(templateId, documentId) -> Buffer
      render-excel-custom.ts             # Fill Excel template with data
      render-pdf-custom.ts               # Overlay PDF template with data
      render-quote-pdf.ts                # Built-in: generate quote PDF (wraps generate-pdf-quote.tsx)
      render-quote-excel.ts              # Built-in: generate quote Excel (wraps generate-excel-quote.ts)
      render-pgh-pdf.ts                  # Built-in: generate PGH PDF (wraps pgh layout)
      types.ts                           # TemplatePlaceholder, TableRegionConfig, RenderResult types
    pdf-layouts/
      pgh-delivery-order-layout.tsx      # Rewrite: uses shared fonts, accepts tenant data
  services/
    template-service.ts                  # Template CRUD (tenant-scoped)
    document-service.ts                  # Document CRUD + rendering (tenant-scoped)
  app/
    (dashboard)/
      templates/
        page.tsx                         # Template list
        loading.tsx
        new/page.tsx                     # Create template (upload + configure wizard)
        [id]/page.tsx                    # Edit template config
        actions.ts                       # Template server actions
      documents/
        page.tsx                         # Document list (grouped by template)
        loading.tsx
        new/page.tsx                     # Create document (pick template, fill fields)
        [id]/page.tsx                    # Edit document
        actions.ts                       # Document server actions
    api/
      doc-export/
        pdf/[documentId]/route.ts        # Export document as PDF
        excel/[documentId]/route.ts      # Export document as Excel
      doc-template/
        analyze/route.ts                 # Analyze uploaded Excel (extract cells)
        analyze-pdf/route.ts             # Analyze uploaded PDF (extract pages/dims)
  components/
    doc-template/
      doc-template-list-client.tsx       # Rewrite: template list
      doc-template-builder-page.tsx      # Rewrite: upload + configure wizard
      doc-template-upload-step.tsx       # File upload step
      doc-template-configure-step.tsx    # Placeholder config step
      doc-template-step-indicator.tsx    # Wizard step indicator
      doc-template-table-region-config.tsx # Table region editor
      doc-template-placeholder-row.tsx   # Single placeholder config row
      doc-template-pdf-region-editor.tsx # PDF region drag editor
      doc-template-pdf-preview.tsx       # PDF preview with overlay
      doc-template-pdf-canvas-viewer.tsx # Canvas-based PDF viewer
    doc-entry/
      doc-entry-list-client.tsx          # Rewrite: document list
      doc-entry-form-page.tsx            # Rewrite: fill-in-the-blanks form
      doc-entry-field-inputs.tsx         # Dynamic field inputs from template config
      doc-entry-table-region-editor.tsx  # Table row editor
      doc-entry-table.tsx                # Table display
      doc-entry-template-picker-dialog.tsx # Template selection dialog
```

## Implementation Steps

### Step 1: Create template engine types

**`src/lib/template-engine/types.ts`**
```ts
export type PlaceholderType = "text" | "number" | "date" | "currency";

export type ExcelPlaceholder = {
  cellRef: string;    // e.g. "B3"
  label: string;      // e.g. "Tên khách hàng"
  type: PlaceholderType;
};

export type PdfPlaceholder = {
  id: string;
  label: string;
  x: number; y: number; width: number; height: number;
  fontSize: number;
  type: PlaceholderType;
};

export type TableRegionConfig = {
  startRow: number;
  columns: { letter: string; label: string; type: PlaceholderType }[];
};

export type RenderResult = {
  buffer: Buffer;
  contentType: string;   // "application/pdf" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  fileName: string;
};
```

### Step 2: Create template service

**`src/services/template-service.ts`** (~120 lines)
- `getTemplates(tenantId)` — list all templates (built-in + custom).
- `getTemplateById(tenantId, id)` — single template with config.
- `createTemplate(tenantId, data)` — create custom template (upload file, configure placeholders).
- `updateTemplate(tenantId, id, data)` — update config (not file — new upload replaces).
- `deleteTemplate(tenantId, id)` — delete if not built-in and no documents reference it.

### Step 3: Create document service

**`src/services/document-service.ts`** (~120 lines)
- `getDocuments(tenantId, params)` — paginated list, filterable by template.
- `getDocumentById(tenantId, id)` — single document with template.
- `createDocument(tenantId, templateId, data)` — create with auto-generated doc number.
- `updateDocument(tenantId, id, data)` — update field_data + table_rows.
- `deleteDocument(tenantId, id)`.
- `renderDocument(tenantId, documentId, format)` — delegates to template engine.

### Step 4: Create template engine core

**`src/lib/template-engine/index.ts`** (~80 lines)
```ts
export async function renderDocument(template, document, tenant): Promise<RenderResult> {
  if (template.isBuiltin) {
    return renderBuiltinTemplate(template, document, tenant);
  }
  if (template.fileType === "excel") {
    return renderExcelCustom(template, document);
  }
  return renderPdfCustom(template, document);
}

function renderBuiltinTemplate(template, document, tenant): Promise<RenderResult> {
  // Route to correct built-in renderer based on template name/id convention
  // "quote-pdf" -> renderQuotePdf()
  // "quote-excel" -> renderQuoteExcel()
  // "pgh-pdf" -> renderPghPdf()
}
```

### Step 5: Create custom renderers

**`src/lib/template-engine/render-excel-custom.ts`** (~80 lines)
- Load workbook from template.fileBase64
- Fill placeholder cells from document.fieldData
- Insert table rows at tableRegion.startRow from document.tableRows
- Return buffer

**`src/lib/template-engine/render-pdf-custom.ts`** (~80 lines)
- Load PDF from template.fileBase64 using pdf-lib
- Draw text at placeholder positions from document.fieldData
- Import shared font via font-registration
- Return buffer

### Step 6: Create built-in renderers

**`src/lib/template-engine/render-quote-pdf.ts`** (~30 lines)
- Wrapper: loads quote data from document.fieldData (which contains quoteId), fetches full quote + tenant, calls `generatePdfQuote()`.

**`src/lib/template-engine/render-quote-excel.ts`** (~30 lines)
- Same pattern, calls `generateExcelQuote()`.

**`src/lib/template-engine/render-pgh-pdf.ts`** (~30 lines)
- Wrapper: loads PGH data from document.fieldData, fetches tenant, calls PGH layout renderer.

### Step 7: Rewrite PGH layout

**`src/lib/pdf-layouts/pgh-delivery-order-layout.tsx`**
- Rewrite to use shared font registration from `@/lib/pdf/font-registration`
- Accept tenant data (company name, address, tax code) instead of hardcoded values
- Accept PGH fields + items as props
- Export as react-pdf document function

### Step 8: Create server actions

**`src/app/(dashboard)/templates/actions.ts`** — thin wrappers for template-service
**`src/app/(dashboard)/documents/actions.ts`** — thin wrappers for document-service + renderDocument

### Step 9: Create export API routes

**`src/app/api/doc-export/pdf/[documentId]/route.ts`**
- getTenantContext -> load document + template -> renderDocument("pdf") -> return response

**`src/app/api/doc-export/excel/[documentId]/route.ts`**
- Same for Excel

### Step 10: Create template analysis API routes

**`src/app/api/doc-template/analyze/route.ts`** — analyze uploaded Excel, return cell list
**`src/app/api/doc-template/analyze-pdf/route.ts`** — analyze uploaded PDF, return page dimensions

### Step 11: Rewrite template UI components

Rewrite all `doc-template/*` components:
- Use English routes (`/templates/new` instead of `/mau-chung-tu/tao-moi`)
- Use tenant context for data
- Same wizard flow: upload -> configure placeholders -> save

### Step 12: Rewrite document UI components

Rewrite all `doc-entry/*` components:
- Use English routes (`/documents/new`)
- Template picker dialog for choosing template
- Dynamic form based on template placeholders
- Table row editor for table regions
- Export buttons

### Step 13: Seed built-in templates

In `src/db/seed.ts` (extend from Phase 1), add:
- Built-in "Quote PDF" template: `{ name: "Báo giá PDF", isBuiltin: true, fileType: "pdf", docPrefix: "BG-{YYYY}-" }`
- Built-in "Quote Excel" template: `{ name: "Báo giá Excel", isBuiltin: true, fileType: "excel", docPrefix: "BG-{YYYY}-" }`
- Built-in "PGH" template: `{ name: "Phiếu Giao Nhận", isBuiltin: true, fileType: "pdf", docPrefix: "PGH-{YYYY}-" }`

## TODO Checklist

- [ ] Create `src/lib/template-engine/types.ts`
- [ ] Create `src/services/template-service.ts`
- [ ] Create `src/services/document-service.ts`
- [ ] Create `src/lib/template-engine/index.ts`
- [ ] Create `src/lib/template-engine/render-excel-custom.ts`
- [ ] Create `src/lib/template-engine/render-pdf-custom.ts`
- [ ] Create `src/lib/template-engine/render-quote-pdf.ts`
- [ ] Create `src/lib/template-engine/render-quote-excel.ts`
- [ ] Create `src/lib/template-engine/render-pgh-pdf.ts`
- [ ] Rewrite `src/lib/pdf-layouts/pgh-delivery-order-layout.tsx`
- [ ] Create template server actions
- [ ] Create document server actions
- [ ] Create export API routes
- [ ] Create template analysis API routes
- [ ] Rewrite template UI components
- [ ] Rewrite document UI components
- [ ] Seed built-in templates
- [ ] Test custom Excel template: upload -> configure -> create doc -> export
- [ ] Test custom PDF template: upload -> configure -> create doc -> export
- [ ] Test built-in Quote PDF rendering
- [ ] Test built-in PGH rendering

## Success Criteria

- Custom Excel template: upload .xlsx -> define placeholders + table region -> create document -> fill data -> export filled .xlsx
- Custom PDF template: upload .pdf -> define overlay regions -> create document -> fill data -> export filled .pdf
- Built-in Quote PDF: same output quality as current quote PDF export
- Built-in PGH: same output as current PGH but with tenant branding (not hardcoded company)
- Documents stored in DB (not localStorage)
- Auto-numbering per template works correctly

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Template engine over-engineering | Start with 2 types (Excel fill, PDF overlay) + 3 built-ins. No plugin system. |
| PDF overlay positioning accuracy | Keep same coordinate system as current doc template PDF editor |
| Built-in template data binding complexity | Keep simple: built-in renderers receive raw data, not template placeholders |

## Agent Instructions

**File ownership:** `src/lib/template-engine/*`, `src/services/template-service.ts`, `src/services/document-service.ts`, `src/app/(dashboard)/templates/*`, `src/app/(dashboard)/documents/*`, `src/components/doc-template/*`, `src/components/doc-entry/*`, `src/app/api/doc-export/*`, `src/app/api/doc-template/*`, `src/lib/pdf-layouts/*`

**DO NOT touch:** `src/db/schema/*`, `src/auth/*`, `src/services/quote-service.ts`, `src/components/quote/*`

**Assumes from Phase 1:** DB schema (document_templates, documents tables), shared font registration, Drizzle client, tenant context.
**Assumes from Phase 2:** `generate-pdf-quote.tsx`, `generate-excel-quote.ts` exist and work. Quote/product/customer services exist for data lookups in built-in renderers.

**Import convention:** `import { documentTemplates, documents } from "@/db/schema"`, `import { getTenantContext } from "@/lib/tenant-context"`.
