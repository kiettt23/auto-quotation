import { db } from "@/db";
import { category } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";

export type CategoryRow = typeof category.$inferSelect;

/** List categories for a user */
export async function listCategories(userId: string) {
  return db.select().from(category).where(eq(category.userId, userId));
}

/** Create a category */
export async function createCategory(userId: string, name: string) {
  const [row] = await db
    .insert(category)
    .values({ id: generateId(), userId, name })
    .returning();
  return row;
}

/** Delete a category */
export async function deleteCategory(userId: string, categoryId: string) {
  await db
    .delete(category)
    .where(and(eq(category.id, categoryId), eq(category.userId, userId)));
}
