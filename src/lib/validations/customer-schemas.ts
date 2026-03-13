import { z } from "zod/v4";

// Use non-optional fields with empty string defaults handled at form level
export const customerFormSchema = z.object({
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  company: z.string(),
  phone: z.string(),
  email: z.string(),
  address: z.string(),
  notes: z.string(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

// Backward compat alias
export const customerSchema = customerFormSchema;
