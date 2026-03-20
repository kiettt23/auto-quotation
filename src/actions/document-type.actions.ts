"use server";

import { requireUserId } from "@/lib/auth/get-user-id";
import {
  listDocumentTypes,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
} from "@/services/document-type.service";
import { ok, err } from "@/lib/utils/action-result";
import type { ColumnDef } from "@/lib/types/column-def";

export async function listDocumentTypesAction() {
  const userId = await requireUserId();
  const types = await listDocumentTypes(userId);
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
    const userId = await requireUserId();
    const row = await createDocumentType(userId, { ...data, sortOrder: 99 });
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
    const userId = await requireUserId();
    const row = await updateDocumentType(id, userId, data);
    if (!row) return err("Không tìm thấy loại chứng từ.");
    return ok(row);
  } catch {
    return err("Không thể cập nhật loại chứng từ.");
  }
}

export async function deleteDocumentTypeAction(id: string) {
  try {
    const userId = await requireUserId();
    const row = await deleteDocumentType(id, userId);
    if (!row) return err("Không tìm thấy loại chứng từ.");
    return ok(row);
  } catch {
    return err("Không thể xóa loại chứng từ.");
  }
}
