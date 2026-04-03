"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/get-user-id";
import { requireSession } from "@/lib/auth/get-session";
import { createDocumentSchema } from "@/lib/validations/document.schema";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  duplicateDocument,
} from "@/services/document.service";
import { listCompanies } from "@/services/company.service";
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
    const session = await requireSession();
    const userId = session.user.id;
    const parsed = createDocumentSchema.safeParse(input);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const { companyId, templateId, customerId, documentNumberSuffix, items, ...rest } = parsed.data;

    // Validate that the selected company belongs to the current user
    const userCompanies = await listCompanies(userId);
    const validCompany = userCompanies.find((c) => c.id === companyId);
    if (!validCompany) {
      return err("Công ty không hợp lệ.");
    }

    const doc = await createDocument(userId, {
      companyId,
      templateId,
      customerId: customerId || undefined,
      documentNumberSuffix: documentNumberSuffix || undefined,
      data: { ...rest, items },
    });

    revalidateDocuments();
    return ok(doc);
  } catch (e) {
    console.error("createDocumentAction error:", e);
    return err("Đã xảy ra lỗi khi tạo tài liệu.");
  }
}

export async function updateDocumentAction(
  documentId: string,
  input: unknown
): Promise<ActionResult<DocumentRow>> {
  try {
    const userId = await requireUserId();
    const parsed = createDocumentSchema.safeParse(input);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const { companyId, customerId, items, templateId: _templateId, ...rest } = parsed.data;

    // Validate company ownership
    const userCompanies = await listCompanies(userId);
    if (!userCompanies.find((c) => c.id === companyId)) {
      return err("Công ty không hợp lệ.");
    }

    const doc = await updateDocument(documentId, userId, {
      companyId,
      customerId: customerId || undefined,
      data: { ...rest, items },
    });

    if (!doc) return err("Không tìm thấy tài liệu.");
    revalidateDocuments();
    return ok(doc);
  } catch (e) {
    console.error("updateDocumentAction error:", e);
    return err("Đã xảy ra lỗi khi cập nhật tài liệu.");
  }
}

export async function deleteDocumentAction(
  documentId: string
): Promise<ActionResult<null>> {
  try {
    const userId = await requireUserId();
    const deleted = await deleteDocument(documentId, userId);
    if (!deleted) return err("Không tìm thấy tài liệu.");
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
    const userId = await requireUserId();
    const doc = await duplicateDocument(documentId, userId);
    if (!doc) return err("Không tìm thấy tài liệu gốc.");
    revalidateDocuments();
    return ok(doc);
  } catch {
    return err("Đã xảy ra lỗi khi nhân bản tài liệu.");
  }
}
