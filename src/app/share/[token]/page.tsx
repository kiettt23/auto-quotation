import { notFound } from "next/navigation";
import { getDocumentByShareToken } from "@/services/document-service";
import { ShareDocumentView } from "@/components/share/share-document-view";
import { getTenantSettings } from "@/services/settings-service";

type Props = {
  params: Promise<{ token: string }>;
};

// Public share page — no auth required
export default async function SharePage({ params }: Props) {
  const { token } = await params;

  const doc = await getDocumentByShareToken(token);
  if (!doc) notFound();

  const tenant = await getTenantSettings(doc.template.tenantId);
  if (!tenant) notFound();

  return <ShareDocumentView document={doc} tenant={tenant} />;
}
