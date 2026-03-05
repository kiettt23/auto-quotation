"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TableRegion } from "@/lib/validations/doc-template-schemas";

type Props = {
  tableRegion: TableRegion;
  rows: Record<string, string>[];
  onRowsChange: (rows: Record<string, string>[]) => void;
};

/** Dynamic table editor for template table regions */
export function DocEntryTableRegionEditor({ tableRegion, rows, onRowsChange }: Props) {
  const { columns } = tableRegion;

  function addRow() {
    const emptyRow: Record<string, string> = {};
    columns.forEach((col) => (emptyRow[col.col] = ""));
    onRowsChange([...rows, emptyRow]);
  }

  function removeRow(index: number) {
    onRowsChange(rows.filter((_, i) => i !== index));
  }

  function updateCell(rowIndex: number, colKey: string, value: string) {
    const updated = rows.map((row, i) =>
      i === rowIndex ? { ...row, [colKey]: value } : row
    );
    onRowsChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] text-center">#</TableHead>
              {columns.map((col) => (
                <TableHead key={col.col}>{col.label}</TableHead>
              ))}
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="h-16 text-center text-muted-foreground text-sm"
                >
                  Chưa có dòng nào — nhấn &quot;Thêm dòng&quot; để bắt đầu
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {rowIdx + 1}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.col} className="p-1">
                      <Input
                        type={
                          col.type === "number"
                            ? "number"
                            : col.type === "date"
                            ? "date"
                            : "text"
                        }
                        value={row[col.col] ?? ""}
                        onChange={(e) => updateCell(rowIdx, col.col, e.target.value)}
                        placeholder={col.label}
                        step={col.type === "number" ? "any" : undefined}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRow(rowIdx)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="mr-2 size-4" />
        Thêm dòng
      </Button>
    </div>
  );
}
