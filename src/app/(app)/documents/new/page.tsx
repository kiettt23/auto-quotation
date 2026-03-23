import { requireUserId } from "@/lib/auth/get-user-id";
import { listProducts } from "@/services/product.service";
import { listCustomers } from "@/services/customer.service";
import { listCompanies } from "@/services/company.service";
import { DocumentForm } from "@/components/documents/document-form";

export default async function NewDocumentPage() {
  const userId = await requireUserId();
  const [products, customers, companies] = await Promise.all([
    listProducts(userId),
    listCustomers(userId),
    listCompanies(userId),
  ]);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <h1 className="text-2xl font-bold text-slate-900">Tạo tài liệu mới</h1>
      <DocumentForm
        products={products}
        customers={customers}
        companies={companies}
      />
    </div>
  );
}
