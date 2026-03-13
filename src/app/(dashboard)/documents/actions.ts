"use server";

import { getTenantContext } from "@/lib/tenant-context";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/services/document-service";
import { revalidatePath } from "next/cache";

export async function createDocEntry(data: {
  templateId: string;
  fieldData: unknown;
  tableRows: unknown;
}) {
  const { tenantId } = await getTenantContext();
  const result = await createDocument(tenantId, data.templateId, {
    fieldData: (data.fieldData ?? {}) as Record<string, string>,
    tableRows: (data.tableRows ?? []) as Record<string, string>[],
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/documents");
  return result.value;
}

export async function updateDocEntry(
  id: string,
  data: { fieldData: unknown; tableRows: unknown }
) {
  const { tenantId } = await getTenantContext();
  const result = await updateDocument(tenantId, id, {
    fieldData: (data.fieldData ?? {}) as Record<string, string>,
    tableRows: (data.tableRows ?? []) as Record<string, string>[],
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/documents");
  return result.value;
}

export async function deleteDocEntry(id: string) {
  const { tenantId } = await getTenantContext();
  const result = await deleteDocument(tenantId, id);
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/documents");
}
