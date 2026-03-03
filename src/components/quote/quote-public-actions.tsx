"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  quoteId: string;
};

export function QuotePublicActions({ quoteId }: Props) {
  return (
    <div className="flex justify-center gap-3">
      <Button variant="outline" asChild>
        <a href={`/api/export/pdf/${quoteId}`} download>
          <FileText className="mr-2 size-4" />
          Tải PDF
        </a>
      </Button>
      <Button variant="outline" asChild>
        <a href={`/api/export/excel/${quoteId}`} download>
          <FileSpreadsheet className="mr-2 size-4" />
          Tải Excel
        </a>
      </Button>
    </div>
  );
}
