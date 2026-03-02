import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { QuotePreview, type QuotePreviewData, type CompanyInfo } from "@/components/quote/quote-preview";
import { QuotePublicActions } from "@/components/quote/quote-public-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ShareQuotePage({ params }: Props) {
  const { token } = await params;

  const quote = await db.quote.findFirst({
    where: { shareToken: token },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  if (!quote) notFound();

  const settings = await db.settings.findFirst();

  const data: QuotePreviewData = {
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
  };

  const company: CompanyInfo = {
    companyName: settings?.companyName ?? "",
    address: settings?.address ?? "",
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
    logoUrl: settings?.logoUrl ?? "",
    bankName: settings?.bankName ?? "",
    bankAccount: settings?.bankAccount ?? "",
    bankOwner: settings?.bankOwner ?? "",
    showAmountInWords: settings?.showAmountInWords ?? true,
    showBankInfo: settings?.showBankInfo ?? true,
    showSignatureBlocks: settings?.showSignatureBlocks ?? true,
    primaryColor: settings?.primaryColor ?? "#0369A1",
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-3xl px-4 space-y-4">
        <QuotePreview data={data} company={company} />
        <QuotePublicActions quoteId={quote.id} />
        <p className="text-center text-xs text-gray-500">
          Báo giá bởi {company.companyName} | Hiệu lực đến{" "}
          {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("vi-VN") : "—"}
        </p>
      </div>
    </div>
  );
}
