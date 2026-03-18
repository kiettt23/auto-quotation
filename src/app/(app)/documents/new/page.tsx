import { requireCompanyId } from "@/lib/auth/get-company-id";
import { listProducts } from "@/services/product.service";
import { listCustomers } from "@/services/customer.service";
import { listDocumentTypes } from "@/services/document-type.service";
import { DocumentForm } from "@/components/documents/document-form";

export default async function NewDocumentPage() {
  const companyId = await requireCompanyId();
  const [products, customers, documentTypes] = await Promise.all([
    listProducts(companyId),
    listCustomers(companyId),
    listDocumentTypes(companyId),
  ]);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <h1 className="text-2xl font-bold text-slate-900">Tạo tài liệu mới</h1>
      <DocumentForm products={products} customers={customers} documentTypes={documentTypes} />
    </div>
  );
}
