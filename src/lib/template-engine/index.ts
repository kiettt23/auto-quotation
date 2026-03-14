/**
 * Template Engine — dispatch layer.
 * Routes rendering: preset templates (auto-discovered) → builtin quotes → custom.
 */

import type { DocumentTemplate, Document, Tenant } from "@/db/schema";
import type { RenderResult } from "./types";
import { findPresetRenderer } from "@/lib/preset-templates/preset-renderers";
import { renderExcelCustom } from "./render-excel-custom";
import { renderPdfCustom } from "./render-pdf-custom";
import { renderQuotePdf } from "./render-quote-pdf";
import { renderQuoteExcel } from "./render-quote-excel";

// ─── Legacy builtin matchers (quotes — not yet migrated to presets) ──────────

const BUILTIN_QUOTE_PDF_NAMES = ["báo giá pdf", "bao gia pdf"];
const BUILTIN_QUOTE_EXCEL_NAMES = ["báo giá excel", "bao gia excel"];

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

  // 1. Check preset templates (single source of truth)
  const presetRenderer = findPresetRenderer(template.name);
  if (presetRenderer) {
    return presetRenderer(fieldData, tableRows, tenant, document.docNumber);
  }

  // 2. Legacy builtin quotes (will migrate to presets later)
  if (matchesBuiltin(template.name, BUILTIN_QUOTE_PDF_NAMES)) {
    return renderQuotePdf(fieldData, tableRows, tenant, document.docNumber);
  }

  if (matchesBuiltin(template.name, BUILTIN_QUOTE_EXCEL_NAMES)) {
    return renderQuoteExcel(fieldData, tableRows, tenant, document.docNumber);
  }

  // 3. Custom template rendering
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

  // PDF custom (coordinate-based overlay)
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
