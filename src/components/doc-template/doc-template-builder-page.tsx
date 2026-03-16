"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocTemplateUploadStep, type AnalysisResult } from "./doc-template-upload-step";
import { DocTemplateSourceStep, type SourceChoice } from "./doc-template-source-step";
import {
  DocTemplateConfigureStep,
  type ConfigureFormState,
  type PlaceholderDraft,
  type TableColumnDraft,
  type PdfRegionDraft,
} from "./doc-template-configure-step";
import { DocTemplateStepIndicator } from "./doc-template-step-indicator";
import { createDocTemplate, updateDocTemplate } from "@/app/(dashboard)/templates/actions";
import type { PresetTemplate } from "@/lib/preset-templates";
import type { Placeholder, TableRegion, TableColumn, PdfRegion } from "@/lib/validations/doc-template-schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExistingTemplate = {
  id: string;
  name: string;
  description: string;
  sheetName: string;
  fileType: string;
  fileBase64: string;
  fileUrl?: string | null;
  docPrefix: string;
  docNextNumber: number;
  placeholders: unknown;
  tableRegion: unknown;
};

type Props = {
  template?: ExistingTemplate;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialForm(template?: ExistingTemplate): ConfigureFormState {
  if (template) {
    const isPdf = template.fileType === "pdf";

    const pdfRegions: PdfRegionDraft[] = isPdf && Array.isArray(template.placeholders)
      ? (template.placeholders as PdfRegion[]).map((r) => ({ ...r }))
      : [];

    const phs = !isPdf && Array.isArray(template.placeholders)
      ? (template.placeholders as Placeholder[]).map((p): PlaceholderDraft => ({
          cellRef: p.cellRef, label: p.label, type: p.type,
          originalFormula: p.originalFormula ?? "", included: true,
        }))
      : [];

    const tr = template.tableRegion as { startRow?: number; columns?: TableColumn[] } | null;
    const columns: TableColumnDraft[] = (tr?.columns ?? []).map((c) => ({
      col: c.col, label: c.label, type: c.type, included: true,
    }));

    return {
      name: template.name, description: template.description,
      sheetName: template.sheetName, placeholders: phs, pdfRegions,
      tableRegion: { enabled: !!tr, startRow: tr?.startRow ?? 1, columns },
      docPrefix: template.docPrefix, docNextNumber: template.docNextNumber,
    };
  }
  return {
    name: "", description: "", sheetName: "", placeholders: [], pdfRegions: [],
    tableRegion: { enabled: false, startRow: 1, columns: [] },
    docPrefix: "DOC-{YYYY}-", docNextNumber: 1,
  };
}

/** Build ConfigureFormState from a preset template definition */
function buildFormFromPreset(preset: PresetTemplate): ConfigureFormState {
  // Preset PDF templates use placeholders as Placeholder[] (not PdfRegion[])
  // because the rendering is code-driven, not coordinate-based overlay
  const placeholders: PlaceholderDraft[] = preset.placeholders.map((p) => ({
    cellRef: p.key,
    label: p.label,
    type: p.type,
    originalFormula: "",
    included: true,
  }));

  const columns: TableColumnDraft[] = preset.tableColumns.map((c) => ({
    col: c.key,
    label: c.label,
    type: c.type,
    included: true,
  }));

  return {
    name: preset.name,
    description: preset.description,
    sheetName: "",
    placeholders,
    pdfRegions: [],
    tableRegion: {
      enabled: columns.length > 0,
      startRow: 1,
      columns,
    },
    docPrefix: preset.docPrefix,
    docNextNumber: 1,
  };
}

function toPlaceholders(drafts: PlaceholderDraft[]): Placeholder[] {
  return drafts
    .filter((d) => d.included && d.label.trim())
    .map((d) => ({ cellRef: d.cellRef, label: d.label.trim(), type: d.type, originalFormula: d.originalFormula }));
}

function toPdfRegions(drafts: PdfRegionDraft[]): PdfRegion[] {
  return drafts
    .filter((d) => d.label.trim())
    .map((d) => ({
      id: d.id, label: d.label.trim(), x: d.x, y: d.y,
      width: d.width, height: d.height, fontSize: d.fontSize, type: d.type,
    }));
}

function toTableRegion(draft: ConfigureFormState["tableRegion"]): TableRegion | null {
  if (!draft.enabled) return null;
  const columns = draft.columns
    .filter((c) => c.included && c.label.trim())
    .map((c) => ({ col: c.col, label: c.label.trim(), type: c.type }));
  return columns.length === 0 ? null : { startRow: draft.startRow, columns };
}

// ─── Step labels ──────────────────────────────────────────────────────────────

const STEPS_NEW = ["Chọn nguồn", "Cấu hình", "Lưu mẫu"];
const STEPS_UPLOAD = ["Chọn nguồn", "Tải file", "Cấu hình", "Lưu mẫu"];
const STEPS_EDIT = ["Cấu hình", "Lưu mẫu"];

// ─── Main component ───────────────────────────────────────────────────────────

export function DocTemplateBuilderPage({ template }: Props) {
  const isEdit = !!template;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetTemplate | null>(null);
  const [sourceChosen, setSourceChosen] = useState<"preset" | "upload" | null>(null);
  const [form, setForm] = useState<ConfigureFormState>(() => buildInitialForm(template));

  // Determine step labels and content mapping
  const steps = isEdit
    ? STEPS_EDIT
    : sourceChosen === "upload"
      ? STEPS_UPLOAD
      : STEPS_NEW;

  // Map logical step index to content type
  function getContentType(): "source" | "upload" | "configure" | "review" {
    if (isEdit) {
      return step === 0 ? "configure" : "review";
    }
    if (sourceChosen === "upload") {
      // 0=source, 1=upload, 2=configure, 3=review
      return (["source", "upload", "configure", "review"] as const)[step];
    }
    // preset or not yet chosen: 0=source, 1=configure, 2=review
    return (["source", "configure", "review"] as const)[step];
  }

  const contentType = getContentType();
  const isPresetPdf = selectedPreset?.fileType === "pdf";
  const effectiveFileType = selectedPreset?.fileType ?? analysis?.fileType ?? (template?.fileType === "pdf" ? "pdf" : "excel");
  const isPdf = effectiveFileType === "pdf";

  // For preset templates, placeholders are stored as Placeholder[] (not PdfRegion[])
  const isPresetMode = !!selectedPreset;

  const configureIsValid = form.name.trim() !== "" &&
    (isPdf || isPresetMode || isEdit || form.sheetName !== "");
  const canAdvance = contentType !== "configure" || configureIsValid;

  // Prefer blob URL for PDF preview; fall back to base64 for legacy/new uploads
  const pdfPreviewUrl = template?.fileType === "pdf" && template.fileUrl
    ? template.fileUrl
    : undefined;
  const fileBase64ForPdf = pdfPreviewUrl
    ? undefined
    : analysis?.fileType === "pdf"
      ? analysis.fileBase64
      : template?.fileType === "pdf" ? template.fileBase64 : undefined;

  function handleSourceSelect(choice: SourceChoice) {
    if (choice.type === "preset") {
      setSelectedPreset(choice.preset);
      setSourceChosen("preset");
      setForm(buildFormFromPreset(choice.preset));
      setStep(1); // go to configure
    } else {
      setSourceChosen("upload");
      setStep(1); // go to upload
    }
  }

  function handleAnalyzed(result: AnalysisResult) {
    setAnalysis(result);
    const nameWithoutExt = result.fileName.replace(/\.(xlsx?|pdf)$/i, "");
    setForm((prev) => ({ ...prev, name: prev.name || nameWithoutExt }));
    setStep(2); // go to configure (upload flow step 2)
  }

  function handleFormChange(patch: Partial<ConfigureFormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên mẫu"); return; }
    startTransition(async () => {
      try {
        if (isEdit && template) {
          // Edit mode — same as before
          const placeholders = isPdf && !isPresetMode
            ? toPdfRegions(form.pdfRegions)
            : toPlaceholders(form.placeholders);
          const tableRegion = isPdf && !isPresetMode ? null : toTableRegion(form.tableRegion);

          await updateDocTemplate(template.id, {
            name: form.name, description: form.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            placeholders: placeholders as any,
            tableRegion,
            docPrefix: form.docPrefix, docNextNumber: form.docNextNumber,
          });
          toast.success("Đã cập nhật mẫu tài liệu");
        } else if (isPresetMode && selectedPreset) {
          // Preset mode — no fileBase64 needed, template engine routes by name
          const placeholders = toPlaceholders(form.placeholders);
          const tableRegion = toTableRegion(form.tableRegion);

          await createDocTemplate({
            name: form.name,
            description: form.description,
            fileBase64: "", // no base file — rendered by code
            sheetName: "",
            fileType: selectedPreset.fileType,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            placeholders: placeholders as any,
            tableRegion,
            docPrefix: form.docPrefix,
            docNextNumber: form.docNextNumber,
          });
          toast.success("Đã tạo mẫu tài liệu từ mẫu có sẵn");
        } else {
          // Upload mode
          if (!analysis) { toast.error("Chưa có file để lưu"); return; }
          const placeholders = isPdf
            ? toPdfRegions(form.pdfRegions)
            : toPlaceholders(form.placeholders);
          const tableRegion = isPdf ? null : toTableRegion(form.tableRegion);

          await createDocTemplate({
            name: form.name, description: form.description,
            fileBase64: analysis.fileBase64,
            sheetName: isPdf ? "" : form.sheetName,
            fileType: analysis.fileType,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            placeholders: placeholders as any,
            tableRegion,
            docPrefix: form.docPrefix, docNextNumber: form.docNextNumber,
          });
          toast.success("Đã tạo mẫu tài liệu");
        }
        router.push("/templates");
      } catch {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  function handleBack() {
    if (step > 0) {
      // If going back from upload/configure to source, reset source choice
      if (step === 1 && sourceChosen) {
        setSourceChosen(null);
        setSelectedPreset(null);
        setForm(buildInitialForm());
      }
      setStep(step - 1);
    } else {
      router.push("/templates");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? `Chỉnh sửa: ${template.name}` : "Tạo mẫu tài liệu mới"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEdit
              ? "Cập nhật cấu hình mẫu"
              : "Chọn mẫu có sẵn hoặc tải lên file để tạo mẫu tài liệu"}
          </p>
        </div>
        <DocTemplateStepIndicator step={step} steps={steps} />
      </div>

      <div className="rounded-xl border p-6">
        {contentType === "source" && (
          <DocTemplateSourceStep onSelect={handleSourceSelect} />
        )}
        {contentType === "upload" && (
          <DocTemplateUploadStep onAnalyzed={handleAnalyzed} />
        )}
        {contentType === "configure" && (
          <DocTemplateConfigureStep
            analysis={analysis}
            form={form}
            onChange={handleFormChange}
            isEdit={isEdit}
            fileType={effectiveFileType as "excel" | "pdf"}
            fileBase64={isPresetMode ? undefined : fileBase64ForPdf}
            fileUrl={isPresetMode ? undefined : pdfPreviewUrl}
            isPreset={isPresetMode}
          />
        )}
        {contentType === "review" && (
          <ReviewStep
            form={form}
            fileType={effectiveFileType}
            isPreset={isPresetMode}
            presetName={selectedPreset?.name}
            toPlaceholders={toPlaceholders}
            toPdfRegions={toPdfRegions}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="mr-1 size-4" />
          {step === 0 ? "Hủy" : "Quay lại"}
        </Button>
        {step < steps.length - 1 ? (
          // Source step auto-advances on selection, so hide "next" for step 0
          contentType !== "source" ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}>
              Tiếp theo <ChevronRight className="ml-1 size-4" />
            </Button>
          ) : null
        ) : (
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {isEdit ? "Cập nhật" : "Tạo mẫu"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Review step ──────────────────────────────────────────────────────────────

type ReviewStepProps = {
  form: ConfigureFormState;
  fileType: string;
  isPreset: boolean;
  presetName?: string;
  toPlaceholders: (drafts: PlaceholderDraft[]) => Placeholder[];
  toPdfRegions: (drafts: PdfRegionDraft[]) => PdfRegion[];
};

function ReviewStep({ form, fileType, isPreset, presetName, toPlaceholders, toPdfRegions }: ReviewStepProps) {
  const isPdf = fileType === "pdf";
  const fieldCount = isPreset
    ? toPlaceholders(form.placeholders).length
    : isPdf
      ? toPdfRegions(form.pdfRegions).length
      : toPlaceholders(form.placeholders).length;

  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium">Xem lại trước khi lưu:</p>
      <ul className="space-y-1 text-muted-foreground list-disc list-inside">
        <li>Tên: <span className="text-foreground">{form.name}</span></li>
        {isPreset && (
          <li>Mẫu có sẵn: <span className="text-foreground">{presetName}</span></li>
        )}
        <li>Loại: <span className="text-foreground">{isPdf ? "PDF" : "Excel"}</span></li>
        {!isPdf && !isPreset && <li>Sheet: <span className="text-foreground">{form.sheetName}</span></li>}
        <li>Số trường: <span className="text-foreground">{fieldCount}</span></li>
        <li>Tiền tố: <span className="text-foreground">{form.docPrefix}</span></li>
        {form.tableRegion.enabled && (
          <li>Bảng dữ liệu: <span className="text-foreground">Bật ({form.tableRegion.columns.filter(c => c.included).length} cột)</span></li>
        )}
      </ul>
    </div>
  );
}
