# Phase 05: Excel Import Wizard

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Import Wizard](../reports/wireframes-auto-quotation.md#7-import-excel-wizard)
- [Brainstorm - Data Migration](../reports/brainstorm-auto-quotation.md#10-additional-specs)

## Overview

- **Priority:** P1 - User has existing Excel data that needs importing
- **Status:** Pending
- **Effort:** 4h
- **Description:** 3-step wizard dialog for importing products from Excel/CSV files. Upload -> Column Mapping -> Preview & Import.

## Key Insights

- User's existing Excel data is "messy" (per brainstorm) - column names vary, some data missing
- Parse Excel server-side using exceljs (API route, not Server Action, because file streaming)
- Column auto-detection: try to match Excel header names to system fields (fuzzy)
- Upsert by product code: if code exists, update; if new, create
- Products without a price import with basePrice = 0 (with warning)
- Categories from Excel that don't exist get auto-created
- Max file size: 5MB (Vercel serverless body limit)

## Requirements

### Functional
- **Step 1 - Upload:** Drag-and-drop or click to select file. Accept .xlsx, .xls, .csv. Max 5MB. Show file name + row count after parse.
- **Step 2 - Mapping:** Show detected Excel columns. Dropdown to map each to system field (Ma san pham, Ten san pham, Danh muc, Gia ban, Don vi tinh, Mo ta, Ghi chu, -- Bo qua --). Show warnings (missing price, duplicate codes).
- **Step 3 - Preview:** Show first 5 rows as table. Summary stats: total rows, new products, updates (existing codes), warnings. Import button.
- Progress indicator showing current step
- Cancel at any step returns to product list

### Non-Functional
- File parsing happens on server (API route) - no large file processing on client
- Import uses database transaction for atomicity
- Provide clear error messages for unsupported formats or corrupt files

## Architecture

### Data Flow

```
Client                          Server (API Route)
------                          ------------------
1. User selects file
2. Upload file ──────────────> POST /api/import/parse
                                 ├── Parse with exceljs
                                 ├── Extract headers + rows
                                 └── Return { headers[], rows[][], rowCount }
3. User maps columns
4. Send mapping ─────────────> POST /api/import/preview
                                 ├── Apply column mapping
                                 ├── Validate data
                                 ├── Check existing codes
                                 └── Return { preview[], stats }
5. User confirms
6. Import request ───────────> POST /api/import/execute
                                 ├── Upsert products in transaction
                                 ├── Auto-create missing categories
                                 └── Return { created, updated, errors[] }
```

### Component Tree

```
ProductImportWizard (Dialog)
├── StepIndicator (3 steps with progress)
├── Step 1: FileUploadStep
│   └── FileDropzone (drag-drop + click)
├── Step 2: ColumnMappingStep
│   ├── MappingRow[] (Excel column -> system field dropdown)
│   └── WarningList
└── Step 3: PreviewImportStep
    ├── PreviewTable (first 5 rows)
    ├── ImportStats (total, new, update, warnings)
    └── ImportButton
```

## Related Code Files

### Files to Create

```
src/
├── app/api/import/
│   ├── parse/route.ts               # Parse Excel file, return headers + rows
│   ├── preview/route.ts             # Apply mapping, validate, return preview
│   └── execute/route.ts             # Upsert products in transaction
├── components/product/
│   ├── product-import-wizard.tsx     # Main wizard dialog with step management
│   ├── import-file-upload-step.tsx   # Step 1: file drag-drop
│   ├── import-column-mapping-step.tsx # Step 2: column mapping dropdowns
│   └── import-preview-step.tsx       # Step 3: preview table + stats + import
└── lib/
    └── import-excel-parser.ts        # Shared parsing logic using exceljs
```

## Implementation Steps

1. **Create Excel parser utility** (`src/lib/import-excel-parser.ts`)
   - Function `parseExcelBuffer(buffer: Buffer)`: uses exceljs to read workbook
   - Auto-detect first sheet, extract header row (first row) and data rows
   - Handle .xlsx and .csv (exceljs supports both)
   - Return `{ headers: string[], rows: any[][], rowCount: number }`
   - Strip empty rows

2. **Build parse API route** (`src/app/api/import/parse/route.ts`)
   - Accept multipart/form-data with file
   - Validate: file exists, size <= 5MB, extension is .xlsx/.xls/.csv
   - Call `parseExcelBuffer`
   - Return headers and first 100 rows (for mapping preview)
   - Store full parsed data in memory or temp file for next step
   - **Design decision:** Return ALL rows to client for steps 2-3 to avoid extra server state. For 500 rows this is ~100KB JSON - acceptable.

3. **Build preview API route** (`src/app/api/import/preview/route.ts`)
   - Accept: `{ rows[][], mapping: Record<systemField, excelColumnIndex> }`
   - Apply mapping: transform each row into product shape
   - Validate each row: check required fields (name), parse price as number
   - Check existing product codes in DB
   - Return: `{ preview: first5rows[], stats: { total, new, update, missingPrice, duplicateCodes } }`

4. **Build execute API route** (`src/app/api/import/execute/route.ts`)
   - Accept: same mapped data
   - In Prisma transaction:
     - Auto-create categories that don't exist
     - For each row: upsert Product by code
     - Set pricingType = FIXED, basePrice from mapped price column
     - Link to category by name match (case-insensitive)
     - Link to unit by name match (create if missing)
   - Return: `{ created: number, updated: number, errors: { row, message }[] }`
   - Revalidate /san-pham path

5. **Build ProductImportWizard dialog**
   - Manage wizard state: currentStep (1|2|3), parsedData, mapping, preview
   - Step indicator: 3 circles connected by lines, active step highlighted
   - Navigation: "Quay lai" / "Tiep" buttons, disabled when invalid
   - Cancel: close dialog, reset state

6. **Build FileUploadStep**
   - Dropzone area with dashed border
   - Accept drag-and-drop (onDrop handler)
   - Click to trigger hidden file input
   - Show accepted formats and max size
   - On file select: upload to parse API, show loading spinner
   - On success: show file name, row count, enable "Tiep" button

7. **Build ColumnMappingStep**
   - Display each detected Excel header as a row
   - Each row: "Cot X: {header}" -> Select dropdown with system fields
   - System field options: Ma san pham, Ten san pham, Danh muc, Gia ban, Don vi tinh, Mo ta, Ghi chu, -- Bo qua --
   - Auto-map: try fuzzy matching header names to system fields (e.g., "Ten" -> "Ten san pham", "Gia" -> "Gia ban")
   - Show warnings below: "X dong thieu gia", "Y dong trung ma"
   - Validate: "Ten san pham" must be mapped (required)

8. **Build PreviewImportStep**
   - Table showing first 5 mapped rows with system field headers
   - Stats card: "Tong: X dong | Them moi: Y | Cap nhat: Z | Canh bao: W"
   - "Import X SP" button with loading state
   - On success: show result toast, close dialog, refresh product list

## Todo List

- [ ] Create Excel parser utility with exceljs
- [ ] Build parse API route (file upload + parsing)
- [ ] Build preview API route (mapping + validation + stats)
- [ ] Build execute API route (upsert products in transaction)
- [ ] Build ProductImportWizard dialog with step management
- [ ] Build FileUploadStep with drag-and-drop
- [ ] Build ColumnMappingStep with auto-detect and dropdowns
- [ ] Build PreviewImportStep with table preview and stats
- [ ] Test with sample Excel files (various column orders, missing data)
- [ ] Handle edge cases: empty file, no header row, non-numeric prices

## Success Criteria

- Upload .xlsx/.csv file and see row count
- Column headers auto-detected and auto-mapped where possible
- User can manually adjust column mapping
- Warnings shown for missing prices and duplicate codes
- Preview shows correct data transformation
- Import creates/updates correct product count
- Products visible in product list after import
- Error handling for corrupt files, oversized files

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large Excel file (5000+ rows) | Timeout on Vercel (10s limit) | Limit to 1000 rows per import; batch if needed |
| Excel with merged cells / complex formatting | Parse fails | exceljs handles merged cells; test with real user data |
| Column auto-mapping fails | User confusion | Always allow manual override; auto-map is just suggestion |
| Transaction timeout on large imports | Partial data | Process in batches of 100 within transaction |

## Next Steps

- Phase 08: Quote Builder can reference imported products
- Future: consider background job for very large imports (not MVP)
