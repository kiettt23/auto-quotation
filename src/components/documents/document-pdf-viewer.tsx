"use client";

import dynamic from "next/dynamic";
import { registerPdfFonts } from "@/lib/pdf/register-fonts";
import { DocumentPdfLayout } from "@/lib/pdf/document-pdf-layout";

registerPdfFonts();
import { presetTitleMap } from "@/lib/pdf/preset-config";
import { formatDate } from "@/lib/utils/document-helpers";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentType } from "@/db/schema/document";
import type { DocumentData } from "@/lib/types/document-data";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <PdfSkeleton /> }
);

interface Props {
  document: DocumentRow;
  company: {
    name: string;
    address?: string | null;
    phone?: string | null;
  };
}

export function DocumentPdfViewer({ document: doc, company }: Props) {
  const title = presetTitleMap[doc.type as DocumentType];
  const data = doc.data as DocumentData;

  return (
    <PDFViewer width="100%" height="100%" className="min-h-[700px] rounded border border-slate-200">
      <DocumentPdfLayout
        title={title}
        documentNumber={doc.documentNumber}
        date={formatDate(doc.createdAt)}
        company={company}
        data={data}
      />
    </PDFViewer>
  );
}

function PdfSkeleton() {
  return (
    <div className="flex min-h-[700px] items-center justify-center rounded border border-slate-200 bg-slate-50">
      <p className="text-sm text-slate-400">Đang tải PDF...</p>
    </div>
  );
}
