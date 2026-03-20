import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { requireUserId } from "@/lib/auth/get-user-id";
import { listRecentDocuments } from "@/services/document.service";
import { DocumentRowCard } from "@/components/documents/document-row-card";

export default async function HomePage() {
  const userId = await requireUserId();
  const documents = await listRecentDocuments(userId);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Trang chủ</h1>
        <Button asChild>
          <Link href="/documents/new">+ Tạo tài liệu mới</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-slate-900">
          Tài liệu gần đây
        </h2>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-white py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900">
              Chưa có tài liệu nào
            </p>
            <p className="text-center text-sm text-slate-500">
              Tạo báo giá, phiếu xuất kho hoặc phiếu giao hàng
              <br />
              đầu tiên của bạn ngay bây giờ.
            </p>
            <Button asChild>
              <Link href="/documents/new">+ Tạo tài liệu đầu tiên</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <DocumentRowCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
