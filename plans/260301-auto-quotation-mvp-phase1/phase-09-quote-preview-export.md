# Phase 09: Quote Preview & Export

## Context Links

- [Plan Overview](./plan.md)
- [Wireframe - Public Quote View](../reports/wireframes-auto-quotation.md#11-public-quote-view-share-link)
- [Design System - PDF Template](../reports/design-system-auto-quotation.md#9-pdf-template-design)

## Overview

- **Priority:** P1 - Users need to generate and share professional quotes
- **Status:** Pending
- **Effort:** 6h
- **Description:** Live quote preview component, PDF export using @react-pdf/renderer, Excel export using exceljs, share link generation, and public quote view page.

## Key Insights

- QuotePreview component is reused: right panel of builder (Phase 08) AND public view page
- PDF uses Roboto font (not Inter) for Vietnamese character support in PDF generation
- @react-pdf/renderer runs client-side for dynamic generation, but can also run server-side
- Excel export must be an API route (binary file response) - not a Server Action
- Share token: random UUID, stored in Quote.shareToken
- Public view at `/chia-se/[token]`: SSR, read-only, no sidebar layout
- PDF and Excel download available on public view

## Requirements

### Functional
- **QuotePreview:** HTML component rendering quote as it will appear in PDF, real-time updates
- **PDF export:** A4 layout, company header + logo, "BANG BAO GIA" title, customer info, product table, summary, amount in words, terms, signature blocks, bank info footer. Uses Roboto font.
- **Excel export:** Professional layout with headers, styled product table, merged cells, auto-column-width, summary row
- **Share link:** Generate unique token, copy link to clipboard
- **Public view:** `/chia-se/[token]` - full quote rendered, download PDF/Excel buttons, company branding, validity notice

### Non-Functional
- PDF generation < 5 seconds
- Excel generation < 3 seconds
- Public view page loads via SSR (fast, SEO-friendly)
- Preview updates in real-time as user edits form (no lag)

## Architecture

### Component Tree

```
QuotePreview (reusable component)
├── QuotePreviewHeader (company logo, name, address, contact)
├── QuotePreviewTitle (BANG BAO GIA + number + date)
├── QuotePreviewCustomer (customer info block)
├── QuotePreviewTable (product items table)
├── QuotePreviewSummary (subtotal, discount, VAT, total)
├── QuotePreviewAmountInWords (Vietnamese text)
├── QuotePreviewTerms (terms & conditions)
├── QuotePreviewSignatures (signature blocks)
└── QuotePreviewBankInfo (bank details footer)

QuotePdfDocument (@react-pdf/renderer)
├── Same structure as QuotePreview but using react-pdf primitives
├── <Document>, <Page>, <View>, <Text>, <Image>
├── Roboto font registration
└── A4 dimensions with margins

Public View Page (/chia-se/[token]/page.tsx)
├── Fetch quote by shareToken (SSR)
├── Fetch settings for company info
├── Render QuotePreview (HTML version)
└── Download buttons: PDF, Excel
```

### API Routes

```
src/app/api/export/
├── pdf/[quoteId]/route.ts       # Generate and return PDF blob
└── excel/[quoteId]/route.ts     # Generate and return Excel blob
```

## Related Code Files

### Files to Create

```
src/
├── app/
│   ├── chia-se/
│   │   └── [token]/page.tsx             # Public quote view (SSR)
│   └── api/export/
│       ├── pdf/[quoteId]/route.ts       # PDF generation endpoint
│       └── excel/[quoteId]/route.ts     # Excel generation endpoint
├── components/quote/
│   ├── quote-preview.tsx                # HTML preview component (reusable)
│   ├── quote-preview-header.tsx         # Company header section
│   ├── quote-preview-table.tsx          # Items table section
│   ├── quote-preview-summary.tsx        # Totals section
│   └── quote-pdf-document.tsx           # @react-pdf/renderer PDF template
├── lib/
│   ├── generate-share-token.ts          # UUID generation for share links
│   └── generate-excel-quote.ts          # exceljs workbook builder
```

### Files to Modify

```
src/app/(dashboard)/bao-gia/actions.ts   # Add generateShareLink action
src/components/quote/quote-builder-page.tsx  # Integrate preview panel
```

## Implementation Steps

1. **Build QuotePreview HTML component** (`src/components/quote/quote-preview.tsx`)
   - Accepts props: `{ quote, items, settings, companyInfo }` (or combined type)
   - Renders complete quote layout matching wireframe section 11
   - Uses formatCurrency for all amounts
   - Uses numberToVietnameseWords for amount-in-words
   - Conditional sections based on Settings toggles (showAmountInWords, showBankInfo, showSignatureBlocks)
   - Styled with Tailwind: white background, proper typography, table with borders
   - Responsive: scales to fit container

2. **Extract preview sub-components** for maintainability
   - `quote-preview-header.tsx`: Logo + company info
   - `quote-preview-table.tsx`: STT, San pham, DVT, SL, Don gia, Thanh tien
   - `quote-preview-summary.tsx`: Tam tinh, CK, Van chuyen, VAT, TONG CONG

3. **Integrate preview into Quote Builder** (Phase 08 right panel)
   - Pass form values to QuotePreview
   - Preview updates in real-time via react-hook-form watch

4. **Build QuotePdfDocument** (`src/components/quote/quote-pdf-document.tsx`)
   - Import and register Roboto font (Vietnamese support)
     ```typescript
     Font.register({
       family: 'Roboto',
       fonts: [
         { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
         { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
         { src: '/fonts/Roboto-Medium.ttf', fontWeight: 500 },
       ]
     })
     ```
   - Download Roboto TTF files to `public/fonts/`
   - A4 page: 210 x 297mm, margins per design system (top 20mm, bottom 25mm, sides 15mm)
   - Replicate QuotePreview layout using react-pdf primitives
   - Table header: bg #0369A1, text white
   - Alternating row colors: white / #F8FAFC
   - Total row: bg #0F172A, text white, bold
   - Company primary color from Settings.primaryColor

5. **Build PDF API route** (`src/app/api/export/pdf/[quoteId]/route.ts`)
   - Fetch quote with items + settings
   - Render QuotePdfDocument to buffer: `renderToBuffer(<QuotePdfDocument ... />)`
   - Return Response with `Content-Type: application/pdf`, `Content-Disposition: attachment; filename=BG-2026-XXXX.pdf`

6. **Build Excel generator** (`src/lib/generate-excel-quote.ts`)
   - Create exceljs Workbook + Worksheet
   - Row 1-3: Company header (merged cells, bold)
   - Row 5: "BANG BAO GIA" title (merged, centered, large font)
   - Row 6: Quote number + date
   - Row 8-9: Customer info
   - Row 11+: Product table with header styling (bg #0369A1, white text)
   - Product rows with borders
   - Summary rows: Tam tinh, CK, VAT, Ship, TONG CONG (bold)
   - Auto-column-width based on content
   - Number format for VND columns: `#,##0`

7. **Build Excel API route** (`src/app/api/export/excel/[quoteId]/route.ts`)
   - Fetch quote data
   - Call generateExcelQuote
   - Return Response with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment`

8. **Implement share link generation**
   - `generateShareToken()`: returns `crypto.randomUUID()`
   - Server action in `bao-gia/actions.ts`: `generateShareLink(quoteId)` - creates token, saves to Quote.shareToken, returns full URL
   - Copy-to-clipboard on client: `navigator.clipboard.writeText(url)`
   - Toast: "Da sao chep link chia se"

9. **Build public quote view** (`src/app/chia-se/[token]/page.tsx`)
   - Server component: fetch Quote by shareToken (include items, ordered by sortOrder)
   - Fetch Settings for company info and display toggles
   - If not found: show 404 page
   - If found: render QuotePreview (full width, centered, max-w-4xl)
   - Below preview: download buttons [Tai PDF] [Tai Excel]
   - Footer: "Bao gia boi {companyName} | Hieu luc den {validUntil}"
   - NO sidebar, NO header - standalone page layout
   - This route uses `src/app/chia-se/[token]/layout.tsx` (minimal layout, no dashboard shell)

10. **Add export buttons to Quote Builder**
    - Action bar: [Xuat PDF] [Xuat Excel] [Chia se link]
    - PDF: opens new tab with `/api/export/pdf/{quoteId}` (or triggers download)
    - Excel: triggers download from `/api/export/excel/{quoteId}`
    - Share: generates link if none exists, copies to clipboard

## Todo List

- [ ] Build QuotePreview HTML component with all sections
- [ ] Extract preview sub-components (header, table, summary)
- [ ] Integrate preview into Quote Builder right panel
- [ ] Download and register Roboto font files
- [ ] Build QuotePdfDocument with @react-pdf/renderer
- [ ] Build PDF API route
- [ ] Build Excel generator with exceljs
- [ ] Build Excel API route
- [ ] Implement share link generation (token + copy to clipboard)
- [ ] Build public quote view page (/chia-se/[token])
- [ ] Add export buttons to Quote Builder
- [ ] Test PDF output: Vietnamese characters, formatting, logo, all sections
- [ ] Test Excel output: formatting, formulas, column widths
- [ ] Test public view: loads correctly, download buttons work

## Success Criteria

- QuotePreview renders all sections matching wireframe
- Preview updates in real-time in Quote Builder
- PDF: A4 format, professional layout, Vietnamese text renders correctly (Roboto)
- PDF: Company logo, product table, summary, terms, signatures, bank info all present
- Excel: Professional layout with styled headers, formatted numbers, auto-width columns
- Share link: generates unique URL, copies to clipboard
- Public view: renders quote correctly, download PDF/Excel buttons work
- Conditional sections respect Settings toggles
- PDF file size reasonable (< 500KB for typical quote)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| @react-pdf/renderer Vietnamese font issues | Garbled text in PDF | Test with Roboto early; have NotoSansSC as backup font |
| PDF generation timeout (Vercel 10s) | Export fails | Keep PDF simple; pre-compute all data before render |
| Large quote (50+ items) spans multiple PDF pages | Layout breaks | Test pagination; @react-pdf handles page breaks |
| Public share link security | Unauthorized access | Token is unguessable UUID; no sensitive data beyond quote info |
| Roboto font file size | Slow initial load | Host fonts locally in public/fonts/; fonts cached after first load |

## Security Considerations

- Share tokens are random UUIDs (unguessable)
- Public view is read-only, no mutations possible
- API export routes should validate quoteId exists

## Next Steps

- Phase 10: Quote list provides links to export/share for each quote
- Phase 12: Error handling for failed exports
