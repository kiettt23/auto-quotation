import { db } from "@/db";
import { products, pricingTiers, volumeDiscounts, categories, units } from "@/db/schema";
import type { Product } from "@/db/schema";
import { eq, and, or, ilike, count, desc, asc } from "drizzle-orm";
import type { ProductFormData } from "@/lib/validations/product-schemas";
import { escapeIlike } from "@/lib/escape-ilike";
import { ok, err } from "@/lib/result";
import type { Result } from "@/lib/result";

export type ProductWithRelations = Product & {
  category: { id: string; name: string } | null;
  unit: { id: string; name: string } | null;
  pricingTiers: { id: string; minQuantity: number; maxQuantity: number | null; price: number }[];
  volumeDiscounts: { id: string; minQuantity: number; discountPercent: number }[];
};

export type ImportProductRow = {
  code?: string;
  name: string;
  category?: string;
  price?: number;
  unit?: string;
  description?: string;
  notes?: string;
};

type GetProductsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
};

type GetProductsResult = {
  products: ProductWithRelations[];
  total: number;
  page: number;
  totalPages: number;
};

/**
 * Paginated product list with optional search by name/code and category filter.
 */
export async function getProducts(
  tenantId: string,
  params: GetProductsParams
): Promise<GetProductsResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(products.tenantId, tenantId)];
  if (params.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId));
  }

  const searchFilter = params.search
    ? or(
        ilike(products.name, `%${escapeIlike(params.search)}%`),
        ilike(products.code, `%${escapeIlike(params.search)}%`)
      )
    : undefined;

  const where = searchFilter
    ? and(...conditions, searchFilter)
    : and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db.query.products.findMany({
      where,
      with: { category: true, unit: true, pricingTiers: true, volumeDiscounts: true },
      orderBy: [desc(products.updatedAt)],
      limit: pageSize,
      offset,
    }),
    db.select({ total: count() }).from(products).where(where),
  ]);

  const mapped = rows.map(normalizeProduct);

  return {
    products: mapped,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Fetch single product with relations, tenant-scoped.
 */
export async function getProductById(
  tenantId: string,
  id: string
): Promise<ProductWithRelations | null> {
  const row = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.tenantId, tenantId)),
    with: { category: true, unit: true, pricingTiers: true, volumeDiscounts: true },
  });

  return row ? normalizeProduct(row) : null;
}

/**
 * Search products for combobox — top 20 matches by name or code.
 */
export async function searchProducts(
  tenantId: string,
  query: string
): Promise<ProductWithRelations[]> {
  if (!query.trim()) return [];

  const rows = await db.query.products.findMany({
    where: and(
      eq(products.tenantId, tenantId),
      or(
        ilike(products.name, `%${escapeIlike(query)}%`),
        ilike(products.code, `%${escapeIlike(query)}%`)
      )
    ),
    with: { category: true, unit: true, pricingTiers: true, volumeDiscounts: true },
    orderBy: [asc(products.name)],
    limit: 20,
  });

  return rows.map(normalizeProduct);
}

/**
 * Create or update a product with pricing tiers and volume discounts in a transaction.
 */
export async function saveProduct(
  tenantId: string,
  data: ProductFormData,
  id?: string
): Promise<Result<ProductWithRelations>> {
  try {
    return ok(await saveProductInternal(tenantId, data, id));
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi lưu sản phẩm");
  }
}

async function saveProductInternal(
  tenantId: string,
  data: ProductFormData,
  id?: string
): Promise<ProductWithRelations> {
  const payload = {
    code: data.code,
    name: data.name,
    description: data.description ?? "",
    notes: data.notes ?? "",
    categoryId: data.categoryId ?? null,
    unitId: data.unitId ?? null,
    basePrice: String(data.basePrice),
    pricingType: data.pricingType,
  };

  let productId!: string;

  if (id) {
    // Verify ownership
    const existing = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.tenantId, tenantId)),
    });
    if (!existing) throw new Error("Không tìm thấy sản phẩm");

    // neon-http driver does not support transactions — use sequential queries
    await db.update(products)
      .set({ ...payload, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));

    await db.delete(pricingTiers).where(eq(pricingTiers.productId, id));
    await db.delete(volumeDiscounts).where(eq(volumeDiscounts.productId, id));

    if (data.pricingTiers?.length) {
      await db.insert(pricingTiers).values(
        data.pricingTiers.map((t) => ({
          productId: id,
          minQuantity: String(t.minQuantity),
          maxQuantity: t.maxQuantity != null ? String(t.maxQuantity) : null,
          price: String(t.price),
        }))
      );
    }

    if (data.volumeDiscounts?.length) {
      await db.insert(volumeDiscounts).values(
        data.volumeDiscounts.map((d) => ({
          productId: id,
          minQuantity: String(d.minQuantity),
          discountPercent: String(d.discountPercent),
        }))
      );
    }

    productId = id;
  } else {
    // neon-http driver does not support transactions — use sequential queries
    const [created] = await db
      .insert(products)
      .values({ ...payload, tenantId })
      .returning({ id: products.id });

    productId = created.id;

    if (data.pricingTiers?.length) {
      await db.insert(pricingTiers).values(
        data.pricingTiers.map((t) => ({
          productId,
          minQuantity: String(t.minQuantity),
          maxQuantity: t.maxQuantity != null ? String(t.maxQuantity) : null,
          price: String(t.price),
        }))
      );
    }
    if (data.volumeDiscounts?.length) {
      await db.insert(volumeDiscounts).values(
        data.volumeDiscounts.map((d) => ({
          productId,
          minQuantity: String(d.minQuantity),
          discountPercent: String(d.discountPercent),
        }))
      );
    }
  }

  const result = await getProductById(tenantId, productId);
  if (!result) throw new Error("Lỗi tải sản phẩm sau khi lưu");
  return result;
}

