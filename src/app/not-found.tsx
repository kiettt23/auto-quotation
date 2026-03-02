import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Không tìm thấy trang</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Quay về trang chủ</Link>
      </Button>
    </div>
  );
}
