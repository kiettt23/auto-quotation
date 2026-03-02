import { db } from "@/lib/db";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import {
  RecentQuotesSection,
  type RecentQuote,
} from "@/components/dashboard/recent-quotes-section";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthlyCount, pendingCount, monthlyTotal, recentQuotes] =
    await Promise.all([
      db.quote.count({ where: { createdAt: { gte: monthStart } } }),
      db.quote.count({ where: { status: "SENT" } }),
      db.quote.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { total: true },
      }),
      db.quote.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quoteNumber: true,
          customerName: true,
          customerCompany: true,
          total: true,
          createdAt: true,
          status: true,
        },
      }),
    ]);

  const quotes: RecentQuote[] = recentQuotes.map((q) => ({
    ...q,
    total: Number(q.total),
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Tổng quan</h1>

      <DashboardStatsCards
        monthlyCount={monthlyCount}
        pendingCount={pendingCount}
        monthlyTotal={Number(monthlyTotal._sum.total ?? 0)}
      />

      <RecentQuotesSection quotes={quotes} />
    </div>
  );
}
