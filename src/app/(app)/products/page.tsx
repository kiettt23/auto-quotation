import { requireCompanyId } from "@/lib/auth/get-company-id";
import { listProducts } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { listUnits } from "@/services/unit.service";
import { ProductPageClient } from "./product-page-client";

export default async function ProductsPage() {
  const companyId = await requireCompanyId();
  const [products, categories, units] = await Promise.all([
    listProducts(companyId),
    listCategories(companyId),
    listUnits(companyId),
  ]);

  return (
    <ProductPageClient
      products={products}
      categories={categories}
      units={units}
    />
  );
}
