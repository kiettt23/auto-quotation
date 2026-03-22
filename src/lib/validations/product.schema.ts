import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  categoryId: z.string().optional(),
  unitId: z.string().optional(),
  unitPrice: z.coerce.number().int().min(0, "Đơn giá phải >= 0"),
  specification: z.string().optional(),
  description: z.string().optional(),
  customData: z.record(z.string(), z.union([z.string(), z.coerce.number()])).nullable().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
