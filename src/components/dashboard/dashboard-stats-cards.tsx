import { FileText, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { StatCard } from "./stat-card";

type Props = {
  monthlyCount: number;
  pendingCount: number;
  monthlyTotal: number;
};

export function DashboardStatsCards({
  monthlyCount,
  pendingCount,
  monthlyTotal,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Báo giá tháng này"
        value={monthlyCount.toString()}
        icon={FileText}
      />
      <StatCard
        title="Đang chờ phản hồi"
        value={pendingCount.toString()}
        icon={Clock}
      />
      <StatCard
        title="Tổng giá trị tháng"
        value={`${formatCurrency(monthlyTotal)} ₫`}
        icon={DollarSign}
      />
    </div>
  );
}
