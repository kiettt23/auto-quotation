import { requireCompanyId } from "@/lib/auth/get-company-id";
import { listProducts } from "@/services/product.service";
import { ProductPageClient } from "./product-page-client";

export default async function ProductsPage() {
  const companyId = await requireCompanyId();
  const products = await listProducts(companyId);

  return <ProductPageClient products={products} />;
}
