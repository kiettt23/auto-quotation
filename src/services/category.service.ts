import { db } from "@/db";
import { category } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";

export type CategoryRow = typeof category.$inferSelect;

/** List categories for a company */
export async function listCategories(companyId: string) {
  return db.select().from(category).where(eq(category.companyId, companyId));
}

/** Create a category */
export async function createCategory(companyId: string, name: string) {
  const [row] = await db
    .insert(category)
    .values({ id: generateId(), companyId, name })
    .returning();
  return row;
}

/** Delete a category */
export async function deleteCategory(companyId: string, categoryId: string) {
  await db
    .delete(category)
    .where(and(eq(category.id, categoryId), eq(category.companyId, companyId)));
}
