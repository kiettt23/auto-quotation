import { requireSession } from "@/lib/auth/get-session";
import { getDocumentById } from "@/services/document.service";
import { listCompanies } from "@/services/company.service";
import { getTemplateEntry, legacyTypeToTemplateId } from "@/lib/pdf/template-registry";
import { notFound } from "next/navigation";
import { DocumentDetailClient } from "./document-detail-client";
import type { ColumnDef } from "@/lib/types/column-def";
import type { DocumentData } from "@/lib/types/document-data";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const userId = session.user.id;

  const [doc, companies] = await Promise.all([
    getDocumentById(id, userId),
    listCompanies(userId),
  ]);

  const company = companies.find((c) => c.id === doc?.companyId) ?? companies[0] ?? null;

  if (!doc || !company) notFound();

  // Resolve template — prefer doc.templateId, fallback to legacy type mapping
  const resolvedTemplateId = doc.templateId ?? legacyTypeToTemplateId(doc.type);
  const template = getTemplateEntry(resolvedTemplateId);

  // Per-document column override
  const docData = doc.data as DocumentData;
  const columns: ColumnDef[] = docData?.columns ?? template?.columns ?? [];
  const showTotal = template?.showTotal ?? true;
  const title = template?.name?.toUpperCase() ?? "BÁO GIÁ";
  const signatureLabels = template?.signatureLabels ?? ["Bên mua", "Bên bán"];

  return (
    <DocumentDetailClient
      document={doc}
      company={{
        name: company.name,
        address: company.address,
        phone: company.phone,
        taxCode: company.taxCode,
        logoUrl: company.logoUrl,
        headerLayout: company.headerLayout,
      }}
      columns={columns}
      showTotal={showTotal}
      title={title}
      signatureLabels={signatureLabels}
      templateId={resolvedTemplateId}
    />
  );
}
