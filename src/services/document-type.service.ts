import { db } from "@/db";
import { documentType } from "@/db/schema/document-type";
import { eq, and, asc } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";
import type { ColumnDef } from "@/lib/types/column-def";

export type DocumentTypeRow = typeof documentType.$inferSelect;

/** List all document types for a company, ordered by sortOrder */
export async function listDocumentTypes(companyId: string) {
  return db
    .select()
    .from(documentType)
    .where(eq(documentType.companyId, companyId))
    .orderBy(asc(documentType.sortOrder));
}

/** Get a single document type by ID */
export async function getDocumentTypeById(id: string, companyId: string) {
  const rows = await db
    .select()
    .from(documentType)
    .where(and(eq(documentType.id, id), eq(documentType.companyId, companyId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Create a new document type */
export async function createDocumentType(
  companyId: string,
  data: { key: string; label: string; shortLabel: string; columns: ColumnDef[]; showTotal?: boolean; sortOrder?: number }
) {
  const id = generateId();
  const [row] = await db
    .insert(documentType)
    .values({
      id,
      companyId,
      key: data.key,
      label: data.label,
      shortLabel: data.shortLabel,
      columns: data.columns,
      showTotal: data.showTotal ?? true,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();
  return row;
}

/** Update document type (label, columns, showTotal) */
export async function updateDocumentType(
  id: string,
  companyId: string,
  data: { label?: string; shortLabel?: string; columns?: ColumnDef[]; showTotal?: boolean; sortOrder?: number; signatureLabels?: string[] }
) {
  const [row] = await db
    .update(documentType)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(documentType.id, id), eq(documentType.companyId, companyId)))
    .returning();
  return row;
}

/** Delete a document type */
export async function deleteDocumentType(id: string, companyId: string) {
  const [row] = await db
    .delete(documentType)
    .where(and(eq(documentType.id, id), eq(documentType.companyId, companyId)))
    .returning();
  return row;
}

/** Seed default document types for a new company */
export async function seedDefaultDocumentTypes(companyId: string) {
  const { DEFAULT_PRESETS } = await import("@/lib/constants/default-column-presets");
  const entries = Object.entries(DEFAULT_PRESETS);

  for (let i = 0; i < entries.length; i++) {
    const [key, preset] = entries[i];
    await createDocumentType(companyId, {
      key,
      label: preset.label,
      shortLabel: preset.shortLabel,
      columns: preset.columns,
      showTotal: preset.showTotal,
      sortOrder: i,
    });
  }
}
