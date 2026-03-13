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

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, quote.tenantId),
  });

  if (!tenant) notFound();

  return <ShareQuoteView quote={quote} tenant={tenant} />;
}
