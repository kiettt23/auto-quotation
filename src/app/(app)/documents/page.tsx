import { requireUserId } from "@/lib/auth/get-user-id";
import { listDocuments } from "@/services/document.service";
import { listProducts } from "@/services/product.service";
import { listCustomers } from "@/services/customer.service";
import { listDocumentTypes } from "@/services/document-type.service";
import { listCompanies } from "@/services/company.service";
import { DocumentListClient } from "./document-list-client";

export default async function DocumentsPage() {
  const userId = await requireUserId();
  const [documents, products, customers, documentTypes, companies] =
    await Promise.all([
      listDocuments(userId),
      listProducts(userId),
      listCustomers(userId),
      listDocumentTypes(userId),
      listCompanies(userId),
    ]);

  return (
    <DocumentListClient
      documents={documents}
      products={products}
      customers={customers}
      documentTypes={documentTypes}
      companies={companies}
    />
  );
}
