import { z } from "zod";

const documentItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Tên sản phẩm không được trống"),
  specification: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.coerce.number().min(1, "Số lượng phải >= 1"),
  unitPrice: z.coerce.number().min(0, "Đơn giá phải >= 0"),
  amount: z.coerce.number().min(0),
  note: z.string().optional(),
});

export const createDocumentSchema = z.object({
  type: z.enum(["QUOTATION", "WAREHOUSE_EXPORT", "DELIVERY_ORDER"]),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerAddress: z.string().optional(),
  receiverName: z.string().optional(),
  receiverPhone: z.string().optional(),
  items: z.array(documentItemSchema).min(1, "Cần ít nhất 1 sản phẩm"),
  notes: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type DocumentItem = z.infer<typeof documentItemSchema>;
