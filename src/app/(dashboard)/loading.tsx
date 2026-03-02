import { StatsCardsSkeleton } from "@/components/card-skeleton";
import { TableSkeleton } from "@/components/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-32" />
      <StatsCardsSkeleton />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <TableSkeleton columns={5} rows={5} />
      </div>
    </div>
  );
}
