/**
 * Template service — CRUD for document templates scoped to a tenant.
 * No "use server" here — plain async functions called from actions or route handlers.
 */

import { db } from "@/db";
import { documentTemplates } from "@/db/schema";
import { eq, and, asc, isNull } from "drizzle-orm";
import { ok, err } from "@/lib/result";
import type { Result } from "@/lib/result";
import type { DocumentTemplate } from "@/db/schema";
import { uploadTemplateFile, deleteTemplateFile } from "@/lib/blob-storage";

// ─── Input types ─────────────────────────────────────────

export type CreateTemplateInput = {
  name: string;
  description?: string;
  fileType: "excel" | "pdf";
  fileBase64: string;
  sheetName?: string;
  placeholders: unknown;
  tableRegion?: unknown;
  docPrefix?: string;
  docNextNumber?: number;
  presetId?: string;
};

export type UpdateTemplateInput = {
  name?: string;
  description?: string;
  placeholders?: unknown;
  tableRegion?: unknown;
  docPrefix?: string;
  docNextNumber?: number;
};

// ─── Service functions ────────────────────────────────────

export async function getTemplates(tenantId: string): Promise<DocumentTemplate[]> {
  return db.query.documentTemplates.findMany({
    where: and(eq(documentTemplates.tenantId, tenantId), isNull(documentTemplates.deletedAt)),
    orderBy: [asc(documentTemplates.createdAt)],
  });
}

export async function getTemplateById(
  tenantId: string,
  id: string
): Promise<DocumentTemplate | undefined> {
  return db.query.documentTemplates.findFirst({
    where: and(eq(documentTemplates.id, id), eq(documentTemplates.tenantId, tenantId), isNull(documentTemplates.deletedAt)),
  });
}

export async function createTemplate(
  tenantId: string,
  data: CreateTemplateInput
): Promise<Result<DocumentTemplate>> {
  try {
    // Upload file to Vercel Blob if base64 provided
    let fileUrl: string | null = null;
    if (data.fileBase64) {
      const ext = data.fileType === "pdf" ? "pdf" : "xlsx";
      const safeName = data.name.replace(/[^a-zA-Z0-9-_]/g, "_");
      fileUrl = await uploadTemplateFile(data.fileBase64, `${safeName}.${ext}`);
    }

    const [template] = await db
      .insert(documentTemplates)
      .values({
        tenantId,
        name: data.name,
        description: data.description ?? "",
        fileType: data.fileType,
        fileBase64: "", // deprecated — using fileUrl
        fileUrl,
        sheetName: data.sheetName ?? "",
        placeholders: data.placeholders ?? [],
        tableRegion: data.tableRegion ?? null,
        docPrefix: data.docPrefix ?? "DOC-{YYYY}-",
        docNextNumber: data.docNextNumber ?? 1,
        presetId: data.presetId ?? null,
      })
      .returning();
    return ok(template);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Không thể tạo mẫu tài liệu");
  }
}

export async function updateTemplate(
  tenantId: string,
  id: string,
  data: UpdateTemplateInput
): Promise<Result<DocumentTemplate>> {
  try {
    const [updated] = await db
      .update(documentTemplates)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.placeholders !== undefined && { placeholders: data.placeholders }),
        ...(data.tableRegion !== undefined && { tableRegion: data.tableRegion }),
        ...(data.docPrefix !== undefined && { docPrefix: data.docPrefix }),
        ...(data.docNextNumber !== undefined && { docNextNumber: data.docNextNumber }),
      })
      .where(and(eq(documentTemplates.id, id), eq(documentTemplates.tenantId, tenantId)))
      .returning();

    if (!updated) return err("Không tìm thấy mẫu tài liệu");
    return ok(updated);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Không thể cập nhật mẫu tài liệu");
  }
}

export async function deleteTemplate(
  tenantId: string,
  id: string
): Promise<Result<void>> {
  try {
    // Prevent deleting built-in templates
    const template = await db.query.documentTemplates.findFirst({
      where: and(eq(documentTemplates.id, id), eq(documentTemplates.tenantId, tenantId)),
    });

    if (!template) return err("Không tìm thấy mẫu tài liệu");

    // Clean up blob storage
    if (template.fileUrl) {
      deleteTemplateFile(template.fileUrl);
    }

    await db
      .update(documentTemplates)
      .set({ deletedAt: new Date() })
      .where(and(eq(documentTemplates.id, id), eq(documentTemplates.tenantId, tenantId)));

    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Không thể xóa mẫu tài liệu");
  }
}
