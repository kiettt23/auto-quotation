/**
 * Settings service — plain async functions (no "use server").
 * All operations are scoped to a tenant.
 */

import { db } from "@/db";
import { tenants, categories, units } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import type { Tenant, Category, Unit } from "@/db/schema";

// ─── Types ───────────────────────────────────────────────

export type CompanyInfoData = {
  companyName: string;
  address?: string;
  phone?: string;
  email?: string;
  taxCode?: string;
  website?: string;
};

export type BankingData = {
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
};

export type QuoteTemplateData = {
  primaryColor?: string;
  greetingText?: string;
  defaultTerms?: string;
  showAmountInWords?: boolean;
  showBankInfo?: boolean;
  showSignatureBlocks?: boolean;
  showFooterNote?: boolean;
  footerNote?: string;
};

export type DefaultsData = {
  defaultVatPercent?: number;
};

// ─── Tenant / Settings ───────────────────────────────────

export async function getTenantSettings(tenantId: string): Promise<Tenant | undefined> {
  return db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });
}

export async function updateCompanyInfo(tenantId: string, data: CompanyInfoData) {
  await db
    .update(tenants)
    .set({
      companyName: data.companyName,
      address: data.address ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      taxCode: data.taxCode ?? "",
      website: data.website ?? "",
    })
    .where(eq(tenants.id, tenantId));
}

export async function updateBanking(tenantId: string, data: BankingData) {
  await db
    .update(tenants)
    .set({
      bankName: data.bankName ?? "",
      bankAccount: data.bankAccount ?? "",
      bankOwner: data.bankOwner ?? "",
    })
    .where(eq(tenants.id, tenantId));
}

export async function updateBranding(tenantId: string, data: { logoUrl?: string; primaryColor?: string }) {
  await db
    .update(tenants)
    .set({
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
    })
    .where(eq(tenants.id, tenantId));
}

export async function updateQuoteTemplate(tenantId: string, data: QuoteTemplateData) {
  await db
    .update(tenants)
    .set({
      ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
      greetingText: data.greetingText ?? "",
      defaultTerms: data.defaultTerms ?? "",
      showAmountInWords: data.showAmountInWords ?? true,
      showBankInfo: data.showBankInfo ?? true,
      showSignatureBlocks: data.showSignatureBlocks ?? true,
      showFooterNote: data.showFooterNote ?? false,
      footerNote: data.footerNote ?? "",
    })
    .where(eq(tenants.id, tenantId));
}

export async function updateDefaults(tenantId: string, data: DefaultsData) {
  await db
    .update(tenants)
    .set({
      ...(data.defaultVatPercent !== undefined && { defaultVatPercent: String(data.defaultVatPercent) }),
    })
    .where(eq(tenants.id, tenantId));
}

// ─── Categories ──────────────────────────────────────────

export async function getCategories(tenantId: string): Promise<Category[]> {
  return db.query.categories.findMany({
    where: eq(categories.tenantId, tenantId),
    orderBy: [asc(categories.sortOrder), asc(categories.createdAt)],
  });
}

export async function saveCategory(
  tenantId: string,
  data: { name: string; sortOrder?: number },
  id?: string
): Promise<Category> {
  if (id) {
    const [updated] = await db
      .update(categories)
      .set({ name: data.name, sortOrder: data.sortOrder ?? 0 })
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(categories)
    .values({ id: createId(), tenantId, name: data.name, sortOrder: data.sortOrder ?? 0 })
    .returning();
  return created;
}

export async function deleteCategory(tenantId: string, id: string) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));
}

// ─── Units ───────────────────────────────────────────────

export async function getUnits(tenantId: string): Promise<Unit[]> {
  return db.query.units.findMany({
    where: eq(units.tenantId, tenantId),
    orderBy: [asc(units.name)],
  });
}

export async function saveUnit(
  tenantId: string,
  data: { name: string },
  id?: string
): Promise<Unit> {
  if (id) {
    const [updated] = await db
      .update(units)
      .set({ name: data.name })
      .where(and(eq(units.id, id), eq(units.tenantId, tenantId)))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(units)
    .values({ id: createId(), tenantId, name: data.name })
    .returning();
  return created;
}

export async function deleteUnit(tenantId: string, id: string) {
  await db
    .delete(units)
    .where(and(eq(units.id, id), eq(units.tenantId, tenantId)));
}
