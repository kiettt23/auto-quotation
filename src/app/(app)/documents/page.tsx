import { requireCompanyId } from "@/lib/auth/get-company-id";
import { listDocuments } from "@/services/document.service";
import { DocumentListClient } from "./document-list-client";

export default async function DocumentsPage() {
  const companyId = await requireCompanyId();
  const documents = await listDocuments(companyId);

  return <DocumentListClient documents={documents} />;
}
