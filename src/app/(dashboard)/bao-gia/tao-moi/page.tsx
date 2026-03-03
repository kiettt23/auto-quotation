import { db } from "@/lib/db";
import { QuoteBuilderPage } from "@/components/quote/quote-builder-page";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ customerId?: string }>;
};

export default async function CreateQuotePage({ searchParams }: Props) {
  const params = await searchParams;

  const [settings, customer] = await Promise.all([
    db.settings.findFirst(),
    params.customerId
      ? db.customer.findUnique({ where: { id: params.customerId } })
      : null,
  ]);

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (settings?.defaultValidityDays ?? 30));

  return (
    <QuoteBuilderPage
      defaults={{
        vatPercent: settings?.defaultVatPercent ? Number(settings.defaultVatPercent) : 10,
        shippingFee: settings?.defaultShipping ? Number(settings.defaultShipping) : 0,
        terms: settings?.defaultTerms ?? "",
        validUntil: validUntil.toISOString().split("T")[0],
      }}
      customer={customer ? JSON.parse(JSON.stringify(customer)) : null}
      company={settings ? {
        companyName: settings.companyName ?? "",
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        email: settings.email ?? "",
        logoUrl: settings.logoUrl ?? "",
        bankName: settings.bankName ?? "",
        bankAccount: settings.bankAccount ?? "",
        bankOwner: settings.bankOwner ?? "",
        showAmountInWords: settings.showAmountInWords ?? true,
        showBankInfo: settings.showBankInfo ?? false,
        showSignatureBlocks: settings.showSignatureBlocks ?? true,
        primaryColor: settings.primaryColor ?? "#0369A1",
      } : null}
    />
  );
}
