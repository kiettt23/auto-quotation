"use server";

import { revalidatePath } from "next/cache";
import { requireCompanyId } from "@/lib/auth/get-company-id";
import { createDocumentSchema } from "@/lib/validations/document.schema";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  duplicateDocument,
} from "@/services/document.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";
import type { DocumentRow } from "@/services/document.service";

function revalidateDocuments() {
  revalidatePath("/");
  revalidatePath("/documents");
}

export async function createDocumentAction(
  input: unknown
): Promise<ActionResult<DocumentRow>> {
  try {
    const companyId = await requireCompanyId();
    const parsed = createDocumentSchema.safeParse(input);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const { type, customerId, items, ...rest } = parsed.data;

    const doc = await createDocument(companyId, {
      type,
      customerId: customerId || undefined,
      data: { ...rest, items },
    });

    revalidateDocuments();
    return ok(doc);
  } catch {
    return err("Đã xảy ra lỗi khi tạo tài liệu.");
  }
}

export async function updateDocumentAction(
  documentId: string,
  input: unknown
): Promise<ActionResult<DocumentRow>> {
  try {
    const companyId = await requireCompanyId();
    const parsed = createDocumentSchema.safeParse(input);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const { customerId, items, type: _type, ...rest } = parsed.data;

    const doc = await updateDocument(documentId, companyId, {
      customerId: customerId || undefined,
      data: { ...rest, items },
    });

    if (!doc) return err("Không tìm thấy tài liệu.");
    revalidateDocuments();
    return ok(doc);
  } catch {
    return err("Đã xảy ra lỗi khi cập nhật tài liệu.");
  }
}

export async function deleteDocumentAction(
  documentId: string
): Promise<ActionResult<null>> {
  try {
    const companyId = await requireCompanyId();
    await deleteDocument(documentId, companyId);
    revalidateDocuments();
    return ok(null);
  } catch {
    return err("Đã xảy ra lỗi khi xóa tài liệu.");
  }
}

export async function duplicateDocumentAction(
  documentId: string
): Promise<ActionResult<DocumentRow>> {
  try {
    const companyId = await requireCompanyId();
    const doc = await duplicateDocument(documentId, companyId);
    if (!doc) return err("Không tìm thấy tài liệu gốc.");
    revalidateDocuments();
    return ok(doc);
  } catch {
    return err("Đã xảy ra lỗi khi nhân bản tài liệu.");
  }
}
