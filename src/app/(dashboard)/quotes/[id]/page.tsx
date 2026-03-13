import { notFound } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { getTenantSettings } from "@/services/settings-service";
import { getQuoteById } from "@/services/quote-service";
import { QuoteBuilderPage } from "@/components/quote/quote-builder-page";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditQuotePage({ params }: Props) {
  const { id } = await params;
  const ctx = await getTenantContext();

  const [quote, tenant] = await Promise.all([
    getQuoteById(ctx.tenantId, id),
    getTenantSettings(ctx.tenantId),
  ]);

  if (!quote) notFound();

  const validUntil = new Date(
    Date.now() + (tenant?.defaultValidityDays ?? 30) * 86400000
  ).toISOString().split("T")[0];

  return (
    <QuoteBuilderPage
      defaults={{
        vatPercent: Number(tenant?.defaultVatPercent ?? 10),
        shippingFee: Number(tenant?.defaultShipping ?? 0),
        terms: tenant?.defaultTerms ?? "",
        validUntil,
      }}
      existingQuote={quote}
      company={tenant ?? null}
    />
  );
}
