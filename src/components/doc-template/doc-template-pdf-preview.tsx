"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  fileBase64: string;
};

/** Collapsible PDF preview using an embedded iframe */
export function DocTemplatePdfPreview({ fileBase64 }: Props) {
  const [expanded, setExpanded] = useState(true);

  const dataUrl = `data:application/pdf;base64,${fileBase64}`;

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b">
        <p className="text-sm font-medium">Xem trước PDF</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          {expanded ? "Thu gọn" : "Mở rộng"}
        </Button>
      </div>

      {expanded && (
        <div className="w-full" style={{ height: 500 }}>
          <iframe
            src={dataUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
        </div>
      )}

      {expanded && (
        <p className="text-xs text-muted-foreground px-4 py-2 border-t">
          Mẹo: Hover chuột vào vị trí cần lấy tọa độ để xác định giá trị X, Y (điểm gốc ở góc dưới trái trang PDF).
        </p>
      )}
    </div>
  );
}
