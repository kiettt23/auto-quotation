import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePdfQuote } from "@/lib/generate-pdf-quote";

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

  try {
    const buffer = await generatePdfQuote(
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
      },
      {
        companyName: settings?.companyName ?? "",
        address: settings?.address ?? "",
        phone: settings?.phone ?? "",
        email: settings?.email ?? "",
        logoUrl: settings?.logoUrl ?? "",
        bankName: settings?.bankName ?? "",
        bankAccount: settings?.bankAccount ?? "",
        bankOwner: settings?.bankOwner ?? "",
        showAmountInWords: settings?.showAmountInWords ?? true,
        showBankInfo: settings?.showBankInfo ?? false,
        showSignatureBlocks: settings?.showSignatureBlocks ?? true,
        primaryColor: settings?.primaryColor ?? "#0369A1",
      }
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Lỗi xuất PDF", detail: message }, { status: 500 });
  }
}
