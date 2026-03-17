"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreHorizontal, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteDocumentAction,
  duplicateDocumentAction,
} from "@/actions/document.actions";
import {
  documentTypeConfig,
  documentStatusConfig,
  calculateTotal,
  formatCurrency,
  formatDate,
} from "@/lib/utils/document-helpers";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentType, DocumentStatus } from "@/db/schema/document";
import type { DocumentData } from "@/lib/types/document-data";

export function DocumentListClient({
  documents,
}: {
  documents: DocumentRow[];
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const result = await deleteDocumentAction(id);
    if (result.success) {
      toast.success("Đã xóa tài liệu");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDuplicate(id: string) {
    const result = await duplicateDocumentAction(id);
    if (result.success) {
      toast.success("Đã nhân bản tài liệu");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tài liệu</h1>
        <Button asChild>
          <Link href="/documents/new">+ Tạo tài liệu mới</Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentRow({
  doc,
  onDelete,
  onDuplicate,
}: {
  doc: DocumentRow;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const typeConfig = documentTypeConfig[doc.type as DocumentType];
  const statusConfig = documentStatusConfig[doc.status as DocumentStatus];
  const data = doc.data as DocumentData;
  const total = data?.items ? calculateTotal(data.items) : 0;

  return (
    <Link
      href={`/documents/${doc.id}`}
      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
    >
      <div className="flex items-center gap-4">
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${typeConfig.badgeBg} ${typeConfig.badgeText}`}
        >
          {typeConfig.prefix}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-slate-900">
            {doc.documentNumber}
            {data?.customerName ? ` — ${data.customerName}` : ""}
          </span>
          <span className="text-xs text-slate-500">
            {formatDate(doc.createdAt)}
            {total > 0 ? ` • ${formatCurrency(total)}` : ""}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={`${statusConfig.badgeBg} ${statusConfig.badgeText} border-0`}
        >
          {statusConfig.label}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.preventDefault()}
            className="rounded-md p-1.5 hover:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onDuplicate(doc.id);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Nhân bản
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => {
                e.preventDefault();
                onDelete(doc.id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
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
  );
}
