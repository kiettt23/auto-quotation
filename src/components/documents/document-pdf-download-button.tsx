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
  };
  columns: ColumnDef[];
  showTotal: boolean;
  title: string;
  signatureLabels: string[];
  templateId?: string | null;
}

export function DocumentPdfDownloadButton({
  document: doc,
  company,
  columns,
  showTotal,
  title,
  signatureLabels,
  templateId,
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
    <Button size="sm" onClick={handleDownload} disabled={isGenerating}>
      <Download className="mr-1.5 h-4 w-4" />
      {isGenerating ? "Đang tạo..." : "Tải PDF"}
    </Button>
  );
}
