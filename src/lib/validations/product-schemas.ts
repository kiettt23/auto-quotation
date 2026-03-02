import { z } from "zod/v4";

export const pricingTierSchema = z.object({
  minQuantity: z.number().int().min(1, "Tối thiểu 1"),
  maxQuantity: z.number().int().min(1).nullable(),
  price: z.number().min(0, "Giá >= 0"),
});

export const volumeDiscountSchema = z.object({
  minQuantity: z.number().int().min(1, "Tối thiểu 1"),
  discountPercent: z.number().min(0).max(100, "0-100%"),
});

export const productSchema = z.object({
  code: z.string().min(1, "Mã sản phẩm bắt buộc"),
  name: z.string().min(1, "Tên sản phẩm bắt buộc"),
  categoryId: z.string().min(1, "Chọn danh mục"),
  unitId: z.string().min(1, "Chọn đơn vị tính"),
  description: z.string().optional(),
  notes: z.string().optional(),
  pricingType: z.enum(["FIXED", "TIERED"]),
  basePrice: z.number().min(0).optional(),
  pricingTiers: z.array(pricingTierSchema).optional(),
  volumeDiscounts: z.array(volumeDiscountSchema).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
