/**
 * GET /api/export/excel/[quoteId]
 * Generates and streams an Excel file for the given quote.
 */

import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant-context";
import { getQuoteById } from "@/services/quote-service";
import { getTenantSettings } from "@/services/settings-service";
import { generateExcelQuote } from "@/lib/generate-excel-quote";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    const { tenantId } = await getTenantContext();

    const quote = await getQuoteById(tenantId, quoteId);
    if (!quote) {
      return NextResponse.json({ error: "Không tìm thấy báo giá" }, { status: 404 });
    }

    const tenant = await getTenantSettings(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: "Không tìm thấy cài đặt công ty" }, { status: 404 });
    }

    const excelBuffer = await generateExcelQuote(
      {
        quoteNumber: quote.quoteNumber,
        createdAt: quote.createdAt.toISOString(),
        customerName: quote.customerName,
        customerCompany: quote.customerCompany ?? "",
        customerPhone: quote.customerPhone ?? "",
        customerEmail: quote.customerEmail ?? "",
        customerAddress: quote.customerAddress ?? "",
        items: quote.items.map((item) => ({
          name: item.name,
          unit: item.unit ?? "",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discountPercent: Number(item.discountPercent),
        })),
        globalDiscountPercent: Number(quote.globalDiscountPercent),
        vatPercent: Number(quote.vatPercent),
        shippingFee: Number(quote.shippingFee),
        otherFees: Number(quote.otherFees),
        otherFeesLabel: quote.otherFeesLabel ?? "",
        terms: quote.terms ?? "",
        validUntil: quote.validUntil ? quote.validUntil.toISOString() : "",
        total: Number(quote.total),
      },
      {
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
      }
    );

    const buffer = Buffer.from(excelBuffer as ArrayBuffer);
    const mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${quote.quoteNumber}.xlsx"`,
      },
    });
  } catch (e) {
    console.error("[export/excel]", e);
    return NextResponse.json({ error: "Lỗi xuất Excel" }, { status: 500 });
  }
}
