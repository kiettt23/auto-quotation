import { TableSkeleton } from "@/components/table-skeleton";

export default function QuotesLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
      <div className="h-10 w-full bg-muted animate-pulse rounded" />
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
