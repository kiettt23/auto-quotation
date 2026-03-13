/**
 * Document service — CRUD for document entries scoped to a tenant (via template).
 * No "use server" here — plain async functions called from actions or route handlers.
 */

import { db } from "@/db";
import { documents, documentTemplates } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ok, err } from "@/lib/result";
import type { Result } from "@/lib/result";
import type { Document, DocumentTemplate } from "@/db/schema";
import { generateDocNumber } from "@/lib/generate-doc-number";

// ─── Types ────────────────────────────────────────────────

export type DocumentWithTemplate = Document & {
  template: DocumentTemplate;
};

export type GetDocumentsParams = {
  templateId?: string;
  limit?: number;
  offset?: number;
};

export type CreateDocumentInput = {
  fieldData: Record<string, string>;
  tableRows: Record<string, string>[];
};

export type UpdateDocumentInput = {
  fieldData: Record<string, string>;
  tableRows: Record<string, string>[];
};

// ─── Service functions ────────────────────────────────────

export async function getDocuments(
  tenantId: string,
  params: GetDocumentsParams = {}
): Promise<DocumentWithTemplate[]> {
  const allDocs = await db.query.documents.findMany({
    with: { template: true },
    orderBy: [desc(documents.createdAt)],
  });

  // Filter by tenantId via template
  let filtered = allDocs.filter((d) => d.template.tenantId === tenantId);

  if (params.templateId) {
    filtered = filtered.filter((d) => d.templateId === params.templateId);
  }

  const offset = params.offset ?? 0;
  const limit = params.limit;

  const sliced = limit ? filtered.slice(offset, offset + limit) : filtered.slice(offset);
  return sliced;
}

export async function getDocumentById(
  tenantId: string,
  id: string
): Promise<DocumentWithTemplate | undefined> {
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
    with: { template: true },
  });
  if (!doc || doc.template.tenantId !== tenantId) return undefined;
  return doc;
}

export async function createDocument(
  tenantId: string,
  templateId: string,
  data: CreateDocumentInput
): Promise<Result<Document>> {
  try {
    // Verify template belongs to tenant
    const template = await db.query.documentTemplates.findFirst({
      where: and(
        eq(documentTemplates.id, templateId),
        eq(documentTemplates.tenantId, tenantId)
      ),
    });
    if (!template) return err("Không tìm thấy mẫu chứng từ");

    // Generate doc number and increment counter
    const docNumber = generateDocNumber(template.docPrefix, template.docNextNumber);

    await db
      .update(documentTemplates)
      .set({ docNextNumber: template.docNextNumber + 1 })
      .where(eq(documentTemplates.id, templateId));

    const [doc] = await db
      .insert(documents)
      .values({
        templateId,
        docNumber,
        fieldData: data.fieldData,
        tableRows: data.tableRows,
      })
      .returning();

    return ok(doc);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Không thể tạo chứng từ");
  }
}

export async function updateDocument(
  tenantId: string,
  id: string,
  data: UpdateDocumentInput
): Promise<Result<Document>> {
  try {
    const existing = await getDocumentById(tenantId, id);
    if (!existing) return err("Không tìm thấy chứng từ");

    const [updated] = await db
      .update(documents)
      .set({
        fieldData: data.fieldData,
        tableRows: data.tableRows,
      })
      .where(eq(documents.id, id))
      .returning();

    return ok(updated);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Không thể cập nhật chứng từ");
  }
}

export async function deleteDocument(
  tenantId: string,
  id: string
): Promise<Result<void>> {
  try {
    const existing = await getDocumentById(tenantId, id);
    if (!existing) return err("Không tìm thấy chứng từ");

    await db.delete(documents).where(eq(documents.id, id));
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Không thể xóa chứng từ");
  }
}
