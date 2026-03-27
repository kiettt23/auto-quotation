"use client";

import dynamic from "next/dynamic";
import { useRef, Component, type ReactNode } from "react";
import { registerPdfFonts } from "@/lib/pdf/register-fonts";
import { getTemplateComponent } from "@/lib/pdf/template-registry";
import { formatDate } from "@/lib/utils/document-helpers";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentData } from "@/lib/types/document-data";
import type { ColumnDef } from "@/lib/types/column-def";

/** Error boundary to catch PDF rendering failures (e.g. font loading) */
class PdfErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) {
    return { error: err.message || "Không thể tải PDF" };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[900px] items-center justify-center rounded border border-red-200 bg-red-50">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-red-600">Lỗi hiển thị PDF</p>
            <p className="text-xs text-red-500">{this.state.error}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[900px] items-center justify-center rounded border border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          <p className="text-sm text-slate-400">Đang tạo PDF...</p>
        </div>
      </div>
    ),
  },
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
    driverName?: string | null;
    vehicleId?: string | null;
    representative?: string | null;
    position?: string | null;
    bankAccount?: string | null;
    bankName?: string | null;
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
  const fontsRegistered = useRef(false);
  if (!fontsRegistered.current) {
    registerPdfFonts();
    fontsRegistered.current = true;
  }
  const data = doc.data as DocumentData;
  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <PdfErrorBoundary>
      <PDFViewer
        key={doc.id + doc.updatedAt}
        width="100%"
        height="100%"
        className="min-h-[900px] rounded border border-slate-200"
      >
        <TemplateComponent
          title={title}
          documentNumber={doc.documentNumber}
          date={data.date ? data.date.split("-").reverse().join("/") : formatDate(doc.createdAt)}
          company={company}
          data={data}
          columns={columns}
          showTotal={showTotal}
          signatureLabels={signatureLabels}
        />
      </PDFViewer>
    </PdfErrorBoundary>
  );
}
