"use server";

import { getTenantContext } from "@/lib/tenant-context";
import { requireRole } from "@/lib/rbac";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/services/template-service";
import { revalidatePath } from "next/cache";

export async function createDocTemplate(data: {
  name: string;
  description?: string;
  fileBase64: string;
  sheetName?: string;
  fileType: string;
  placeholders: unknown;
  tableRegion: unknown;
  docPrefix?: string;
  docNextNumber?: number;
}) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "ADMIN");
  const { tenantId } = ctx;
  const result = await createTemplate(tenantId, {
    ...data,
    fileType: data.fileType as "excel" | "pdf",
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/templates");
  return result.value;
}

export async function updateDocTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    placeholders?: unknown;
    tableRegion?: unknown;
    docPrefix?: string;
    docNextNumber?: number;
  }
) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "ADMIN");
  const { tenantId } = ctx;
  const result = await updateTemplate(tenantId, id, data);
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/templates");
  return result.value;
}

export async function deleteDocTemplate(id: string) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "ADMIN");
  const { tenantId } = ctx;
  const result = await deleteTemplate(tenantId, id);
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/templates");
}
