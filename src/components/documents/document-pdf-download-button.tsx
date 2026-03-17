"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DocumentPdfLayout } from "@/lib/pdf/document-pdf-layout";
import { presetTitleMap } from "@/lib/pdf/preset-config";
import { formatDate } from "@/lib/utils/document-helpers";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentType } from "@/db/schema/document";
import type { DocumentData } from "@/lib/types/document-data";

interface Props {
  document: DocumentRow;
  company: {
    name: string;
    address?: string | null;
    phone?: string | null;
  };
}

export function DocumentPdfDownloadButton({ document: doc, company }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const title = presetTitleMap[doc.type as DocumentType];
      const data = doc.data as DocumentData;

      const blob = await pdf(
        <DocumentPdfLayout
          title={title}
          documentNumber={doc.documentNumber}
          date={formatDate(doc.createdAt)}
          company={company}
          data={data}
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
