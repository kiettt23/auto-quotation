import { z } from "zod";

// ─── Placeholder (a cell in template that gets replaced) ─

export const placeholderSchema = z.object({
  cellRef: z.string().min(1),   // e.g. "C13"
  label: z.string().min(1),     // e.g. "Khách hàng"
  type: z.enum(["text", "number", "date"]).default("text"),
  originalFormula: z.string().default(""), // original formula for reference
});

export type Placeholder = z.infer<typeof placeholderSchema>;

// ─── Table region (repeating rows) ──────────────────────

export const tableColumnSchema = z.object({
  col: z.string().min(1),       // column letter e.g. "B"
  label: z.string().min(1),     // e.g. "Hợp đồng"
  type: z.enum(["text", "number", "date"]).default("text"),
});

export const tableRegionSchema = z.object({
  startRow: z.number().int(),
  columns: z.array(tableColumnSchema).min(1),
});

export type TableColumn = z.infer<typeof tableColumnSchema>;
export type TableRegion = z.infer<typeof tableRegionSchema>;

// ─── PDF text region (overlay area on PDF page) ─────────

export const pdfRegionSchema = z.object({
  id: z.string().min(1),           // unique identifier
  label: z.string().min(1),        // display label e.g. "Khách hàng"
  x: z.number(),                   // left position (PDF points)
  y: z.number(),                   // bottom position (PDF points)
  width: z.number().positive(),    // region width
  height: z.number().positive(),   // region height
  fontSize: z.number().default(10),
  type: z.enum(["text", "number", "date"]).default("text"),
});

export type PdfRegion = z.infer<typeof pdfRegionSchema>;
