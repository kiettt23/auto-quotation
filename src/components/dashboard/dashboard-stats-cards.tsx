import { FileText, LayoutTemplate, Users, Package } from "lucide-react";
import { StatCard } from "./stat-card";
import type { DashboardStats } from "@/services/dashboard-service";

type Props = { stats: DashboardStats };

export function DashboardStatsCards({ stats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tài liệu"
        value={stats.totalDocuments.toString()}
        icon={FileText}
      />
      <StatCard
        title="Mẫu tài liệu"
        value={stats.totalTemplates.toString()}
        icon={LayoutTemplate}
      />
      <StatCard
        title="Khách hàng"
        value={stats.totalCustomers.toString()}
        icon={Users}
      />
      <StatCard
        title="Sản phẩm"
        value={stats.totalProducts.toString()}
        icon={Package}
      />
    </div>
  );
}
