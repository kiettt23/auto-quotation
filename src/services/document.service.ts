import { db } from "@/db";
import { document, type DocumentType, type DocumentStatus } from "@/db/schema";
import { eq, and, isNull, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";

export type DocumentRow = typeof document.$inferSelect;

/** List documents for a company (excluding soft-deleted) */
export async function listDocuments(companyId: string) {
  return db
    .select()
    .from(document)
    .where(and(eq(document.companyId, companyId), isNull(document.deletedAt)))
    .orderBy(desc(document.createdAt));
}

/** List recent documents (limit) */
export async function listRecentDocuments(companyId: string, limit = 5) {
  return db
    .select()
    .from(document)
    .where(and(eq(document.companyId, companyId), isNull(document.deletedAt)))
    .orderBy(desc(document.createdAt))
    .limit(limit);
}

/** Get single document by ID */
export async function getDocumentById(documentId: string, companyId: string) {
  const rows = await db
    .select()
    .from(document)
    .where(
      and(
        eq(document.id, documentId),
        eq(document.companyId, companyId),
        isNull(document.deletedAt)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Generate next document number: BG-2026-001, PXK-2026-002, etc. */
async function generateDocumentNumber(
  companyId: string,
  type: DocumentType
): Promise<string> {
  const prefixMap: Record<DocumentType, string> = {
    QUOTATION: "BG",
    WAREHOUSE_EXPORT: "PXK",
    DELIVERY_ORDER: "PGH",
  };
  const prefix = prefixMap[type];
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-%`;

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
  return `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`;
}

/** Create a new document */
export async function createDocument(
  companyId: string,
  data: {
    type: DocumentType;
    customerId?: string;
    status?: DocumentStatus;
    data: Record<string, unknown>;
  }
) {
  const id = generateId();
  const documentNumber = await generateDocumentNumber(companyId, data.type);

  const [row] = await db
    .insert(document)
    .values({
      id,
      companyId,
      customerId: data.customerId,
      type: data.type,
      status: data.status ?? "DRAFT",
      documentNumber,
      data: data.data,
    })
    .returning();

  return row;
}

/** Update document */
export async function updateDocument(
  documentId: string,
  companyId: string,
  data: {
    customerId?: string;
    status?: DocumentStatus;
    data?: Record<string, unknown>;
  }
) {
  const [row] = await db
    .update(document)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(document.id, documentId), eq(document.companyId, companyId)))
    .returning();

  return row;
}

/** Soft-delete document */
export async function deleteDocument(documentId: string, companyId: string) {
  const [row] = await db
    .update(document)
    .set({ deletedAt: new Date() })
    .where(and(eq(document.id, documentId), eq(document.companyId, companyId)))
    .returning();

  return row;
}

/** Duplicate a document */
export async function duplicateDocument(
  documentId: string,
  companyId: string
) {
  const original = await getDocumentById(documentId, companyId);
  if (!original) return null;

  return createDocument(companyId, {
    type: original.type as DocumentType,
    customerId: original.customerId ?? undefined,
    status: "DRAFT",
    data: original.data as Record<string, unknown>,
  });
}
