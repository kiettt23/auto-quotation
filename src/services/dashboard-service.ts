/**
 * Dashboard service — aggregated stats for a tenant's dashboard.
 * Plain async functions, no "use server".
 */

import { db } from "@/db";
import { customers, products, documents, documentTemplates } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

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
      .where(eq(customers.tenantId, tenantId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.tenantId, tenantId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documentTemplates)
      .where(eq(documentTemplates.tenantId, tenantId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .innerJoin(documentTemplates, eq(documents.templateId, documentTemplates.id))
      .where(eq(documentTemplates.tenantId, tenantId)),
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
    .where(eq(documentTemplates.tenantId, tenantId))
    .orderBy(desc(documents.createdAt))
    .limit(limit);

  return rows;
}
