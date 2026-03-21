"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Printer } from "lucide-react";
import { toast } from "sonner";
import { duplicateDocumentAction } from "@/actions/document.actions";
import { DocumentPdfViewer } from "@/components/documents/document-pdf-viewer";
import { DocumentPdfDownloadButton } from "@/components/documents/document-pdf-download-button";
import type { DocumentRow } from "@/services/document.service";
import type { ColumnDef } from "@/lib/types/column-def";

interface CompanyInfo {
  name: string;
  address?: string | null;
  phone?: string | null;
  taxCode?: string | null;
  logoUrl?: string | null;
  headerLayout?: string | null;
}

export function DocumentDetailClient({
  document: doc,
  company,
  columns,
  showTotal,
  title,
  signatureLabels,
  templateId,
}: {
  document: DocumentRow;
  company: CompanyInfo;
  columns: ColumnDef[];
  showTotal: boolean;
  title: string;
  signatureLabels: string[];
  templateId?: string | null;
}) {
  const router = useRouter();

  async function handleDuplicate() {
    const result = await duplicateDocumentAction(doc.id);
    if (result.success) {
      toast.success("Đã nhân bản tài liệu");
      router.push(`/documents/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/documents"
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        <span className="text-lg font-semibold text-slate-900">
          {doc.documentNumber}
        </span>

        <div className="flex gap-2">
          <DocumentPdfDownloadButton
            document={doc}
            company={company}
            columns={columns}
            showTotal={showTotal}
            title={title}
            signatureLabels={signatureLabels}
            templateId={templateId}
          />
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" />
            In
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="mr-1.5 h-4 w-4" />
            Nhân bản
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      <DocumentPdfViewer
        document={doc}
        company={company}
        columns={columns}
        showTotal={showTotal}
        title={title}
        signatureLabels={signatureLabels}
        templateId={templateId}
      />
    </div>
  );
}
