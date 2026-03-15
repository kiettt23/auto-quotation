/**
 * Template Engine — dispatch layer.
 * Routes rendering: preset templates (auto-discovered) → custom file-based.
 */

import type { DocumentTemplate, Document, Tenant } from "@/db/schema";
import type { RenderResult } from "./types";
import { findPresetRenderer } from "@/lib/preset-templates/preset-renderers";
import { renderExcelCustom } from "./render-excel-custom";
import { renderPdfCustom } from "./render-pdf-custom";

// ─── Main render function ─────────────────────────────────

export async function renderDocument(
  template: DocumentTemplate,
  document: Document,
  tenant: Tenant,
  format?: "pdf" | "excel"
): Promise<RenderResult> {
  const fieldData = (document.fieldData ?? {}) as Record<string, string>;
  const tableRows = (document.tableRows ?? []) as Record<string, string>[];

  // 1. Check preset templates (single source of truth)
  const presetRenderer = findPresetRenderer(template.name, format);
  if (presetRenderer) {
    return presetRenderer(fieldData, tableRows, tenant, document.docNumber);
  }

  // 2. Custom template rendering
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
