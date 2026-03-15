"use client";

import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
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
import { ProductAutocompleteCombobox, type SelectedProduct } from "@/components/shared/product-autocomplete-combobox";
import type { TableRegion } from "@/lib/validations/doc-template-schemas";
import type { PresetTableColumn } from "@/lib/preset-templates/types";

type Props = {
  tableRegion: TableRegion;
  rows: Record<string, string>[];
  onRowsChange: (rows: Record<string, string>[]) => void;
  /** Preset table column metadata (for dataSource/linkedFields) */
  presetTableColumns?: PresetTableColumn[];
};

/** Dynamic table editor with optional product autocomplete */
export function DocEntryTableRegionEditor({ tableRegion, rows, onRowsChange, presetTableColumns }: Props) {
  const { columns } = tableRegion;
  const [productSearchRow, setProductSearchRow] = useState<number | null>(null);

  /** Find preset metadata for a column by matching col key */
  function getColumnMeta(colKey: string): PresetTableColumn | undefined {
    return presetTableColumns?.find((c) => c.key === colKey);
  }

  /** Check if any column has product dataSource */
  const hasProductAutocomplete = presetTableColumns?.some((c) => c.dataSource === "product") ?? false;

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

  function handleProductSelect(rowIndex: number, colKey: string, product: SelectedProduct) {
    const meta = getColumnMeta(colKey);
    const updated = rows.map((row, i) => {
      if (i !== rowIndex) return row;
      const newRow = { ...row, [colKey]: product.name };
      // Fill linked fields in the same row
      if (meta?.linkedFields) {
        Object.entries(meta.linkedFields).forEach(([sourceField, targetCol]) => {
          const value = product[sourceField as keyof SelectedProduct];
          if (value !== undefined) newRow[targetCol] = String(value);
        });
      }
      return newRow;
    });
    onRowsChange(updated);
    setProductSearchRow(null);
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
              <TableHead className="w-[80px]" />
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
                  {columns.map((col) => {
                    const meta = getColumnMeta(col.col);
                    const showSearchBtn = meta?.dataSource === "product";

                    return (
                      <TableCell key={col.col} className="p-1">
                        <div className="flex items-center gap-1">
                          <Input
                            type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                            value={row[col.col] ?? ""}
                            onChange={(e) => updateCell(rowIdx, col.col, e.target.value)}
                            placeholder={col.label}
                            step={col.type === "number" ? "any" : undefined}
                            className="h-8 text-sm"
                          />
                          {showSearchBtn && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              onClick={() => setProductSearchRow(rowIdx)}
                            >
                              <Search className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
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

      {/* Product search dialog — shared across all rows */}
      {hasProductAutocomplete && (
        <ProductAutocompleteCombobox
          open={productSearchRow !== null}
          onOpenChange={(open) => { if (!open) setProductSearchRow(null); }}
          onSelect={(product) => {
            if (productSearchRow === null) return;
            // Find the column with product dataSource
            const productCol = presetTableColumns?.find((c) => c.dataSource === "product");
            if (productCol) handleProductSelect(productSearchRow, productCol.key, product);
          }}
        />
      )}
    </div>
  );
}
