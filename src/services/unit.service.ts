import { db } from "@/db";
import { unit } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";

export type UnitRow = typeof unit.$inferSelect;

/** List units for a user */
export async function listUnits(userId: string) {
  return db.select().from(unit).where(eq(unit.userId, userId));
}

/** Create a unit */
export async function createUnit(userId: string, name: string) {
  const [row] = await db
    .insert(unit)
    .values({ id: generateId(), userId, name })
    .returning();
  return row;
}

/** Delete a unit */
export async function deleteUnit(userId: string, unitId: string) {
  await db
    .delete(unit)
    .where(and(eq(unit.id, unitId), eq(unit.userId, userId)));
}
