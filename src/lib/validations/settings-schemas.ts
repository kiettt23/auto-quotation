import { z } from "zod/v4";

// Non-optional fields — defaults handled at form level to avoid resolver type conflicts
export const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Tên công ty không được để trống"),
  address: z.string(),
  phone: z.string().refine(
    (v) => !v || /^(0|\+84)\d{9,10}$/.test(v.replace(/[\s.-]/g, "")),
    "Số điện thoại không hợp lệ (VD: 0912345678)"
  ),
  email: z.string(),
  taxCode: z.string().refine(
    (v) => !v || /^\d{10}(-\d{3})?$/.test(v),
    "Mã số thuế phải là 10 hoặc 13 chữ số (VD: 0123456789 hoặc 0123456789-001)"
  ),
  website: z.string(),
});

export const bankingSchema = z.object({
  bankName: z.string(),
  bankAccount: z.string(),
  bankOwner: z.string(),
});

export const quoteTemplateSchema = z.object({
  primaryColor: z.string(),
  greetingText: z.string(),
  defaultTerms: z.string(),
  showAmountInWords: z.boolean(),
  showBankInfo: z.boolean(),
  showSignatureBlocks: z.boolean(),
  showFooterNote: z.boolean(),
  footerNote: z.string(),
});

export const defaultsSchema = z.object({
  defaultVatPercent: z.number().min(0).max(100, "VAT 0-100%"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Nhập tên danh mục"),
  sortOrder: z.number().int(),
});

export const unitSchema = z.object({
  name: z.string().min(1, "Nhập tên đơn vị"),
});

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;
export type BankingFormData = z.infer<typeof bankingSchema>;
export type QuoteTemplateFormData = z.infer<typeof quoteTemplateSchema>;
export type DefaultsFormData = z.infer<typeof defaultsSchema>;
