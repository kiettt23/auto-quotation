"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  createDocEntry,
  updateDocEntry,
} from "@/app/(dashboard)/documents/actions";
import { DocEntryFieldInputs } from "./doc-entry-field-inputs";
import { DocEntryTableRegionEditor } from "./doc-entry-table-region-editor";
import { findPresetByName, getPresetById } from "@/lib/preset-templates";
import type { Placeholder, TableRegion, PdfRegion } from "@/lib/validations/doc-template-schemas";

// Generic JSON value type replacing Prisma's JsonValue
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type DocTemplateProp = {
  id: string;
  name: string;
  description: string;
  fileType?: string;
  placeholders: JsonValue;
  tableRegion: JsonValue;
  presetId?: string | null;
};

type DocEntryProp = {
  id: string;
  templateId: string;
  docNumber: string;
  fieldData: JsonValue;
  tableRows: JsonValue;
};

type TenantData = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  taxCode: string;
  website: string;
};

type Props = {
  template: DocTemplateProp;
  entry?: DocEntryProp | null;
  /** Tenant settings for auto-filling preset fields */
  tenantData?: TenantData;
};

function castPlaceholders(raw: JsonValue): Placeholder[] {
  if (!Array.isArray(raw)) return [];
  return raw as Placeholder[];
}

function castTableRegion(raw: JsonValue): TableRegion | null {
  if (raw === null || raw === undefined || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as unknown as TableRegion;
}

function castFieldData(raw: JsonValue): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, string>;
}

function castTableRows(raw: JsonValue): Record<string, string>[] {
  if (!Array.isArray(raw)) return [];
  return raw as Record<string, string>[];
}

/** Resolve autoFill dot-path like "tenant.companyName" → value from tenantData */
function resolveAutoFill(path: string, tenantData?: TenantData): string {
  if (!tenantData || !path.startsWith("tenant.")) return "";
  const field = path.replace("tenant.", "") as keyof TenantData;
  return tenantData[field] ?? "";
}

/** Full-page form for creating or editing a document entry */
export function DocEntryFormPage({ template, entry, tenantData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!entry;

  // Look up preset metadata for autocomplete config — prefer presetId, fallback to name
  const preset = template.presetId
    ? getPresetById(template.presetId)
    : findPresetByName(template.name);

  const isPdf = template.fileType === "pdf";
  const rawPhs = Array.isArray(template.placeholders) ? template.placeholders : [];
  const isCoordinateBased = isPdf && rawPhs.length > 0 && "x" in (rawPhs[0] as Record<string, unknown>);
  const placeholders = isCoordinateBased
    ? (rawPhs as unknown as PdfRegion[]).map((r): Placeholder => ({ cellRef: r.id, label: r.label, type: r.type, originalFormula: "" }))
    : castPlaceholders(template.placeholders);
  const tableRegion = isCoordinateBased ? null : castTableRegion(template.tableRegion);

  const [fieldData, setFieldData] = useState<Record<string, string>>(() => {
    if (entry) return castFieldData(entry.fieldData);
    // Auto-fill from tenant settings for preset templates
    const initial: Record<string, string> = {};
    if (preset && tenantData) {
      for (const ph of preset.placeholders) {
        if (ph.autoFill) {
          const value = resolveAutoFill(ph.autoFill, tenantData);
          if (value) initial[ph.key] = value;
        }
      }
    }
    return initial;
  });

  const [tableRows, setTableRows] = useState<Record<string, string>[]>(
    () => (entry ? castTableRows(entry.tableRows) : [])
  );

  // Track whether form has been modified to warn on navigation
  const isDirty = useRef(false);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function handleFieldChange(cellRef: string, value: string) {
    isDirty.current = true;
    setFieldData((prev) => ({ ...prev, [cellRef]: value }));
  }

  /** Handle autocomplete selection: set main field + linked fields */
  function handleAutocompleteSelect(fieldKey: string, value: string, linkedValues?: Record<string, string>) {
    setFieldData((prev) => {
      isDirty.current = true;
      const updated = { ...prev, [fieldKey]: value };
      if (linkedValues) {
        Object.entries(linkedValues).forEach(([k, v]) => { updated[k] = v; });
      }
      return updated;
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        if (isEditing && entry) {
          await updateDocEntry(entry.id, { fieldData, tableRows });
          isDirty.current = false;
          toast.success("Đã cập nhật tài liệu");
        } else {
          await createDocEntry({
            templateId: template.id,
            fieldData,
            tableRows,
          });
          isDirty.current = false;
          toast.success("Đã tạo tài liệu thành công");
          router.push("/documents");
        }
      } catch {
        toast.error("Lưu thất bại, vui lòng thử lại");
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 text-muted-foreground"
            onClick={() => router.push("/documents")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? `Chỉnh sửa: ${entry!.docNumber}` : "Tạo tài liệu mới"}
          </h1>
          <p className="text-muted-foreground mt-1">Mẫu: {template.name}</p>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          <Save className="mr-2 size-4" />
          {isPending ? "Đang lưu..." : "Lưu tài liệu"}
        </Button>
      </div>

      <Separator />

      {/* Placeholder fields */}
      {placeholders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Thông tin tài liệu</h2>
          <DocEntryFieldInputs
            placeholders={placeholders}
            values={fieldData}
            onChange={handleFieldChange}
            onAutocompleteSelect={handleAutocompleteSelect}
            presetPlaceholders={preset?.placeholders}
          />
        </section>
      )}

      {/* Dynamic table region */}
      {tableRegion && (
        <>
          {placeholders.length > 0 && <Separator />}
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Chi tiết bảng</h2>
            <DocEntryTableRegionEditor
              tableRegion={tableRegion}
              rows={tableRows}
              onRowsChange={(rows) => { isDirty.current = true; setTableRows(rows); }}
              presetTableColumns={preset?.tableColumns}
            />
          </section>
        </>
      )}

      {/* No fields and no table */}
      {placeholders.length === 0 && !tableRegion && (
        <p className="text-muted-foreground text-sm">
          Mẫu này không có trường nào được định nghĩa.
        </p>
      )}
    </div>
  );
}
