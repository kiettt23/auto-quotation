import { db } from "@/db";
import { document } from "@/db/schema";
import { customer } from "@/db/schema/customer";
import { product } from "@/db/schema/product";
import { eq, and, isNull, sql, gte } from "drizzle-orm";

export type DashboardStats = {
  totalDocs: number;
  monthlyQuotes: number;
  customerCount: number;
  productCount: number;
};

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [docs, monthly, customers, products] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(document)
      .where(and(eq(document.userId, userId), isNull(document.deletedAt))),

    db.select({ count: sql<number>`count(*)::int` })
      .from(document)
      .where(and(
        eq(document.userId, userId),
        isNull(document.deletedAt),
        gte(document.createdAt, monthStart),
      )),

    db.select({ count: sql<number>`count(*)::int` })
      .from(customer)
      .where(and(eq(customer.userId, userId), isNull(customer.deletedAt))),

    db.select({ count: sql<number>`count(*)::int` })
      .from(product)
      .where(and(eq(product.userId, userId), isNull(product.deletedAt))),
  ]);

  return {
    totalDocs: docs[0]?.count ?? 0,
    monthlyQuotes: monthly[0]?.count ?? 0,
    customerCount: customers[0]?.count ?? 0,
    productCount: products[0]?.count ?? 0,
  };
}
