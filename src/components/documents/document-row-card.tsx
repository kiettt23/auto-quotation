import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

/** Reusable document row card used in Home + Document list */
export function DocumentRowCard({ doc }: { doc: DocumentRow }) {
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
          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${typeConfig.badgeBg} ${typeConfig.badgeText}`}
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
      <Badge
        variant="outline"
        className={`${statusConfig.badgeBg} ${statusConfig.badgeText} border-0`}
      >
        {statusConfig.label}
      </Badge>
    </Link>
  );
}
