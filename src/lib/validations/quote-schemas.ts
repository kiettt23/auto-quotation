import { z } from "zod/v4";

// Non-optional fields — defaults handled at form level to avoid resolver type conflicts
export const quoteItemSchema = z.object({
  productId: z.string().nullable().optional(),
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  description: z.string(),
  unit: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  discountPercent: z.number().min(0).max(100),
  isCustomItem: z.boolean(),
  sortOrder: z.number(),
});

export const quoteFormSchema = z.object({
  customerId: z.string().nullable().optional(),
  customerName: z.string(),
  customerCompany: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string(),
  customerAddress: z.string(),
  globalDiscountPercent: z.number().min(0).max(100),
  vatPercent: z.number().min(0),
  shippingFee: z.number().min(0),
  otherFees: z.number().min(0),
  otherFeesLabel: z.string(),
  notes: z.string(),
  terms: z.string(),
  validUntil: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "Cần ít nhất 1 sản phẩm"),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
export type QuoteItemValues = z.infer<typeof quoteItemSchema>;

// Used by service layer — matches the parsed schema output
export type QuoteFormData = QuoteFormValues;
