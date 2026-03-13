"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SYSTEM_FIELDS } from "@/lib/import-excel-parser";

type Props = {
  headers: string[];
  rows: (string | number | null)[][];
  mapping: Record<string, number>;
  onBack: () => void;
  onConfirm: (mapping: Record<string, number>) => void;
};

export function ImportColumnMappingStep({
  headers,
  rows,
  mapping: initialMapping,
  onBack,
  onConfirm,
}: Props) {
  const [mapping, setMapping] = useState<Record<string, number>>(initialMapping);

  // Reverse lookup: column index -> field key
  const reverseMap = new Map<number, string>();
  for (const [field, index] of Object.entries(mapping)) {
    reverseMap.set(index, field);
  }

  function setFieldMapping(colIndex: number, fieldKey: string) {
    setMapping((prev) => {
      const next = { ...prev };
      // Remove any existing mapping for this column
      for (const [key, idx] of Object.entries(next)) {
        if (idx === colIndex) delete next[key];
      }
      // Remove any existing mapping for this field key
      for (const key of Object.keys(next)) {
        if (key === fieldKey) delete next[key];
      }
      if (fieldKey !== "skip") {
        next[fieldKey] = colIndex;
      }
      return next;
    });
  }

  const hasNameMapping = Object.keys(mapping).includes("name");
  const nameColIdx = mapping["name"];
  const priceColIdx = mapping["price"];

  const missingPrice =
    priceColIdx !== undefined
      ? rows.filter((r) => !r[priceColIdx] || isNaN(Number(r[priceColIdx]))).length
      : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ghép cột Excel với trường hệ thống. Cột &quot;Tên sản phẩm&quot; là bắt buộc.
      </p>

      <div className="space-y-2">
        {headers.map((header, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-md border p-2"
          >
            <span className="text-sm font-medium min-w-[140px] truncate">
              {header || `Cột ${idx + 1}`}
            </span>
            <span className="text-muted-foreground">→</span>
            <Select
              value={reverseMap.get(idx) ?? "skip"}
              onValueChange={(v) => setFieldMapping(idx, v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYSTEM_FIELDS.map((f) => (
                  <SelectItem key={f.key} value={f.key}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground truncate flex-1">
              VD: {rows[0]?.[idx] ?? "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {(!hasNameMapping || missingPrice > 0) && (
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-3 text-sm space-y-1">
          {!hasNameMapping && (
            <p className="text-yellow-800 dark:text-yellow-200">
              Chưa ghép cột &quot;Tên sản phẩm&quot; (bắt buộc)
            </p>
          )}
          {missingPrice > 0 && priceColIdx !== undefined && (
            <p className="text-yellow-800 dark:text-yellow-200">
              {missingPrice} dòng thiếu giá (sẽ nhập giá = 0)
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={() => onConfirm(mapping)} disabled={!hasNameMapping}>
          Tiếp theo
        </Button>
      </div>
    </div>
  );
}
