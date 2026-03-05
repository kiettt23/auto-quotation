"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocTemplatePlaceholderRow } from "./doc-template-placeholder-row";
import { DocTemplateTableRegionConfig } from "./doc-template-table-region-config";
import type { AnalysisResult } from "./doc-template-upload-step";

// ─── Draft types used in configure step ──────────────────────────────────────

export type PlaceholderDraft = {
  cellRef: string;
  label: string;
  type: "text" | "number" | "date";
  originalFormula: string;
  included: boolean;
};

export type TableColumnDraft = {
  col: string;
  label: string;
  type: "text" | "number" | "date";
  included: boolean;
};

export type TableRegionDraft = {
  enabled: boolean;
  startRow: number;
  columns: TableColumnDraft[];
};

export type ConfigureFormState = {
  name: string;
  description: string;
  sheetName: string;
  placeholders: PlaceholderDraft[];
  tableRegion: TableRegionDraft;
  docPrefix: string;
  docNextNumber: number;
};

type Props = {
  analysis: AnalysisResult | null;
  form: ConfigureFormState;
  onChange: (updated: Partial<ConfigureFormState>) => void;
  isEdit: boolean;
};

/** Step 2: configure template name, sheet, placeholders, table region, numbering. */
export function DocTemplateConfigureStep({ analysis, form, onChange, isEdit }: Props) {
  const selectedSheet = analysis?.sheetsAnalysis.find((s) => s.name === form.sheetName);

  function handleSheetChange(sheetName: string) {
    const sheet = analysis?.sheetsAnalysis.find((s) => s.name === sheetName);
    const placeholders: PlaceholderDraft[] = (sheet?.formulas ?? []).map((f) => ({
      cellRef: f.cellRef,
      label: f.neighborLabel || f.cellRef,
      type: "text",
      originalFormula: f.formula,
      included: true,
    }));

    // Group formulas by row to suggest table columns
    type FormulaItem = NonNullable<typeof sheet>["formulas"][number];
    const rowGroups: Record<number, FormulaItem[]> = {};
    (sheet?.formulas ?? []).forEach((f) => {
      if (!rowGroups[f.row]) rowGroups[f.row] = [];
      rowGroups[f.row].push(f);
    });
    const maxGroupSize = Math.max(0, ...Object.values(rowGroups).map((g) => g.length));
    const tableRowEntry = Object.entries(rowGroups).find(([, g]) => g.length === maxGroupSize);
    const tableColumns: TableColumnDraft[] = tableRowEntry
      ? tableRowEntry[1].map((f) => ({
          col: f.colLetter,
          label: f.neighborLabel || f.colLetter,
          type: "text",
          included: true,
        }))
      : [];

    onChange({
      sheetName,
      placeholders,
      tableRegion: {
        enabled: false,
        startRow: tableRowEntry ? parseInt(tableRowEntry[0]) : 1,
        columns: tableColumns,
      },
    });
  }

  function handlePlaceholderChange(index: number, patch: Partial<PlaceholderDraft>) {
    const updated = form.placeholders.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onChange({ placeholders: updated });
  }

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cfg-name">Tên mẫu</Label>
          <Input
            id="cfg-name"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Tên mẫu chứng từ"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cfg-sheet">Sheet</Label>
          {isEdit ? (
            <Input id="cfg-sheet" value={form.sheetName} disabled />
          ) : (
            <Select value={form.sheetName} onValueChange={handleSheetChange}>
              <SelectTrigger id="cfg-sheet">
                <SelectValue placeholder="Chọn sheet..." />
              </SelectTrigger>
              <SelectContent>
                {(analysis?.sheets ?? []).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cfg-desc">Mô tả</Label>
        <Textarea
          id="cfg-desc"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Mô tả mẫu (không bắt buộc)"
          rows={2}
        />
      </div>

      {/* Placeholders */}
      {form.placeholders.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            Các trường phát hiện ({selectedSheet?.formulas.length ?? form.placeholders.length} ô công thức)
          </p>
          <div className="rounded-lg border px-4 py-1">
            {form.placeholders.map((ph, i) => (
              <DocTemplatePlaceholderRow
                key={ph.cellRef}
                item={ph}
                index={i}
                onChange={handlePlaceholderChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Table region */}
      <div>
        <p className="text-sm font-medium mb-2">Vùng bảng dữ liệu</p>
        <div className="rounded-lg border p-4">
          <DocTemplateTableRegionConfig
            tableRegion={form.tableRegion}
            onChange={(patch) => onChange({ tableRegion: { ...form.tableRegion, ...patch } })}
          />
        </div>
      </div>

      {/* Numbering */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cfg-prefix">Tiền tố số chứng từ</Label>
          <Input
            id="cfg-prefix"
            value={form.docPrefix}
            onChange={(e) => onChange({ docPrefix: e.target.value })}
            placeholder="VD: DOC-{YYYY}-"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cfg-next-num">Số thứ tự tiếp theo</Label>
          <Input
            id="cfg-next-num"
            type="number"
            min={1}
            value={form.docNextNumber}
            onChange={(e) => onChange({ docNextNumber: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>
    </div>
  );
}
