import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getQuoteForEdit } from "@/app/(dashboard)/bao-gia/actions";
import { QuoteBuilderPage } from "@/components/quote/quote-builder-page";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditQuotePage({ params }: Props) {
  const { id } = await params;
  const [quote, settings] = await Promise.all([
    getQuoteForEdit(id),
    db.settings.findFirst(),
  ]);

  if (!quote) notFound();

  return (
    <QuoteBuilderPage
      defaults={{
        vatPercent: settings?.defaultVatPercent ? Number(settings.defaultVatPercent) : 10,
        shippingFee: settings?.defaultShipping ? Number(settings.defaultShipping) : 0,
        terms: settings?.defaultTerms ?? "",
        validUntil: new Date(Date.now() + (settings?.defaultValidityDays ?? 30) * 86400000)
          .toISOString()
          .split("T")[0],
      }}
      existingQuote={quote}
    />
  );
}
