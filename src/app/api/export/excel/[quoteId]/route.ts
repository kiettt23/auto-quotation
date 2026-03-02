import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateExcelQuote } from "@/lib/generate-excel-quote";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params;

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  if (!quote) {
    return NextResponse.json({ error: "Không tìm thấy báo giá" }, { status: 404 });
  }

  const settings = await db.settings.findFirst();

  const buffer = await generateExcelQuote(
    {
      quoteNumber: quote.quoteNumber,
      createdAt: quote.createdAt.toISOString(),
      customerName: quote.customerName,
      customerCompany: quote.customerCompany,
      customerPhone: quote.customerPhone,
      customerEmail: quote.customerEmail,
      customerAddress: quote.customerAddress,
      items: quote.items.map((i) => ({
        name: i.name,
        unit: i.unit,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discountPercent: Number(i.discountPercent),
      })),
      globalDiscountPercent: Number(quote.globalDiscountPercent),
      vatPercent: Number(quote.vatPercent),
      shippingFee: Number(quote.shippingFee),
      otherFees: Number(quote.otherFees),
      otherFeesLabel: quote.otherFeesLabel,
      terms: quote.terms,
      validUntil: quote.validUntil?.toISOString() ?? "",
      total: Number(quote.total),
    },
    {
      companyName: settings?.companyName ?? "",
      address: settings?.address ?? "",
      phone: settings?.phone ?? "",
      email: settings?.email ?? "",
      bankName: settings?.bankName ?? "",
      bankAccount: settings?.bankAccount ?? "",
      bankOwner: settings?.bankOwner ?? "",
      showAmountInWords: settings?.showAmountInWords ?? true,
      showBankInfo: settings?.showBankInfo ?? true,
      primaryColor: settings?.primaryColor ?? "#0369A1",
    }
  );

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${quote.quoteNumber}.xlsx"`,
    },
  });
}
