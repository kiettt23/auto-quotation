/**
 * Server-only: maps preset IDs to their renderer functions.
 * Keep this separate from the client-safe preset metadata to avoid
 * pulling Node.js modules (fs, path) into the client bundle.
 *
 * Presets that support multiple formats (e.g. PDF + Excel) register
 * both renderers keyed by format.
 */

import type { Tenant } from "@/db/schema";
import type { RenderResult } from "@/lib/template-engine/types";
import { renderPghPdf } from "@/lib/template-engine/render-pgh-pdf";
import { renderPxkPdf } from "@/lib/template-engine/render-pxk-pdf";
import { renderQuotePdf } from "@/lib/template-engine/render-quote-pdf";
import { renderQuoteExcel } from "@/lib/template-engine/render-quote-excel";
import { findPresetByName } from "./index";

export type PresetRenderer = (
  fieldData: Record<string, string>,
  tableRows: Record<string, string>[],
  tenant: Tenant,
  docNumber: string
) => Promise<RenderResult>;

type ExportFormat = "pdf" | "excel";

/** Map preset ID → format → renderer. Add new entries when creating presets. */
const RENDERER_MAP: Record<string, Partial<Record<ExportFormat, PresetRenderer>>> = {
  "preset-bao-gia": { pdf: renderQuotePdf, excel: renderQuoteExcel },
  "preset-pgh": { pdf: renderPghPdf },
  "preset-pxk": { pdf: renderPxkPdf },
};

/**
 * Find a preset renderer by template name and export format.
 * Falls back to the preset's default fileType if format is not specified.
 */
export function findPresetRenderer(
  templateName: string,
  format?: ExportFormat
): PresetRenderer | undefined {
  const preset = findPresetByName(templateName);
  if (!preset) return undefined;

  const renderers = RENDERER_MAP[preset.id];
  if (!renderers) return undefined;

  // Use requested format, or fallback to preset's default fileType
  const targetFormat = format ?? preset.fileType;
  return renderers[targetFormat as ExportFormat];
}
