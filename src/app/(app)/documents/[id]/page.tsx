import { requireCompanyId } from "@/lib/auth/get-company-id";
import { requireSession } from "@/lib/auth/get-session";
import { getDocumentById } from "@/services/document.service";
import { getCompanyByOwnerId } from "@/services/company.service";
import { notFound } from "next/navigation";
import { DocumentDetailClient } from "./document-detail-client";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = await requireCompanyId();
  const session = await requireSession();

  const [doc, company] = await Promise.all([
    getDocumentById(id, companyId),
    getCompanyByOwnerId(session.user.id),
  ]);

  if (!doc || !company) notFound();

  return (
    <DocumentDetailClient
      document={doc}
      company={{ name: company.name, address: company.address, phone: company.phone }}
    />
  );
}
