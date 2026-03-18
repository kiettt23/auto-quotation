import { requireCompanyId } from "@/lib/auth/get-company-id";
import { getDocumentById } from "@/services/document.service";
import { listProducts } from "@/services/product.service";
import { listCustomers } from "@/services/customer.service";
import { listDocumentTypes, getDocumentTypeById } from "@/services/document-type.service";
import { notFound } from "next/navigation";
import { DocumentForm } from "@/components/documents/document-form";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = await requireCompanyId();

  const [doc, products, customers, documentTypes] = await Promise.all([
    getDocumentById(id, companyId),
    listProducts(companyId),
    listCustomers(companyId),
    listDocumentTypes(companyId),
  ]);

  if (!doc) notFound();

  // Resolve type label from document_type table or fallback
  let typeLabel = doc.documentNumber;
  if (doc.typeId) {
    const docType = await getDocumentTypeById(doc.typeId, companyId);
    if (docType) typeLabel = `${docType.label} — ${doc.documentNumber}`;
  }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <h1 className="text-2xl font-bold text-slate-900">
        Chỉnh sửa {typeLabel}
      </h1>
      <DocumentForm
        products={products}
        customers={customers}
        documentTypes={documentTypes}
        document={doc}
      />
    </div>
  );
}
