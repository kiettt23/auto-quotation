import { db } from "@/db";
import { product, category, unit } from "@/db/schema";
import { eq, and, isNull, ilike, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";
import { escapeLike } from "@/lib/utils/escape-like";

export type ProductRow = typeof product.$inferSelect;

export type ProductWithRelations = ProductRow & {
  categoryName: string | null;
  unitName: string | null;
};

/** List active products for a company */
export async function listProducts(companyId: string, search?: string) {
  let query = db
    .select({
      id: product.id,
      companyId: product.companyId,
      name: product.name,
      categoryId: product.categoryId,
      unitId: product.unitId,
      unitPrice: product.unitPrice,
      specification: product.specification,
      description: product.description,
      deletedAt: product.deletedAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: category.name,
      unitName: unit.name,
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id))
    .leftJoin(unit, eq(product.unitId, unit.id))
    .where(
      and(
        eq(product.companyId, companyId),
        isNull(product.deletedAt),
        search ? ilike(product.name, `%${escapeLike(search)}%`) : undefined
      )
    )
    .orderBy(desc(product.createdAt))
    .$dynamic();

  return query;
}

/** Get single product by ID */
export async function getProductById(companyId: string, productId: string) {
  const rows = await db
    .select()
    .from(product)
    .where(
      and(
        eq(product.id, productId),
        eq(product.companyId, companyId),
        isNull(product.deletedAt)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Create a new product */
export async function createProduct(
  companyId: string,
  data: {
    name: string;
    categoryId?: string;
    unitId?: string;
    unitPrice: number;
    specification?: string;
    description?: string;
  }
) {
  const id = generateId();
  const [row] = await db
    .insert(product)
    .values({ id, companyId, ...data })
    .returning();

  return row;
}

/** Update a product */
export async function updateProduct(
  companyId: string,
  productId: string,
  data: {
    name?: string;
    categoryId?: string | null;
    unitId?: string | null;
    unitPrice?: number;
    specification?: string | null;
    description?: string | null;
  }
) {
  const [row] = await db
    .update(product)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(product.id, productId), eq(product.companyId, companyId)))
    .returning();

  return row;
}

/** Soft-delete a product */
export async function deleteProduct(companyId: string, productId: string) {
  const [row] = await db
    .update(product)
    .set({ deletedAt: new Date() })
    .where(and(eq(product.id, productId), eq(product.companyId, companyId)))
    .returning();

  return row;
}
