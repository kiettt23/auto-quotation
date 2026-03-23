import { db } from "@/db";
import { document } from "@/db/schema";
import { eq, and, isNull, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";
import { getTemplateEntry } from "@/lib/pdf/template-registry";

export type DocumentRow = typeof document.$inferSelect;

/** List documents for a user (excluding soft-deleted) */
export async function listDocuments(userId: string) {
  return db
    .select()
    .from(document)
    .where(and(eq(document.userId, userId), isNull(document.deletedAt)))
    .orderBy(desc(document.createdAt));
}

/** List recent documents (limit) */
export async function listRecentDocuments(userId: string, limit = 5) {
  return db
    .select()
    .from(document)
    .where(and(eq(document.userId, userId), isNull(document.deletedAt)))
    .orderBy(desc(document.createdAt))
    .limit(limit);
}

/** Get single document by ID with user ownership check */
export async function getDocumentById(documentId: string, userId: string) {
  const rows = await db
    .select()
    .from(document)
    .where(
      and(
        eq(document.id, documentId),
        eq(document.userId, userId),
        isNull(document.deletedAt)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Generate next document number using shortLabel from template, scoped to companyId */
async function generateDocumentNumber(
  companyId: string,
  shortLabel: string
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${shortLabel}-${year}-%`;

  const [result] = await db
    .select({
      maxNum: sql<string>`max(substring(${document.documentNumber} from '\\d+$'))`,
    })
    .from(document)
    .where(
      and(
        eq(document.companyId, companyId),
        like(document.documentNumber, pattern)
      )
    );

  const nextNum = (parseInt(result?.maxNum ?? "0", 10) || 0) + 1;
  return `${shortLabel}-${year}-${String(nextNum).padStart(3, "0")}`;
}

/** Create a new document */
export async function createDocument(
  userId: string,
  data: {
    companyId: string;
    templateId: string;
    customerId?: string;
    data: Record<string, unknown>;
  }
) {
  const id = generateId();
  const template = getTemplateEntry(data.templateId);
  const shortLabel = template?.shortLabel ?? "DOC";
  const documentNumber = await generateDocumentNumber(data.companyId, shortLabel);
  const [row] = await db
    .insert(document)
    .values({
      id,
      userId,
      companyId: data.companyId,
      customerId: data.customerId,
      templateId: data.templateId,
      documentNumber,
      data: data.data,
    })
    .returning();

  return row;
}

/** Update document with user ownership check */
export async function updateDocument(
  documentId: string,
  userId: string,
  data: {
    companyId?: string;
    customerId?: string;
    data?: Record<string, unknown>;
  }
) {
  const [row] = await db
    .update(document)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(document.id, documentId), eq(document.userId, userId)))
    .returning();

  return row;
}

/** Soft-delete document with user ownership check */
export async function deleteDocument(documentId: string, userId: string) {
  const [row] = await db
    .update(document)
    .set({ deletedAt: new Date() })
    .where(and(eq(document.id, documentId), eq(document.userId, userId)))
    .returning();

  return row;
}

/** Duplicate a document */
export async function duplicateDocument(
  documentId: string,
  userId: string
) {
  const original = await getDocumentById(documentId, userId);
  if (!original) return null;

  return createDocument(userId, {
    companyId: original.companyId,
    templateId: original.templateId,
    customerId: original.customerId ?? undefined,
    data: original.data as Record<string, unknown>,
  });
}
