import { FileText, ClipboardCheck, Users, Package } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DashboardStats } from "@/services/stats.service";

type StatConfig = {
  label: string;
  key: keyof DashboardStats;
  icon: typeof FileText;
  iconBg: string;
  iconColor: string;
};

const stats: StatConfig[] = [
  { label: "Tổng tài liệu", key: "totalDocs", icon: FileText, iconBg: "bg-indigo-50", iconColor: "text-indigo-500" },
  { label: "Tài liệu tháng này", key: "monthlyQuotes", icon: ClipboardCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
  { label: "Khách hàng", key: "customerCount", icon: Users, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { label: "Sản phẩm", key: "productCount", icon: Package, iconBg: "bg-sky-50", iconColor: "text-sky-500" },
];

type Props = { data: DashboardStats };

export function StatCardGrid({ data }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.key}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-[10px]", s.iconBg)}>
              <Icon className={cn("h-[18px] w-[18px]", s.iconColor)} />
            </div>
            <p className="text-xs font-medium text-slate-400">{s.label}</p>
            <p className="text-[28px] font-bold tracking-tight text-slate-900">{data[s.key]}</p>
          </div>
        );
      })}
    </div>
  );
}
