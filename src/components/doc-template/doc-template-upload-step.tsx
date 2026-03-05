"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AnalysisResult = {
  sheets: string[];
  sheetsAnalysis: Array<{
    name: string;
    maxRow: number;
    maxCol: number;
    formulas: Array<{
      cellRef: string;
      formula: string;
      row: number;
      col: number;
      colLetter: string;
      neighborLabel: string;
    }>;
  }>;
  fileBase64: string;
  fileName: string;
};

type Props = {
  onAnalyzed: (result: AnalysisResult) => void;
};

export function DocTemplateUploadStep({ onAnalyzed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError("Chỉ hỗ trợ file Excel (.xlsx, .xls)");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/doc-template/analyze", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Lỗi khi phân tích file");
      }
      const data: AnalysisResult = await res.json();
      onAnalyzed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) analyzeFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) analyzeFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          "flex flex-col items-center justify-center gap-3 w-full max-w-lg rounded-xl border-2 border-dashed p-12 cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          isLoading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        {isLoading ? (
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="size-10 text-muted-foreground" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium">
            {isLoading ? "Đang phân tích file..." : "Kéo thả hoặc nhấn để chọn file"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Hỗ trợ .xlsx, .xls</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={() => inputRef.current?.click()}
      >
        Chọn file Excel
      </Button>
    </div>
  );
}
