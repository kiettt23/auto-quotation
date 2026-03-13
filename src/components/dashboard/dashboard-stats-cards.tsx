import { FileText, CheckCircle, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { StatCard } from "./stat-card";
import type { DashboardStats } from "@/services/dashboard-service";

type Props = { stats: DashboardStats };

export function DashboardStatsCards({ stats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tổng báo giá"
        value={stats.totalQuotes.toString()}
        icon={FileText}
      />
      <StatCard
        title="Đã chấp nhận"
        value={stats.byStatus.ACCEPTED.toString()}
        icon={CheckCircle}
      />
      <StatCard
        title="Doanh thu"
        value={formatCurrency(stats.revenue)}
        icon={TrendingUp}
      />
      <StatCard
        title="Khách hàng"
        value={stats.totalCustomers.toString()}
        icon={Users}
      />
    </div>
  );
}
