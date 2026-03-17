import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Tên công ty không được để trống"),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxCode: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
