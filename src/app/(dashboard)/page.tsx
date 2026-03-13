export const dynamic = "force-dynamic";

import { getTenantContext } from "@/lib/tenant-context";
import { getDashboardStats, getRecentQuotes } from "@/services/dashboard-service";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { RecentQuotesSection } from "@/components/dashboard/recent-quotes-section";

export default async function DashboardPage() {
  const ctx = await getTenantContext();
  const [stats, recentQuotes] = await Promise.all([
    getDashboardStats(ctx.tenantId),
    getRecentQuotes(ctx.tenantId, 5),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Tổng quan</h1>
      <DashboardStatsCards stats={stats} />
      <RecentQuotesSection quotes={recentQuotes} />
    </div>
  );
}
