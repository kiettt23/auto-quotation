/**
 * Template Engine — dispatch layer.
 * Decides which renderer to call based on template type (builtin vs custom, excel vs pdf).
 *
 * Built-in template names (case-insensitive prefix match):
 *   "Báo giá PDF"    → renderQuotePdf
 *   "Báo giá Excel"  → renderQuoteExcel
 *   "Phiếu Giao Nhận" → renderPghPdf
 */

import type { DocumentTemplate, Document, Tenant } from "@/db/schema";
import type { RenderResult } from "./types";
import { renderExcelCustom } from "./render-excel-custom";
import { renderPdfCustom } from "./render-pdf-custom";
import { renderQuotePdf } from "./render-quote-pdf";
import { renderQuoteExcel } from "./render-quote-excel";
import { renderPghPdf } from "./render-pgh-pdf";

// ─── Builtin name matchers ────────────────────────────────

const BUILTIN_QUOTE_PDF_NAMES = ["báo giá pdf", "bao gia pdf"];
const BUILTIN_QUOTE_EXCEL_NAMES = ["báo giá excel", "bao gia excel"];
const BUILTIN_PGH_NAMES = ["phiếu giao nhận", "phieu giao nhan", "pgh"];

function matchesBuiltin(name: string, patterns: string[]): boolean {
  const lower = name.toLowerCase().trim();
  return patterns.some((p) => lower.includes(p));
}

// ─── Main render function ─────────────────────────────────

export async function renderDocument(
  template: DocumentTemplate,
  document: Document,
  tenant: Tenant
): Promise<RenderResult> {
  const fieldData = (document.fieldData ?? {}) as Record<string, string>;
  const tableRows = (document.tableRows ?? []) as Record<string, string>[];

  // Route built-in templates by name
  if (matchesBuiltin(template.name, BUILTIN_QUOTE_PDF_NAMES)) {
    return renderQuotePdf(fieldData, tableRows, tenant, document.docNumber);
  }

  if (matchesBuiltin(template.name, BUILTIN_QUOTE_EXCEL_NAMES)) {
    return renderQuoteExcel(fieldData, tableRows, tenant, document.docNumber);
  }

  if (matchesBuiltin(template.name, BUILTIN_PGH_NAMES)) {
    return renderPghPdf(fieldData, tableRows, tenant, document.docNumber);
  }

  // Custom template rendering
  if (template.fileType === "excel") {
    const placeholders = (template.placeholders ?? []) as {
      cellRef: string;
      label: string;
      type: "text" | "number" | "date" | "currency";
      originalFormula?: string;
    }[];
    const tableRegion = template.tableRegion as {
      startRow: number;
      columns: { col: string; label: string; type: "text" | "number" | "date" | "currency" }[];
    } | null;

    return renderExcelCustom(
      template.fileBase64,
      template.sheetName,
      placeholders,
      tableRegion,
      fieldData,
      tableRows,
      `${document.docNumber}`
    );
  }

  // PDF custom
  const placeholders = (template.placeholders ?? []) as {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    type: "text" | "number" | "date" | "currency";
  }[];

  return renderPdfCustom(
    template.fileBase64,
    placeholders,
    fieldData,
    `${document.docNumber}`
  );
}
