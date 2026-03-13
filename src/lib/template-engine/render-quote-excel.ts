/**
 * Built-in renderer for Quote Excel.
 * Wraps generateExcelQuote with the data shape expected by the template engine.
 */

import { generateExcelQuote } from "@/lib/generate-excel-quote";
import type { RenderResult } from "./types";
import type { Tenant } from "@/db/schema";

export async function renderQuoteExcel(
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
    total: 0, // recalculated inside generateExcelQuote
  };

  const companyData = {
    companyName: tenant.companyName,
    address: tenant.address,
    phone: tenant.phone,
    email: tenant.email,
    bankName: tenant.bankName,
    bankAccount: tenant.bankAccount,
    bankOwner: tenant.bankOwner,
    showAmountInWords: tenant.showAmountInWords,
    showBankInfo: tenant.showBankInfo,
    primaryColor: tenant.primaryColor,
  };

  const excelBuffer = await generateExcelQuote(quoteData, companyData);

  return {
    buffer: Buffer.from(excelBuffer as ArrayBuffer),
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileName: `${docNumber}.xlsx`,
  };
}
