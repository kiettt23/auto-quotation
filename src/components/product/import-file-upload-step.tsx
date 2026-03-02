"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ParsedData } from "./product-import-wizard";

type Props = {
  onParsed: (data: ParsedData) => void;
};

export function ImportFileUploadStep({ onParsed }: Props) {
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/import/parse", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Lỗi đọc file");
          return;
        }
        onParsed(data);
      } catch {
        toast.error("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-4">
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        ) : (
          <>
            <FileSpreadsheet className="size-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">
                Kéo thả file hoặc click để chọn
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Hỗ trợ .xlsx, .xls, .csv (tối đa 5MB)
              </p>
            </div>
            <Upload className="size-5 text-muted-foreground" />
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
