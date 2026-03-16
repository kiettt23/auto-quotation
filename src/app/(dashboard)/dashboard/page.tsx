export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { getDashboardStats, getRecentDocuments } from "@/services/dashboard-service";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { RecentDocumentsSection } from "@/components/dashboard/recent-documents-section";
import { db } from "@/db";
import { tenants as tenantsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  let ctx;
  try {
    ctx = await getTenantContext();
  } catch {
    redirect("/create-company");
  }

  // Onboarding guard — redirect if setup not complete
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenantsTable.id, ctx.tenantId),
    columns: { onboardingComplete: true },
  });
  if (tenant && !tenant.onboardingComplete) {
    redirect("/onboarding");
  }

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
