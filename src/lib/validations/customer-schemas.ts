import { z } from "zod/v4";

export const customerSchema = z.object({
  name: z.string().min(1, "Nhập tên khách hàng"),
  company: z.string(),
  phone: z.string(),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  address: z.string(),
  notes: z.string(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
