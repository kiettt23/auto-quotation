"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { registerPdfFonts } from "@/lib/pdf/register-fonts";
import { getTemplateComponent } from "@/lib/pdf/template-registry";

registerPdfFonts();
import { formatDate } from "@/lib/utils/document-helpers";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentData } from "@/lib/types/document-data";
import type { ColumnDef } from "@/lib/types/column-def";

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
    taxCode?: string | null;
    logoUrl?: string | null;
    headerLayout?: string | null;
  };
  columns: ColumnDef[];
  showTotal: boolean;
  title: string;
  signatureLabels: string[];
  templateId?: string | null;
}

export function DocumentPdfViewer({
  document: doc,
  company,
  columns,
  showTotal,
  title,
  signatureLabels,
  templateId,
}: Props) {
  const data = doc.data as DocumentData;
  const [pdfReady, setPdfReady] = useState(false);
  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <div className="relative min-h-[700px]">
      {!pdfReady && <PdfSkeleton />}
      <div
        className={pdfReady ? "" : "invisible absolute inset-0"}
        ref={(el) => {
          if (!el) return;
          const observer = new MutationObserver(() => {
            const iframe = el.querySelector("iframe");
            if (iframe) {
              iframe.addEventListener("load", () => setPdfReady(true), { once: true });
              observer.disconnect();
            }
          });
          observer.observe(el, { childList: true, subtree: true });
        }}
      >
        <PDFViewer width="100%" height="100%" className="min-h-[700px] rounded border border-slate-200">
          <TemplateComponent
            title={title}
            documentNumber={doc.documentNumber}
            date={formatDate(doc.createdAt)}
            company={company}
            data={data}
            columns={columns}
            showTotal={showTotal}
            signatureLabels={signatureLabels}
          />
        </PDFViewer>
      </div>
    </div>
  );
}

function PdfSkeleton() {
  return (
    <div className="flex min-h-[700px] items-center justify-center rounded border border-slate-200 bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        <p className="text-sm text-slate-400">Đang tạo PDF...</p>
      </div>
    </div>
  );
}
