import { z } from "zod";

const documentItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().default(""),
  specification: z.union([z.string(), z.number()]).optional(),
  unit: z.string().optional(),
  quantity: z.coerce.number().optional(),
  unitPrice: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  note: z.union([z.string(), z.number()]).optional(),
  customFields: z.record(z.string(), z.union([z.string(), z.coerce.number()])).optional(),
});

export const createDocumentSchema = z.object({
  /** Company ID (FK to company table) */
  companyId: z.string().min(1, "Chọn công ty"),
  /** Template registry ID: "quotation", "delivery-order" */
  templateId: z.string().min(1, "Chọn loại chứng từ"),
  /** Custom date (dd/MM/yyyy) — overrides createdAt on PDF */
  date: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerAddress: z.string().optional(),
  receiverName: z.string().optional(),
  receiverPhone: z.string().optional(),
  /** Template-specific extra fields (nested to avoid polluting shared data) */
  templateFields: z.record(z.string(), z.string()).optional(),
  /** Suffix for manual document number (e.g. "ABC123" → "JS - 260324 - ABC123") */
  documentNumberSuffix: z.string().optional(),
  items: z.array(documentItemSchema).default([]),
  notes: z.string().optional(),
  /** Per-document column override */
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(["text", "number", "currency", "checkbox"]),
    width: z.string(),
    align: z.enum(["left", "right", "center"]).optional(),
    system: z.boolean().optional(),
  })).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type DocumentItem = z.infer<typeof documentItemSchema>;
