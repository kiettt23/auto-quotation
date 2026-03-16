"use server";

import { getTenantContext } from "@/lib/tenant-context";
import { requireRole } from "@/lib/rbac";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  duplicateDocument,
  generateShareLink,
} from "@/services/document-service";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit-logger";

export async function createDocEntry(data: {
  templateId: string;
  fieldData: unknown;
  tableRows: unknown;
}) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "MEMBER");
  const { tenantId } = ctx;
  const result = await createDocument(tenantId, data.templateId, {
    fieldData: (data.fieldData ?? {}) as Record<string, string>,
    tableRows: (data.tableRows ?? []) as Record<string, string>[],
  });
  if (!result.ok) throw new Error(result.error);
  logAudit({ tenantId, userId: ctx.userId, action: "document.create", resourceType: "document", resourceId: result.value.id });
  revalidatePath("/documents");
  return result.value;
}

export async function updateDocEntry(
  id: string,
  data: { fieldData: unknown; tableRows: unknown }
) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "MEMBER");
  const { tenantId } = ctx;
  const result = await updateDocument(tenantId, id, {
    fieldData: (data.fieldData ?? {}) as Record<string, string>,
    tableRows: (data.tableRows ?? []) as Record<string, string>[],
  });
  if (!result.ok) throw new Error(result.error);
  logAudit({ tenantId, userId: ctx.userId, action: "document.update", resourceType: "document", resourceId: id });
  revalidatePath("/documents");
  return result.value;
}

export async function shareDocEntry(id: string) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "MEMBER");
  const result = await generateShareLink(ctx.tenantId, id);
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

export async function duplicateDocEntry(id: string) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "MEMBER");
  const { tenantId } = ctx;
  const result = await duplicateDocument(tenantId, id);
  if (!result.ok) throw new Error(result.error);
  logAudit({ tenantId, userId: ctx.userId, action: "document.duplicate", resourceType: "document", resourceId: result.value.id });
  revalidatePath("/documents");
  return result.value;
}

export async function deleteDocEntry(id: string) {
  const ctx = await getTenantContext();
  requireRole(ctx.role, "MEMBER");
  const { tenantId } = ctx;
  const result = await deleteDocument(tenantId, id);
  if (!result.ok) throw new Error(result.error);
  logAudit({ tenantId, userId: ctx.userId, action: "document.delete", resourceType: "document", resourceId: id });
  revalidatePath("/documents");
}
