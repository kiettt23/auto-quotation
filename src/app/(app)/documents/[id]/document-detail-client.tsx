"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  driverName?: string | null;
  vehicleId?: string | null;
  representative?: string | null;
  position?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  customData?: Record<string, string | number> | null;
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
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      {/* Top bar */}
      <div className="relative flex items-center justify-between">
        <Link
          href="/documents"
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        <span className="absolute inset-x-0 text-center text-lg font-semibold text-slate-900 pointer-events-none">
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
