import { requireUserId } from "@/lib/auth/get-user-id";
import { requireSession } from "@/lib/auth/get-session";
import { getDocumentById } from "@/services/document.service";
import { listCompanies } from "@/services/company.service";
import { getDocumentTypeById } from "@/services/document-type.service";
import { notFound } from "next/navigation";
import { DocumentDetailClient } from "./document-detail-client";
import { QUOTATION_COLUMNS } from "@/lib/constants/default-column-presets";
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

  // Find company linked to this document
  const company = companies.find((c) => c.id === doc?.companyId) ?? companies[0] ?? null;

  if (!doc || !company) notFound();

  // Resolve columns and title from document type
  let columns: ColumnDef[] = QUOTATION_COLUMNS;
  let showTotal = true;
  let title = "BÁO GIÁ";
  let signatureLabels = ["Bên mua", "Bên bán"];
  let templateId: string | null = null;

  // Per-document column override
  const docData = doc.data as DocumentData;
  if (docData?.columns) {
    columns = docData.columns;
  } else if (doc.typeId) {
    const docType = await getDocumentTypeById(doc.typeId, userId);
    if (docType) {
      columns = docType.columns as ColumnDef[];
      showTotal = docType.showTotal;
      title = docType.label.toUpperCase();
      signatureLabels = (docType.signatureLabels as string[]) ?? signatureLabels;
      templateId = (docType as Record<string, unknown>).templateId as string | null;
    }
  }

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
      templateId={templateId}
    />
  );
}
