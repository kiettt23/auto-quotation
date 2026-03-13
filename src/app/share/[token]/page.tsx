import { notFound } from "next/navigation";
import { db } from "@/db";
import { quotes, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ShareQuoteView } from "@/components/share/share-quote-view";

type Props = {
  params: Promise<{ token: string }>;
};

// Public share page — no auth required
export default async function ShareQuotePage({ params }: Props) {
  const { token } = await params;

  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.shareToken, token),
    with: { items: true },
  });

  if (!quote) notFound();

  // Only select fields needed for the public share view — avoid leaking
  // internal settings (taxCode, bankAccount, quotePrefix, etc.)
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, quote.tenantId),
    columns: {
      companyName: true,
      name: true,
      logoUrl: true,
      primaryColor: true,
      phone: true,
    },
  });

  if (!tenant) notFound();

  return <ShareQuoteView quote={quote} tenant={tenant} />;
}
