import { db } from "@/db";
import { document, type DocumentType } from "@/db/schema";
import { documentType } from "@/db/schema/document-type";
import { eq, and, isNull, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";

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

/** Generate next document number using shortLabel from document_type, scoped to companyId */
async function generateDocumentNumber(
  companyId: string,
  shortLabel: string
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${shortLabel}-${year}-%`;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(document)
    .where(
      and(
        eq(document.companyId, companyId),
        like(document.documentNumber, pattern)
      )
    );

  const nextNum = Number(result?.count ?? 0) + 1;
  return `${shortLabel}-${year}-${String(nextNum).padStart(3, "0")}`;
}

/** Resolve shortLabel from typeId, fallback to old type enum */
async function resolveShortLabel(userId: string, typeId?: string, type?: DocumentType): Promise<string> {
  if (typeId) {
    const rows = await db
      .select({ shortLabel: documentType.shortLabel })
      .from(documentType)
      .where(and(eq(documentType.id, typeId), eq(documentType.userId, userId)))
      .limit(1);
    if (rows[0]) return rows[0].shortLabel;
  }
  // Fallback for old documents without typeId
  const prefixMap: Record<string, string> = {
    QUOTATION: "BG",
    WAREHOUSE_EXPORT: "PXK",
    DELIVERY_ORDER: "PGH",
  };
  return prefixMap[type ?? "QUOTATION"] ?? "DOC";
}

/** Create a new document */
export async function createDocument(
  userId: string,
  data: {
    companyId: string;
    typeId?: string;
    type?: DocumentType;
    customerId?: string;
    data: Record<string, unknown>;
  }
) {
  const id = generateId();
  const shortLabel = await resolveShortLabel(userId, data.typeId, data.type);
  const documentNumber = await generateDocumentNumber(data.companyId, shortLabel);

  // Determine old type field for backward compat
  let legacyType: DocumentType = "QUOTATION";
  if (data.type) {
    legacyType = data.type;
  } else if (data.typeId) {
    const rows = await db
      .select({ key: documentType.key })
      .from(documentType)
      .where(eq(documentType.id, data.typeId))
      .limit(1);
    const key = rows[0]?.key;
    if (key === "WAREHOUSE_EXPORT" || key === "DELIVERY_ORDER") legacyType = key;
    else legacyType = "QUOTATION";
  }

  const [row] = await db
    .insert(document)
    .values({
      id,
      userId,
      companyId: data.companyId,
      customerId: data.customerId,
      type: legacyType,
      typeId: data.typeId,
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
    typeId: original.typeId ?? undefined,
    type: original.type as DocumentType,
    customerId: original.customerId ?? undefined,
    data: original.data as Record<string, unknown>,
  });
}
