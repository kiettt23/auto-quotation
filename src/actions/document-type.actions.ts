"use server";

import { requireCompanyId } from "@/lib/auth/get-company-id";
import {
  listDocumentTypes,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
} from "@/services/document-type.service";
import { ok, err } from "@/lib/utils/action-result";
import type { ColumnDef } from "@/lib/types/column-def";

export async function listDocumentTypesAction() {
  const companyId = await requireCompanyId();
  const types = await listDocumentTypes(companyId);
  return ok(types);
}

export async function createDocumentTypeAction(data: {
  key: string;
  label: string;
  shortLabel: string;
  columns: ColumnDef[];
  showTotal?: boolean;
}) {
  try {
    const companyId = await requireCompanyId();
    const row = await createDocumentType(companyId, { ...data, sortOrder: 99 });
    return ok(row);
  } catch {
    return err("Không thể tạo loại chứng từ.");
  }
}

export async function updateDocumentTypeAction(
  id: string,
  data: { label?: string; shortLabel?: string; columns?: ColumnDef[]; showTotal?: boolean; signatureLabels?: string[]; templateId?: string | null }
) {
  try {
    const companyId = await requireCompanyId();
    const row = await updateDocumentType(id, companyId, data);
    if (!row) return err("Không tìm thấy loại chứng từ.");
    return ok(row);
  } catch {
    return err("Không thể cập nhật loại chứng từ.");
  }
}

export async function deleteDocumentTypeAction(id: string) {
  try {
    const companyId = await requireCompanyId();
    const row = await deleteDocumentType(id, companyId);
    if (!row) return err("Không tìm thấy loại chứng từ.");
    return ok(row);
  } catch {
    return err("Không thể xóa loại chứng từ.");
  }
}
