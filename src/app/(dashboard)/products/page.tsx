export const dynamic = "force-dynamic";

import { getTenantContext } from "@/lib/tenant-context";
import { db } from "@/db";
import { categories, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { getProducts } from "@/services/product-service";
import { ProductPageClient } from "@/components/product/product-page-client";

type Props = {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const categoryId = params.category || undefined;
  const search = params.search || undefined;

  const { tenantId } = await getTenantContext();

  const [result, allCategories, allUnits] = await Promise.all([
    getProducts(tenantId, { page, categoryId, search }),
    db
      .select()
      .from(categories)
      .where(eq(categories.tenantId, tenantId))
      .orderBy(asc(categories.sortOrder)),
    db
      .select()
      .from(units)
      .where(eq(units.tenantId, tenantId))
      .orderBy(asc(units.name)),
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
          categories={allCategories}
          units={allUnits}
          currentCategoryId={categoryId}
          currentSearch={search}
        />
      </div>
    </div>
  );
}
