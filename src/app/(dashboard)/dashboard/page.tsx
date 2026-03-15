export const dynamic = "force-dynamic";

import { getTenantContext } from "@/lib/tenant-context";
import { getDashboardStats, getRecentDocuments } from "@/services/dashboard-service";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { RecentDocumentsSection } from "@/components/dashboard/recent-documents-section";

export default async function DashboardPage() {
  const ctx = await getTenantContext();
  const [stats, recentDocs] = await Promise.all([
    getDashboardStats(ctx.tenantId),
    getRecentDocuments(ctx.tenantId),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Tổng quan</h1>
      <DashboardStatsCards stats={stats} />
      <RecentDocumentsSection documents={recentDocs} />
    </div>
  );
}
