import { notFound } from "next/navigation";
import { db } from "@/db";
import { quotes } from "@/db/schema/quotes";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ShareQuoteView } from "@/components/share/share-quote-view";
import { getDocumentByShareToken } from "@/services/document-service";
import { ShareDocumentView } from "@/components/share/share-document-view";
import { getTenantSettings } from "@/services/settings-service";

type Props = {
  params: Promise<{ token: string }>;
};

// Public share page — no auth required
// Supports both legacy quote shares and new document shares
export default async function SharePage({ params }: Props) {
  const { token } = await params;

  // 1. Try new document share first
  const doc = await getDocumentByShareToken(token);
  if (doc) {
    const tenant = await getTenantSettings(doc.template.tenantId);
    if (!tenant) notFound();
    return <ShareDocumentView document={doc} tenant={tenant} />;
  }

  // 2. Fallback to legacy quote share
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.shareToken, token),
    with: { items: true },
  });

  if (!quote) notFound();

  if (quote.shareTokenExpiresAt && quote.shareTokenExpiresAt < new Date()) {
    notFound();
  }

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
