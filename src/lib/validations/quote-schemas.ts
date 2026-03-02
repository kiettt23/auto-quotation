import { z } from "zod/v4";

export const quoteItemSchema = z.object({
  productId: z.string().nullable(),
  name: z.string().min(1, "Tên sản phẩm bắt buộc"),
  description: z.string(),
  unit: z.string(),
  quantity: z.number().int().min(1, "Số lượng >= 1"),
  unitPrice: z.number().min(0, "Đơn giá >= 0"),
  discountPercent: z.number().min(0).max(100),
  isCustomItem: z.boolean(),
  sortOrder: z.number(),
});

export const quoteFormSchema = z.object({
  customerId: z.string().nullable(),
  customerName: z.string(),
  customerCompany: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string(),
  customerAddress: z.string(),

  items: z.array(quoteItemSchema).min(1, "Cần ít nhất 1 sản phẩm"),

  globalDiscountPercent: z.number().min(0).max(100),
  vatPercent: z.number().min(0).max(100),
  shippingFee: z.number().min(0),
  otherFees: z.number().min(0),
  otherFeesLabel: z.string(),

  notes: z.string(),
  terms: z.string(),
  validUntil: z.string(), // ISO date string
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
export type QuoteItemValues = z.infer<typeof quoteItemSchema>;
