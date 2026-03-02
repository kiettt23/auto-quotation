export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getProducts } from "./actions";
import { ProductPageClient } from "@/components/product/product-page-client";

type Props = {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
    order?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const categoryId = params.category || undefined;
  const search = params.search || undefined;
  const sortBy = params.sort || "createdAt";
  const sortOrder = (params.order as "asc" | "desc") || "desc";

  const [result, categories, units] = await Promise.all([
    getProducts({ page, categoryId, search, sortBy, sortOrder }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.unit.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Sản phẩm</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Quản lý danh mục sản phẩm và dịch vụ
      </p>
      <div className="mt-6">
        <ProductPageClient
          products={result.products}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          categories={JSON.parse(JSON.stringify(categories))}
          units={JSON.parse(JSON.stringify(units))}
          currentCategoryId={categoryId}
          currentSearch={search}
          currentSort={sortBy}
          currentOrder={sortOrder}
        />
      </div>
    </div>
  );
}
