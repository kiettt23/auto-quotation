import { db } from "@/db";
import { unit } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";

export type UnitRow = typeof unit.$inferSelect;

/** List units for a company */
export async function listUnits(companyId: string) {
  return db.select().from(unit).where(eq(unit.companyId, companyId));
}

/** Create a unit */
export async function createUnit(companyId: string, name: string) {
  const [row] = await db
    .insert(unit)
    .values({ id: generateId(), companyId, name })
    .returning();
  return row;
}

/** Delete a unit */
export async function deleteUnit(companyId: string, unitId: string) {
  await db
    .delete(unit)
    .where(and(eq(unit.id, unitId), eq(unit.companyId, companyId)));
}
