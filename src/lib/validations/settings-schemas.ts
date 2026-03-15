import { z } from "zod/v4";

// Non-optional fields — defaults handled at form level to avoid resolver type conflicts
export const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Tên công ty không được để trống"),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  taxCode: z.string(),
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
