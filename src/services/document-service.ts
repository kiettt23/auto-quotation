/**
 * Document service — CRUD for document entries scoped to a tenant (via template).
 * No "use server" here — plain async functions called from actions or route handlers.
 */

import { db } from "@/db";
import { documents, documentTemplates } from "@/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
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
  // Filter at DB level using subquery — only docs whose template belongs to this tenant
  const tenantTemplateIds = db.select({ id: documentTemplates.id })
    .from(documentTemplates)
    .where(eq(documentTemplates.tenantId, tenantId));

  const conditions = [inArray(documents.templateId, tenantTemplateIds)];
  if (params.templateId) {
    conditions.push(eq(documents.templateId, params.templateId));
  }

  return db.query.documents.findMany({
    where: and(...conditions),
    with: { template: true },
    orderBy: [desc(documents.createdAt)],
    ...(params.limit && { limit: params.limit }),
    ...(params.offset && { offset: params.offset }),
  });
}

export async function getDocumentById(
  tenantId: string,
  id: string
): Promise<DocumentWithTemplate | undefined> {
  // Use subquery to enforce tenant scope at DB level
  const tenantTemplateIds = db.select({ id: documentTemplates.id })
    .from(documentTemplates)
    .where(eq(documentTemplates.tenantId, tenantId));

  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), inArray(documents.templateId, tenantTemplateIds)),
    with: { template: true },
  });
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
    if (!template) return err("Không tìm thấy mẫu tài liệu");

    // Atomic increment — eliminates race condition under concurrent creates
    const [updated] = await db
      .update(documentTemplates)
      .set({ docNextNumber: sql`${documentTemplates.docNextNumber} + 1` })
      .where(eq(documentTemplates.id, templateId))
      .returning({ docNextNumber: documentTemplates.docNextNumber });

    // docNextNumber is the NEW value after +1, so subtract 1 to get the number we just claimed
    const nextNum = updated.docNextNumber - 1;
    const docNumber = generateDocNumber(template.docPrefix, nextNum);

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
    return err(e instanceof Error ? e.message : "Không thể tạo tài liệu");
  }
}

export async function updateDocument(
  tenantId: string,
  id: string,
  data: UpdateDocumentInput
): Promise<Result<Document>> {
  try {
    const existing = await getDocumentById(tenantId, id);
    if (!existing) return err("Không tìm thấy tài liệu");

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
    return err(e instanceof Error ? e.message : "Không thể cập nhật tài liệu");
  }
}

export async function deleteDocument(
  tenantId: string,
  id: string
): Promise<Result<void>> {
  try {
    const existing = await getDocumentById(tenantId, id);
    if (!existing) return err("Không tìm thấy tài liệu");

    await db.delete(documents).where(eq(documents.id, id));
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Không thể xóa tài liệu");
  }
}
