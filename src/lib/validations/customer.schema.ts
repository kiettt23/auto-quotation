import { z } from "zod";

export const customerFormSchema = z.object({
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  taxCode: z.string().optional(),
  deliveryAddress: z.string().optional(),
  receiverName: z.string().optional(),
  receiverPhone: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
