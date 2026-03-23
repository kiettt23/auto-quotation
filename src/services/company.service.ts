import { db } from "@/db";
import { company } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";

export type CompanyRow = typeof company.$inferSelect;
export type CompanyInsert = typeof company.$inferInsert;

/** List all active companies for a user */
export async function listCompanies(userId: string) {
  return db
    .select()
    .from(company)
    .where(and(eq(company.userId, userId), isNull(company.deletedAt)));
}

/** Get a single company by ID with ownership check */
export async function getCompanyById(companyId: string, userId: string) {
  const rows = await db
    .select()
    .from(company)
    .where(
      and(
        eq(company.id, companyId),
        eq(company.userId, userId),
        isNull(company.deletedAt)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Duplicate a company */
export async function duplicateCompany(userId: string, companyId: string) {
  const original = await getCompanyById(companyId, userId);
  if (!original) return null;

  return createCompany(userId, {
    name: `${original.name} (bản sao)`,
    address: original.address ?? undefined,
    phone: original.phone ?? undefined,
    taxCode: original.taxCode ?? undefined,
    email: original.email ?? undefined,
    bankName: original.bankName ?? undefined,
    bankAccount: original.bankAccount ?? undefined,
    driverName: original.driverName ?? undefined,
    vehicleId: original.vehicleId ?? undefined,
    logoUrl: original.logoUrl ?? undefined,
  });
}

/** Create a new company for a user */
export async function createCompany(
  userId: string,
  data: {
    name: string;
    address?: string;
    phone?: string;
    taxCode?: string;
    email?: string;
    bankName?: string;
    bankAccount?: string;
    driverName?: string;
    vehicleId?: string;
    logoUrl?: string;
  }
) {
  const id = generateId();
  const [row] = await db
    .insert(company)
    .values({ id, userId, ...data })
    .returning();

  return row;
}

/** Update company info with ownership check */
export async function updateCompany(
  companyId: string,
  userId: string,
  data: Partial<Omit<CompanyInsert, "id" | "userId" | "createdAt">>
) {
  const [row] = await db
    .update(company)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(company.id, companyId), eq(company.userId, userId)))
    .returning();

  return row;
}

/** Soft-delete a company with ownership check */
export async function deleteCompany(companyId: string, userId: string) {
  const [row] = await db
    .update(company)
    .set({ deletedAt: new Date() })
    .where(and(eq(company.id, companyId), eq(company.userId, userId)))
    .returning();

  return row;
}
