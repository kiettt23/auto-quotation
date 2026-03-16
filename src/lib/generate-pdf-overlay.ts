import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// ─── Types ────────────────────────────────────────────────────────────────────

type PdfRegion = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  type: "text" | "number" | "date";
  /** Page index (0-based). Defaults to 0 for backward compatibility. */
  pageIndex?: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(raw: string | undefined, type: PdfRegion["type"]): string {
  if (!raw) return "";
  if (type === "date") {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : d.toLocaleDateString("vi-VN");
  }
  if (type === "number") {
    const n = Number(raw);
    return isNaN(n) ? raw : n.toLocaleString("vi-VN");
  }
  return raw;
}

function loadFontBytes(): Uint8Array {
  const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
  return fs.readFileSync(fontPath);
}

// ─── PDF overlay function ─────────────────────────────────────────────────────

/**
 * Takes the original PDF (base64), overlays user values on each region,
 * and returns the modified PDF bytes.
 *
 * Note: PDF coordinate system has (0,0) at bottom-left.
 */
export async function generatePdfOverlay(
  fileBase64: string,
  regions: PdfRegion[],
  fieldData: Record<string, string>
): Promise<Buffer> {
  const pdfBytes = Buffer.from(fileBase64, "base64");
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = loadFontBytes();
  const font = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  if (pages.length === 0) return Buffer.from(await pdfDoc.save());

  // Group regions by page index (default to page 0)
  const regionsByPage = new Map<number, PdfRegion[]>();
  for (const region of regions) {
    const idx = region.pageIndex ?? 0;
    if (!regionsByPage.has(idx)) regionsByPage.set(idx, []);
    regionsByPage.get(idx)!.push(region);
  }

  for (const [pageIdx, pageRegions] of regionsByPage) {
    const page = pages[pageIdx];
    if (!page) continue; // skip if page doesn't exist

    for (const region of pageRegions) {
      const value = formatValue(fieldData[region.id], region.type);
      if (!value) continue;

      // Draw white rectangle to cover existing content
      page.drawRectangle({
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        color: rgb(1, 1, 1),
      });

      // Draw text value at position (y offset to center text within height)
      const textY = region.y + (region.height - region.fontSize) / 2;
      page.drawText(value, {
        x: region.x + 2,
        y: Math.max(region.y, textY),
        size: region.fontSize,
        font,
        color: rgb(0, 0, 0),
        maxWidth: region.width - 4,
      });
    }
  }

  const modifiedPdfBytes = await pdfDoc.save();
  return Buffer.from(modifiedPdfBytes);
}
