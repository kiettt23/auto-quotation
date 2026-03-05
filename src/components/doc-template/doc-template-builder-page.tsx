"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocTemplateUploadStep, type AnalysisResult } from "./doc-template-upload-step";
import {
  DocTemplateConfigureStep,
  type ConfigureFormState,
  type PlaceholderDraft,
  type TableColumnDraft,
} from "./doc-template-configure-step";
import { DocTemplateStepIndicator } from "./doc-template-step-indicator";
import { createDocTemplate, updateDocTemplate } from "@/app/(dashboard)/mau-chung-tu/actions";
import type { Placeholder, TableRegion, TableColumn } from "@/lib/validations/doc-template-schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExistingTemplate = {
  id: string;
  name: string;
  description: string;
  sheetName: string;
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
    const phs = Array.isArray(template.placeholders)
      ? (template.placeholders as Placeholder[]).map((p): PlaceholderDraft => ({
          cellRef: p.cellRef,
          label: p.label,
          type: p.type,
          originalFormula: p.originalFormula,
          included: true,
        }))
      : [];
    const tr = template.tableRegion as { startRow?: number; columns?: TableColumn[] } | null;
    const columns: TableColumnDraft[] = (tr?.columns ?? []).map((c) => ({
      col: c.col, label: c.label, type: c.type, included: true,
    }));
    return {
      name: template.name,
      description: template.description,
      sheetName: template.sheetName,
      placeholders: phs,
      tableRegion: { enabled: !!tr, startRow: tr?.startRow ?? 1, columns },
      docPrefix: template.docPrefix,
      docNextNumber: template.docNextNumber,
    };
  }
  return {
    name: "", description: "", sheetName: "", placeholders: [],
    tableRegion: { enabled: false, startRow: 1, columns: [] },
    docPrefix: "DOC-{YYYY}-", docNextNumber: 1,
  };
}

function toPlaceholders(drafts: PlaceholderDraft[]): Placeholder[] {
  return drafts
    .filter((d) => d.included && d.label.trim())
    .map((d) => ({ cellRef: d.cellRef, label: d.label.trim(), type: d.type, originalFormula: d.originalFormula }));
}

function toTableRegion(draft: ConfigureFormState["tableRegion"]): TableRegion | null {
  if (!draft.enabled) return null;
  const columns = draft.columns
    .filter((c) => c.included && c.label.trim())
    .map((c) => ({ col: c.col, label: c.label.trim(), type: c.type }));
  return columns.length === 0 ? null : { startRow: draft.startRow, columns };
}

// ─── Step content helpers ─────────────────────────────────────────────────────

const STEPS_NEW = ["Tải file", "Cấu hình", "Lưu mẫu"];
const STEPS_EDIT = ["Cấu hình", "Lưu mẫu"];

// contentStep: 0=upload, 1=configure, 2=review
function getContentStep(step: number, isEdit: boolean) {
  return isEdit ? step + 1 : step;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DocTemplateBuilderPage({ template }: Props) {
  const isEdit = !!template;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [form, setForm] = useState<ConfigureFormState>(() => buildInitialForm(template));

  const steps = isEdit ? STEPS_EDIT : STEPS_NEW;
  const contentStep = getContentStep(step, isEdit);
  const canAdvance = contentStep !== 1 || (form.name.trim() !== "" && (isEdit || form.sheetName !== ""));

  function handleAnalyzed(result: AnalysisResult) {
    setAnalysis(result);
    const nameWithoutExt = result.fileName.replace(/\.(xlsx?)$/i, "");
    setForm((prev) => ({ ...prev, name: prev.name || nameWithoutExt }));
    setStep(1);
  }

  function handleFormChange(patch: Partial<ConfigureFormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên mẫu"); return; }
    startTransition(async () => {
      try {
        const placeholders = toPlaceholders(form.placeholders);
        const tableRegion = toTableRegion(form.tableRegion);
        if (isEdit && template) {
          await updateDocTemplate(template.id, {
            name: form.name, description: form.description,
            placeholders, tableRegion, docPrefix: form.docPrefix, docNextNumber: form.docNextNumber,
          });
          toast.success("Đã cập nhật mẫu chứng từ");
        } else {
          if (!analysis) { toast.error("Chưa có file để lưu"); return; }
          await createDocTemplate({
            name: form.name, description: form.description,
            fileBase64: analysis.fileBase64, sheetName: form.sheetName,
            placeholders, tableRegion, docPrefix: form.docPrefix, docNextNumber: form.docNextNumber,
          });
          toast.success("Đã tạo mẫu chứng từ");
        }
        router.push("/mau-chung-tu");
      } catch {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? `Chỉnh sửa: ${template.name}` : "Tạo mẫu chứng từ mới"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEdit ? "Cập nhật cấu hình mẫu" : "Tải lên file Excel và cấu hình các trường dữ liệu"}
          </p>
        </div>
        <DocTemplateStepIndicator step={step} steps={steps} />
      </div>

      <div className="rounded-xl border p-6">
        {contentStep === 0 && <DocTemplateUploadStep onAnalyzed={handleAnalyzed} />}
        {contentStep === 1 && (
          <DocTemplateConfigureStep
            analysis={analysis}
            form={form}
            onChange={handleFormChange}
            isEdit={isEdit}
          />
        )}
        {contentStep === 2 && (
          <div className="space-y-3 text-sm">
            <p className="font-medium">Xem lại trước khi lưu:</p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Tên: <span className="text-foreground">{form.name}</span></li>
              <li>Sheet: <span className="text-foreground">{form.sheetName}</span></li>
              <li>Số trường: <span className="text-foreground">{toPlaceholders(form.placeholders).length}</span></li>
              <li>Tiền tố: <span className="text-foreground">{form.docPrefix}</span></li>
              <li>Bảng dữ liệu: <span className="text-foreground">{form.tableRegion.enabled ? "Bật" : "Tắt"}</span></li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : router.push("/mau-chung-tu")}>
          <ChevronLeft className="mr-1 size-4" />
          {step === 0 ? "Hủy" : "Quay lại"}
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}>
            Tiếp theo <ChevronRight className="ml-1 size-4" />
          </Button>
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
