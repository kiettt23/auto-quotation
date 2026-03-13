/**
 * Built-in renderer for Quote PDF.
 * Wraps generatePdfQuote with the data shape expected by the template engine.
 */

import { generatePdfQuote } from "@/lib/generate-pdf-quote";
import type { RenderResult } from "./types";
import type { Tenant } from "@/db/schema";

// fieldData keys expected for the built-in quote PDF template
export type QuotePdfFieldData = {
  quoteNumber?: string;
  createdAt?: string;
  customerName?: string;
  customerCompany?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  globalDiscountPercent?: string;
  vatPercent?: string;
  shippingFee?: string;
  otherFees?: string;
  otherFeesLabel?: string;
  terms?: string;
  validUntil?: string;
};

export type QuoteItemRow = {
  name?: string;
  unit?: string;
  quantity?: string;
  unitPrice?: string;
  discountPercent?: string;
};

export async function renderQuotePdf(
  fieldData: Record<string, string>,
  tableRows: Record<string, string>[],
  tenant: Tenant,
  docNumber: string
): Promise<RenderResult> {
  const items = tableRows.map((row) => ({
    name: row.name ?? "",
    unit: row.unit ?? "",
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unitPrice ?? 0),
    discountPercent: Number(row.discountPercent ?? 0),
  }));

  const quoteData = {
    quoteNumber: fieldData.quoteNumber ?? docNumber,
    createdAt: fieldData.createdAt ?? new Date().toISOString(),
    customerName: fieldData.customerName ?? "",
    customerCompany: fieldData.customerCompany ?? "",
    customerPhone: fieldData.customerPhone ?? "",
    customerEmail: fieldData.customerEmail ?? "",
    customerAddress: fieldData.customerAddress ?? "",
    items,
    globalDiscountPercent: Number(fieldData.globalDiscountPercent ?? 0),
    vatPercent: Number(fieldData.vatPercent ?? 0),
    shippingFee: Number(fieldData.shippingFee ?? 0),
    otherFees: Number(fieldData.otherFees ?? 0),
    otherFeesLabel: fieldData.otherFeesLabel ?? "Phí khác",
    terms: fieldData.terms ?? "",
    validUntil: fieldData.validUntil ?? "",
  };

  const companyData = {
    companyName: tenant.companyName,
    address: tenant.address,
    phone: tenant.phone,
    email: tenant.email,
    logoUrl: tenant.logoUrl,
    bankName: tenant.bankName,
    bankAccount: tenant.bankAccount,
    bankOwner: tenant.bankOwner,
    showAmountInWords: tenant.showAmountInWords,
    showBankInfo: tenant.showBankInfo,
    showSignatureBlocks: tenant.showSignatureBlocks,
    primaryColor: tenant.primaryColor,
  };

  const buffer = await generatePdfQuote(quoteData, companyData);

  return {
    buffer,
    contentType: "application/pdf",
    fileName: `${docNumber}.pdf`,
  };
}
