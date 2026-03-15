import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-36" />
      {/* Toolbar: filter select + create button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[220px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      {/* Table rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
