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

/** List active products for a user */
export async function listProducts(userId: string, search?: string) {
  let query = db
    .select({
      id: product.id,
      userId: product.userId,
      name: product.name,
      categoryId: product.categoryId,
      unitId: product.unitId,
      unitPrice: product.unitPrice,
      specification: product.specification,
      description: product.description,
      customData: product.customData,
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
        eq(product.userId, userId),
        isNull(product.deletedAt),
        search ? ilike(product.name, `%${escapeLike(search)}%`) : undefined
      )
    )
    .orderBy(desc(product.createdAt))
    .$dynamic();

  return query;
}

/** Get single product by ID */
export async function getProductById(userId: string, productId: string) {
  const rows = await db
    .select()
    .from(product)
    .where(
      and(
        eq(product.id, productId),
        eq(product.userId, userId),
        isNull(product.deletedAt)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Create a new product */
export async function createProduct(
  userId: string,
  data: {
    name: string;
    categoryId?: string;
    unitId?: string;
    unitPrice: number;
    specification?: string;
    description?: string;
    customData?: Record<string, string | number> | null;
  }
) {
  const id = generateId();
  const [row] = await db
    .insert(product)
    .values({ id, userId, ...data })
    .returning();

  return row;
}

/** Update a product */
export async function updateProduct(
  userId: string,
  productId: string,
  data: {
    name?: string;
    categoryId?: string | null;
    unitId?: string | null;
    unitPrice?: number;
    specification?: string | null;
    description?: string | null;
    customData?: Record<string, string | number> | null;
  }
) {
  const [row] = await db
    .update(product)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(product.id, productId), eq(product.userId, userId)))
    .returning();

  return row;
}

/** Soft-delete a product */
export async function deleteProduct(userId: string, productId: string) {
  const [row] = await db
    .update(product)
    .set({ deletedAt: new Date() })
    .where(and(eq(product.id, productId), eq(product.userId, userId)))
    .returning();

  return row;
}
