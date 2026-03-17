import { requireCompanyId } from "@/lib/auth/get-company-id";
import { getDocumentById } from "@/services/document.service";
import { listProducts } from "@/services/product.service";
import { listCustomers } from "@/services/customer.service";
import { notFound } from "next/navigation";
import { DocumentForm } from "@/components/documents/document-form";
import { documentTypeConfig } from "@/lib/utils/document-helpers";
import type { DocumentType } from "@/db/schema/document";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = await requireCompanyId();

  const [doc, products, customers] = await Promise.all([
    getDocumentById(id, companyId),
    listProducts(companyId),
    listCustomers(companyId),
  ]);

  if (!doc) notFound();

  const typeLabel = documentTypeConfig[doc.type as DocumentType].label;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <h1 className="text-2xl font-bold text-slate-900">
        Chỉnh sửa {typeLabel} — {doc.documentNumber}
      </h1>
      <DocumentForm products={products} customers={customers} document={doc} />
    </div>
  );
}
