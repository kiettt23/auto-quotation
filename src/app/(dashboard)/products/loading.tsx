import { TableSkeleton } from "@/components/table-skeleton";

export default function ProductsLoading() {
  return (
    <div>
      <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
      <div className="mt-1 h-4 w-64 rounded-md bg-muted animate-pulse" />
      <div className="mt-6">
        <TableSkeleton rows={8} columns={6} />
      </div>
    </div>
  );
}
