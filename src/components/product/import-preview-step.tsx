"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MappedRow } from "./product-import-wizard";

type Props = {
  rows: (string | number | null)[][];
  mapping: Record<string, number>;
  onBack: () => void;
  onDone: () => void;
};

function applyMapping(
  rows: (string | number | null)[][],
  mapping: Record<string, number>
): MappedRow[] {
  return rows
    .map((row) => ({
      code: mapping.code !== undefined ? String(row[mapping.code] ?? "") : undefined,
      name: mapping.name !== undefined ? String(row[mapping.name] ?? "") : "",
      category:
        mapping.category !== undefined
          ? String(row[mapping.category] ?? "")
          : undefined,
      price:
        mapping.price !== undefined
          ? parseFloat(String(row[mapping.price] ?? "0")) || 0
          : undefined,
      unit:
        mapping.unit !== undefined
          ? String(row[mapping.unit] ?? "")
          : undefined,
      description:
        mapping.description !== undefined
          ? String(row[mapping.description] ?? "")
          : undefined,
      notes:
        mapping.notes !== undefined
          ? String(row[mapping.notes] ?? "")
          : undefined,
    }))
    .filter((r) => r.name);
}

export function ImportPreviewStep({ rows, mapping, onBack, onDone }: Props) {
  const [importing, setImporting] = useState(false);
  const mapped = applyMapping(rows, mapping);
  const preview = mapped.slice(0, 5);

  // Stats
  const total = mapped.length;
  const withCode = mapped.filter((r) => r.code).length;
  const missingPrice = mapped.filter((r) => !r.price).length;

  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: mapped }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Lỗi import");
        return;
      }
      toast.success(
        `Import thành công: ${data.created} thêm mới, ${data.updated} cập nhật` +
          (data.errors?.length ? `, ${data.errors.length} lỗi` : "")
      );
      onDone();
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border p-3 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">Tổng dòng</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <p className="text-2xl font-bold">{withCode}</p>
          <p className="text-xs text-muted-foreground">Có mã SP</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{missingPrice}</p>
          <p className="text-xs text-muted-foreground">Thiếu giá</p>
        </div>
      </div>

      {/* Preview table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên SP</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead>ĐVT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-sm">
                  {row.code || "—"}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.category || "—"}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.price?.toLocaleString("vi-VN") || "0"}
                </TableCell>
                <TableCell>{row.unit || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {total > 5 && (
        <p className="text-xs text-muted-foreground text-center">
          Hiển thị 5/{total} dòng đầu
        </p>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={handleImport} disabled={importing || total === 0}>
          {importing && <Loader2 className="mr-2 size-4 animate-spin" />}
          Import {total} sản phẩm
        </Button>
      </div>
    </div>
  );
}
