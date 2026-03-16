import { z } from "zod/v4";

// Use non-optional fields with empty string defaults handled at form level
export const customerFormSchema = z.object({
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  company: z.string(),
  phone: z.string().refine(
    (v) => !v || /^(0|\+84)\d{9,10}$/.test(v.replace(/[\s.-]/g, "")),
    "Số điện thoại không hợp lệ (VD: 0912345678)"
  ),
  email: z.string(),
  address: z.string(),
  notes: z.string(),
  defaultDeliveryAddress: z.string().optional(),
  defaultReceiverName: z.string().optional(),
  defaultReceiverPhone: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

// Backward compat alias
export const customerSchema = customerFormSchema;
