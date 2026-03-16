/**
 * Dashboard service — aggregated stats for a tenant's dashboard.
 * Plain async functions, no "use server".
 */

import { db } from "@/db";
import { customers, products, documents, documentTemplates } from "@/db/schema";
import { eq, sql, desc, and, isNull } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────

export type DashboardStats = {
  totalDocuments: number;
  totalTemplates: number;
  totalCustomers: number;
  totalProducts: number;
};

// ─── Service functions ────────────────────────────────────

export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  const [customerCount, productCount, templateCount, documentCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), isNull(customers.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(eq(products.tenantId, tenantId), isNull(products.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documentTemplates)
      .where(and(eq(documentTemplates.tenantId, tenantId), isNull(documentTemplates.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(and(eq(documents.tenantId, tenantId), isNull(documents.deletedAt))),
  ]);

  return {
    totalDocuments: documentCount[0]?.count ?? 0,
    totalTemplates: templateCount[0]?.count ?? 0,
    totalCustomers: customerCount[0]?.count ?? 0,
    totalProducts: productCount[0]?.count ?? 0,
  };
}

export type RecentDocument = {
  id: string;
  docNumber: string;
  templateName: string;
  createdAt: Date;
};

/** Get last N documents for a tenant */
export async function getRecentDocuments(tenantId: string, limit = 5): Promise<RecentDocument[]> {
  const rows = await db
    .select({
      id: documents.id,
      docNumber: documents.docNumber,
      templateName: documentTemplates.name,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .innerJoin(documentTemplates, eq(documents.templateId, documentTemplates.id))
    .where(and(eq(documents.tenantId, tenantId), isNull(documents.deletedAt)))
    .orderBy(desc(documents.createdAt))
    .limit(limit);

  return rows;
}
