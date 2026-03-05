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
import { DocTemplatePdfCanvasViewer } from "./doc-template-pdf-canvas-viewer";
import { DocTemplatePdfRegionEditor } from "./doc-template-pdf-region-editor";
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

export type PdfRegionDraft = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  type: "text" | "number" | "date";
};

export type ConfigureFormState = {
  name: string;
  description: string;
  sheetName: string;
  placeholders: PlaceholderDraft[];
  tableRegion: TableRegionDraft;
  pdfRegions: PdfRegionDraft[];
  docPrefix: string;
  docNextNumber: number;
};

type Props = {
  analysis: AnalysisResult | null;
  form: ConfigureFormState;
  onChange: (updated: Partial<ConfigureFormState>) => void;
  isEdit: boolean;
  fileType?: "excel" | "pdf";
  fileBase64?: string;
};

/** Step 2: configure template name, sheet/regions, placeholders, numbering. */
export function DocTemplateConfigureStep({ analysis, form, onChange, isEdit, fileType, fileBase64 }: Props) {
  const effectiveFileType = fileType ?? (analysis?.fileType ?? "excel");
  const effectiveBase64 = fileBase64 ?? (analysis?.fileType === "pdf" ? analysis.fileBase64 : undefined);

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <BasicInfoSection form={form} onChange={onChange} />

      {/* PDF-specific: coordinate-based region editing */}
      {effectiveFileType === "pdf" && effectiveBase64 && (
        <PdfCoordinateSection
          fileBase64={effectiveBase64}
          regions={form.pdfRegions}
          onChange={(pdfRegions) => onChange({ pdfRegions })}
        />
      )}

      {/* Excel-specific: sheet selector, placeholders, table region */}
      {effectiveFileType === "excel" && (
        <ExcelSection
          analysis={analysis?.fileType === "excel" ? analysis : null}
          form={form}
          onChange={onChange}
          isEdit={isEdit}
        />
      )}

      {/* Numbering (shared) */}
      <NumberingSection form={form} onChange={onChange} />
    </div>
  );
}

// ─── Basic info section ───────────────────────────────────────────────────────

type BasicInfoProps = { form: ConfigureFormState; onChange: (p: Partial<ConfigureFormState>) => void };

function BasicInfoSection({ form, onChange }: BasicInfoProps) {
  return (
    <>
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
    </>
  );
}

// ─── PDF coordinate section (drag-to-create regions on PDF) ──────────────────

import { useState } from "react";

type PdfCoordinateSectionProps = {
  fileBase64: string;
  regions: PdfRegionDraft[];
  onChange: (regions: PdfRegionDraft[]) => void;
};

function PdfCoordinateSection({ fileBase64, regions, onChange }: PdfCoordinateSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  function handleAddRegion(region: PdfRegionDraft) {
    const updated = [...regions, region];
    onChange(updated);
    setSelectedIndex(updated.length - 1);
  }

  return (
    <div className="space-y-4">
      {/* Canvas viewer for drawing regions */}
      <DocTemplatePdfCanvasViewer
        fileBase64={fileBase64}
        regions={regions}
        onAddRegion={handleAddRegion}
        onSelectRegion={setSelectedIndex}
        selectedRegionIndex={selectedIndex}
      />

      {/* Region list editor */}
      <DocTemplatePdfRegionEditor regions={regions} onChange={onChange} />
    </div>
  );
}

// ─── Excel section ────────────────────────────────────────────────────────────

type ExcelAnalysis = {
  fileType: "excel";
  sheets: string[];
  sheetsAnalysis: Array<{
    name: string;
    maxRow: number;
    maxCol: number;
    formulas: Array<{
      cellRef: string; formula: string; row: number;
      col: number; colLetter: string; neighborLabel: string;
    }>;
  }>;
};

type ExcelSectionProps = {
  analysis: ExcelAnalysis | null;
  form: ConfigureFormState;
  onChange: (p: Partial<ConfigureFormState>) => void;
  isEdit: boolean;
};

function ExcelSection({ analysis, form, onChange, isEdit }: ExcelSectionProps) {
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
          col: f.colLetter, label: f.neighborLabel || f.colLetter, type: "text", included: true,
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
    <>
      {/* Sheet selector */}
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
    </>
  );
}

// ─── Numbering section ────────────────────────────────────────────────────────

function NumberingSection({ form, onChange }: BasicInfoProps) {
  return (
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
  );
}
