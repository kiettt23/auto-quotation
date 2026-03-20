import { requireUserId } from "@/lib/auth/get-user-id";
import { listProducts } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { listUnits } from "@/services/unit.service";
import { ProductPageClient } from "./product-page-client";

export default async function ProductsPage() {
  const userId = await requireUserId();
  const [products, categories, units] = await Promise.all([
    listProducts(userId),
    listCategories(userId),
    listUnits(userId),
  ]);

  return (
    <ProductPageClient
      products={products}
      categories={categories}
      units={units}
    />
  );
}
