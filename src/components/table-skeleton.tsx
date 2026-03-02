import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  columns?: number;
  rows?: number;
};

export function TableSkeleton({ columns = 5, rows = 5 }: Props) {
  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="flex gap-4 border-b p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b p-4 last:border-b-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
