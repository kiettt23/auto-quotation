"use client";

import { useState, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import { registerPdfFonts } from "@/lib/pdf/register-fonts";
import { Button } from "@/components/ui/button";
import { getTemplateComponent } from "@/lib/pdf/template-registry";
import { Download } from "lucide-react";
import { formatDate } from "@/lib/utils/document-helpers";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentData } from "@/lib/types/document-data";
import type { ColumnDef } from "@/lib/types/column-def";

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
  /** "panel" renders compact style matching panel header buttons, "row" matches row action icons */
  size?: "default" | "panel" | "row";
  /** Show text label next to icon (for row size) */
  showLabel?: boolean;
}

export function DocumentPdfDownloadButton({
  document: doc,
  company,
  columns,
  showTotal,
  title,
  signatureLabels,
  templateId,
  size = "default",
  showLabel,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const fontsRegistered = useRef(false);
  const TemplateComponent = getTemplateComponent(templateId);

  async function handleDownload() {
    if (!fontsRegistered.current) {
      registerPdfFonts();
      fontsRegistered.current = true;
    }
    setIsGenerating(true);
    try {
      const data = doc.data as DocumentData;

      const blob = await pdf(
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
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.documentNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>{size === "row" ? (
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex cursor-pointer items-center gap-1 rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-slate-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm disabled:opacity-50"
        title="Tải file PDF"
      >
        <Download className="h-3 w-3" />
        {showLabel && <span>Tải PDF</span>}
      </button>
    ) : (
      <Button
        size="sm"
        variant={size === "panel" ? "outline" : "default"}
        onClick={handleDownload}
        disabled={isGenerating}
        className={size === "panel" ? "h-7 gap-1 px-2 text-xs" : ""}
        title="Tải file PDF"
      >
        <Download className={size === "panel" ? "h-3 w-3" : "mr-1.5 h-4 w-4"} />
        {isGenerating ? "Đang tạo..." : "Tải PDF"}
      </Button>
    )}</>
  );
}
