import { z } from "zod/v4";

// Non-optional fields — defaults handled at form level to avoid resolver type conflicts
export const pricingTierSchema = z.object({
  minQuantity: z.number().min(1, "Tối thiểu 1"),
  maxQuantity: z.number().nullable().optional(),
  price: z.number().min(0, "Giá >= 0"),
});

export const volumeDiscountSchema = z.object({
  minQuantity: z.number().min(1, "Tối thiểu 1"),
  discountPercent: z.number().min(0).max(100, "0-100%"),
});

export const productFormSchema = z.object({
  code: z.string().min(1, "Mã sản phẩm không được để trống"),
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  description: z.string(),
  notes: z.string(),
  categoryId: z.string().nullable().optional(),
  unitId: z.string().nullable().optional(),
  basePrice: z.number().min(0, "Giá phải >= 0"),
  pricingType: z.enum(["FIXED", "TIERED"]),
  pricingTiers: z.array(pricingTierSchema),
  volumeDiscounts: z.array(volumeDiscountSchema),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Keep legacy alias for backward compat
export const productSchema = productFormSchema;
