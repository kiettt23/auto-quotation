import { z } from "zod/v4";

export const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Nhập tên công ty"),
  address: z.string().min(1, "Nhập địa chỉ"),
  phone: z.string().min(1, "Nhập số điện thoại"),
  email: z.email("Email không hợp lệ").optional().or(z.literal("")),
  taxCode: z.string().optional(),
  website: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankOwner: z.string().optional(),
});

export const quoteTemplateSchema = z.object({
  primaryColor: z.string().min(1),
  greetingText: z.string().optional(),
  defaultTerms: z.string().optional(),
  showAmountInWords: z.boolean(),
  showBankInfo: z.boolean(),
  showSignatureBlocks: z.boolean(),
  showFooterNote: z.boolean(),
  footerNote: z.string().optional(),
});

export const defaultsSchema = z.object({
  quotePrefix: z.string().min(1, "Nhập tiền tố mã báo giá"),
  quoteNextNumber: z.number().int().min(1, "Số bắt đầu >= 1"),
  defaultVatPercent: z.number().min(0).max(100, "VAT 0-100%"),
  defaultValidityDays: z.number().int().min(1, "Tối thiểu 1 ngày"),
  defaultShipping: z.number().min(0, "Phí >= 0"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Nhập tên danh mục"),
});

export const unitSchema = z.object({
  name: z.string().min(1, "Nhập tên đơn vị"),
});

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;
export type QuoteTemplateFormData = z.infer<typeof quoteTemplateSchema>;
export type DefaultsFormData = z.infer<typeof defaultsSchema>;
