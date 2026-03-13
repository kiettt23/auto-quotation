/**
 * Dashboard service — aggregated stats for a tenant's dashboard.
 * Plain async functions, no "use server".
 */

import { db } from "@/db";
import { quotes, customers, products } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────

export type DashboardStats = {
  totalQuotes: number;
  byStatus: {
    DRAFT: number;
    SENT: number;
    ACCEPTED: number;
    REJECTED: number;
    EXPIRED: number;
  };
  revenue: number;
  totalCustomers: number;
  totalProducts: number;
};

export type RecentQuoteRow = {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerCompany: string;
  status: string;
  total: number;
  createdAt: Date;
};

// ─── Service functions ────────────────────────────────────

export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  const [quoteRows, customerCount, productCount] = await Promise.all([
    db
      .select({ status: quotes.status, total: quotes.total })
      .from(quotes)
      .where(eq(quotes.tenantId, tenantId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(eq(customers.tenantId, tenantId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.tenantId, tenantId)),
  ]);

  const byStatus = { DRAFT: 0, SENT: 0, ACCEPTED: 0, REJECTED: 0, EXPIRED: 0 };
  let revenue = 0;

  for (const row of quoteRows) {
    const s = row.status as keyof typeof byStatus;
    if (s in byStatus) byStatus[s]++;
    if (s === "ACCEPTED") revenue += Number(row.total);
  }

  return {
    totalQuotes: quoteRows.length,
    byStatus,
    revenue,
    totalCustomers: customerCount[0]?.count ?? 0,
    totalProducts: productCount[0]?.count ?? 0,
  };
}

export async function getRecentQuotes(tenantId: string, limit = 5): Promise<RecentQuoteRow[]> {
  const rows = await db
    .select({
      id: quotes.id,
      quoteNumber: quotes.quoteNumber,
      customerName: quotes.customerName,
      customerCompany: quotes.customerCompany,
      status: quotes.status,
      total: quotes.total,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .where(eq(quotes.tenantId, tenantId))
    .orderBy(desc(quotes.createdAt))
    .limit(limit);

  return rows.map((r) => ({ ...r, total: Number(r.total) }));
}
