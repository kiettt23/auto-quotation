/**
 * Shared types for the Unified Template Engine.
 * These mirror the JSON shapes stored in documentTemplates.placeholders / tableRegion.
 */

export type PlaceholderType = "text" | "number" | "date" | "currency";

/** Excel placeholder: a single cell that gets a value written into it */
export type ExcelPlaceholder = {
  cellRef: string;     // e.g. "C13"
  label: string;
  type: PlaceholderType;
  originalFormula?: string;
};

/** PDF placeholder: a rectangular region on page where text is drawn */
export type PdfPlaceholder = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  type: PlaceholderType;
};

/** Table region configuration for Excel templates */
export type TableRegionConfig = {
  startRow: number;
  columns: {
    /** Column letter e.g. "B" */
    col: string;
    label: string;
    type: PlaceholderType;
  }[];
};

/** Output of a render operation */
export type RenderResult = {
  buffer: Buffer;
  contentType: string;
  fileName: string;
};
