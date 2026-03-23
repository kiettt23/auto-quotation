import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Tên công ty không được để trống"),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxCode: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  driverName: z.string().optional(),
  vehicleId: z.string().optional(),
  logoUrl: z.string().optional(),
  customData: z.record(z.string(), z.union([z.string(), z.coerce.number()])).nullable().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1, "Tên công ty không được để trống"),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxCode: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  headerLayout: z.enum(["left", "center"]).optional(),
  driverName: z.string().optional(),
  vehicleId: z.string().optional(),
  logoUrl: z.string().optional(),
  customData: z.record(z.string(), z.union([z.string(), z.coerce.number()])).nullable().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
