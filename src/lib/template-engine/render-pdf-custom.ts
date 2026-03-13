/**
 * Custom PDF renderer — loads a PDF from base64, draws text at placeholder
 * positions, and returns the modified buffer.
 * Delegates to the existing generatePdfOverlay utility.
 */

import { generatePdfOverlay } from "@/lib/generate-pdf-overlay";
import type { RenderResult } from "./types";

type PdfPlaceholder = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  type: "text" | "number" | "date" | "currency";
};

export async function renderPdfCustom(
  fileBase64: string,
  placeholders: PdfPlaceholder[],
  fieldData: Record<string, string>,
  fileName: string
): Promise<RenderResult> {
  // generatePdfOverlay accepts regions with type "text"|"number"|"date"
  // currency is treated as number for formatting
  const regions = placeholders.map((p) => ({
    ...p,
    type: p.type === "currency" ? ("number" as const) : p.type,
  }));

  const buffer = await generatePdfOverlay(fileBase64, regions, fieldData);
  const baseName = fileName.replace(/\.pdf$/i, "");

  return {
    buffer,
    contentType: "application/pdf",
    fileName: `${baseName}.pdf`,
  };
}
