import { z } from "zod";

const documentItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Tên sản phẩm không được trống"),
  specification: z.union([z.string(), z.number()]).optional(),
  unit: z.string().optional(),
  quantity: z.coerce.number().optional(),
  unitPrice: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  note: z.union([z.string(), z.number()]).optional(),
  customFields: z.record(z.string(), z.union([z.string(), z.coerce.number()])).optional(),
});

export const createDocumentSchema = z.object({
  /** Document type ID (FK to document_type table) */
  typeId: z.string().min(1, "Chọn loại chứng từ"),
  /** @deprecated Kept for backward compat during migration */
  type: z.enum(["QUOTATION", "WAREHOUSE_EXPORT", "DELIVERY_ORDER"]).optional(),
  /** Custom date (dd/MM/yyyy) — overrides createdAt on PDF */
  date: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerAddress: z.string().optional(),
  receiverName: z.string().optional(),
  receiverPhone: z.string().optional(),
  /** Delivery-specific fields (used by delivery templates) */
  deliveryName: z.string().optional(),
  deliveryAddress: z.string().optional(),
  driverName: z.string().optional(),
  vehicleId: z.string().optional(),
  items: z.array(documentItemSchema).min(1, "Cần ít nhất 1 sản phẩm"),
  notes: z.string().optional(),
  /** Per-document column override */
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(["text", "number", "currency"]),
    width: z.string(),
    align: z.enum(["left", "right", "center"]).optional(),
    system: z.boolean().optional(),
  })).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type DocumentItem = z.infer<typeof documentItemSchema>;