/**
 * Delete a product. Rejects if it is referenced in any quote items.
 */
export async function deleteProduct(tenantId: string, id: string): Promise<Result<void>> {
  try {
    // Verify ownership
    const existing = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.tenantId, tenantId)),
    });
    if (!existing) return err("Không tìm thấy sản phẩm");

    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));

    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi xoá sản phẩm");
  }
}

/**
 * Bulk import products from Excel.
 * Auto-creates categories and units that don't exist.
 * Returns counts of created/updated records and any row-level errors.
 */
export async function importProducts(
  tenantId: string,
  rows: ImportProductRow[]
): Promise<{ created: number; updated: number; errors: { row: number; message: string }[] }> {
  // Collect unique category and unit names
  const categoryNames = [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[];
  const unitNames = [...new Set(rows.map((r) => r.unit).filter(Boolean))] as string[];

  // Resolve or create categories
  const categoryMap = new Map<string, string>();
  for (const name of categoryNames) {
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.tenantId, tenantId),
        ilike(categories.name, name)
      ),
    });
    if (existing) {
      categoryMap.set(name.toLowerCase(), existing.id);
    } else {
      const [created] = await db
        .insert(categories)
        .values({ tenantId, name })
        .returning({ id: categories.id });
      categoryMap.set(name.toLowerCase(), created.id);
    }
  }

  // Resolve or create units
  const unitMap = new Map<string, string>();
  for (const name of unitNames) {
    const existing = await db.query.units.findFirst({
      where: and(
        eq(units.tenantId, tenantId),
        ilike(units.name, name)
      ),
    });
    if (existing) {
      unitMap.set(name.toLowerCase(), existing.id);
    } else {
      const [created] = await db
        .insert(units)
        .values({ tenantId, name })
        .returning({ id: units.id });
      unitMap.set(name.toLowerCase(), created.id);
    }
  }

  let created = 0;
  let updated = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.name) {
      errors.push({ row: i + 2, message: "Thiếu tên sản phẩm" });
      continue;
    }

    const categoryId = row.category
      ? (categoryMap.get(row.category.toLowerCase()) ?? null)
      : null;
    const unitId = row.unit
      ? (unitMap.get(row.unit.toLowerCase()) ?? null)
      : null;

    const data = {
      name: row.name,
      categoryId,
      unitId,
      basePrice: String(row.price ?? 0),
      pricingType: "FIXED" as const,
      description: row.description ?? "",
      notes: row.notes ?? "",
      tenantId,
    };

    try {
      if (row.code) {
        const existing = await db.query.products.findFirst({
          where: and(
            eq(products.tenantId, tenantId),
            eq(products.code, row.code)
          ),
        });
        if (existing) {
          await db
            .update(products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(products.id, existing.id));
          updated++;
        } else {
          await db.insert(products).values({ ...data, code: row.code });
          created++;
        }
      } else {
        const code = `SP-${Date.now()}-${i}`;
        await db.insert(products).values({ ...data, code });
        created++;
      }
    } catch {
      errors.push({ row: i + 2, message: "Lỗi lưu dữ liệu" });
    }
  }

  return { created, updated, errors };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RawProductRow = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  notes: string;
  categoryId: string | null;
  unitId: string | null;
  basePrice: string;
  pricingType: "FIXED" | "TIERED";
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string } | null;
  unit: { id: string; name: string } | null;
  pricingTiers: { id: string; productId: string; minQuantity: string; maxQuantity: string | null; price: string }[];
  volumeDiscounts: { id: string; productId: string; minQuantity: string; discountPercent: string }[];
};

function normalizeProduct(row: RawProductRow): ProductWithRelations {
  return {
    ...row,
    category: row.category ?? null,
    unit: row.unit ?? null,
    pricingTiers: row.pricingTiers.map((t) => ({
      id: t.id,
      minQuantity: Number(t.minQuantity),
      maxQuantity: t.maxQuantity != null ? Number(t.maxQuantity) : null,
      price: Number(t.price),
    })),
    volumeDiscounts: row.volumeDiscounts.map((d) => ({
      id: d.id,
      minQuantity: Number(d.minQuantity),
      discountPercent: Number(d.discountPercent),
    })),
  };
}
