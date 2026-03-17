import { db } from "@/db";
import { company } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";

export type CompanyRow = typeof company.$inferSelect;
export type CompanyInsert = typeof company.$inferInsert;

/** Get company by owner (user) ID */
export async function getCompanyByOwnerId(ownerId: string) {
  const rows = await db
    .select()
    .from(company)
    .where(eq(company.ownerId, ownerId))
    .limit(1);

  return rows[0] ?? null;
}

/** Create a new company for a user */
export async function createCompany(
  ownerId: string,
  data: { name: string; address?: string; phone?: string; taxCode?: string }
) {
  const id = generateId();
  const [row] = await db
    .insert(company)
    .values({ id, ownerId, ...data })
    .returning();

  return row;
}

/** Update company info */
export async function updateCompany(
  companyId: string,
  data: Partial<Omit<CompanyInsert, "id" | "ownerId" | "createdAt">>
) {
  const [row] = await db
    .update(company)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(company.id, companyId))
    .returning();

  return row;
}
