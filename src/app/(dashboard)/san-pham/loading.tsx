import { TableSkeleton } from "@/components/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="ml-auto h-10 w-28" />
      </div>
      <TableSkeleton columns={6} rows={8} />
    </div>
  );
}
