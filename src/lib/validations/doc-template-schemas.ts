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
