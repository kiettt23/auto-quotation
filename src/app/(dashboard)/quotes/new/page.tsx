import { getTenantContext } from "@/lib/tenant-context";
import { getTenantSettings } from "@/services/settings-service";
import { getCustomerById } from "@/services/customer-service";
import { QuoteBuilderPage } from "@/components/quote/quote-builder-page";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ customerId?: string }>;
};

export default async function CreateQuotePage({ searchParams }: Props) {
  const params = await searchParams;
  const ctx = await getTenantContext();
  const [tenant, customer] = await Promise.all([
    getTenantSettings(ctx.tenantId),
    params.customerId
      ? getCustomerById(ctx.tenantId, params.customerId)
      : null,
  ]);

  const days = tenant?.defaultValidityDays ?? 30;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  const validUntil = expires.toISOString().split("T")[0];

  return (
    <QuoteBuilderPage
      defaults={{
        vatPercent: Number(tenant?.defaultVatPercent ?? 10),
        shippingFee: Number(tenant?.defaultShipping ?? 0),
        terms: tenant?.defaultTerms ?? "",
        validUntil,
      }}
      customer={customer ?? null}
      company={tenant ?? null}
    />
  );
}
