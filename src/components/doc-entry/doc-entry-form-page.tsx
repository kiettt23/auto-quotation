"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  createDocEntry,
  updateDocEntry,
} from "@/app/(dashboard)/chung-tu/actions";
import { DocEntryFieldInputs } from "./doc-entry-field-inputs";
import { DocEntryTableRegionEditor } from "./doc-entry-table-region-editor";
import type { Placeholder, TableRegion } from "@/lib/validations/doc-template-schemas";
import type { JsonValue } from "@prisma/client/runtime/client";

// Props accept Prisma's wider JSON types for JSON fields (JsonValue)
// and cast them internally to strongly-typed variants.
type DocTemplateProp = {
  id: string;
  name: string;
  description: string;
  placeholders: JsonValue;
  tableRegion: JsonValue;
};

type DocEntryProp = {
  id: string;
  templateId: string;
  docNumber: string;
  fieldData: JsonValue;
  tableRows: JsonValue;
};

type Props = {
  template: DocTemplateProp;
  entry?: DocEntryProp | null;
};

/** Cast JSON placeholders to typed array, defaulting to empty array */
function castPlaceholders(raw: JsonValue): Placeholder[] {
  if (!Array.isArray(raw)) return [];
  return raw as Placeholder[];
}

/** Cast JSON tableRegion to typed value or null */
function castTableRegion(raw: JsonValue): TableRegion | null {
  if (raw === null || raw === undefined || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  return raw as unknown as TableRegion;
}

/** Cast JSON fieldData to Record<string, string>, defaulting to empty object */
function castFieldData(raw: JsonValue): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, string>;
}

/** Cast JSON tableRows to array of row records, defaulting to empty array */
function castTableRows(raw: JsonValue): Record<string, string>[] {
  if (!Array.isArray(raw)) return [];
  return raw as Record<string, string>[];
}

/** Full-page form for creating or editing a document entry */
export function DocEntryFormPage({ template, entry }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!entry;

  const placeholders = castPlaceholders(template.placeholders);
  const tableRegion = castTableRegion(template.tableRegion);

  const [fieldData, setFieldData] = useState<Record<string, string>>(
    () => (entry ? castFieldData(entry.fieldData) : {})
  );

  const [tableRows, setTableRows] = useState<Record<string, string>[]>(
    () => (entry ? castTableRows(entry.tableRows) : [])
  );

  function handleFieldChange(cellRef: string, value: string) {
    setFieldData((prev) => ({ ...prev, [cellRef]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        if (isEditing && entry) {
          await updateDocEntry(entry.id, { fieldData, tableRows });
          toast.success("Đã cập nhật chứng từ");
        } else {
          await createDocEntry({
            templateId: template.id,
            fieldData,
            tableRows,
          });
          toast.success("Đã tạo chứng từ thành công");
          router.push("/chung-tu");
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
            onClick={() => router.push("/chung-tu")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? `Chỉnh sửa: ${entry!.docNumber}` : "Tạo chứng từ mới"}
          </h1>
          <p className="text-muted-foreground mt-1">Mẫu: {template.name}</p>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          <Save className="mr-2 size-4" />
          {isPending ? "Đang lưu..." : "Lưu chứng từ"}
        </Button>
      </div>

      <Separator />

      {/* Placeholder fields */}
      {placeholders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Thông tin chứng từ</h2>
          <DocEntryFieldInputs
            placeholders={placeholders}
            values={fieldData}
            onChange={handleFieldChange}
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
              onRowsChange={setTableRows}
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
