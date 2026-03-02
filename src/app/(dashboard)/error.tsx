"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Đã xảy ra lỗi</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {error.message || "Không thể tải trang. Vui lòng thử lại."}
      </p>
      <Button className="mt-6" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}
