"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { Placeholder, TableRegion } from "@/lib/validations/doc-template-schemas";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJson(data: unknown): any {
  return JSON.parse(JSON.stringify(data));
}

export async function getDocTemplates() {
  return db.docTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { entries: true } } },
  });
}

export async function getDocTemplate(id: string) {
  return db.docTemplate.findUnique({ where: { id } });
}

export async function createDocTemplate(data: {
  name: string;
  description: string;
  fileBase64: string;
  sheetName: string;
  fileType?: string;
  placeholders: Placeholder[];
  tableRegion: TableRegion | null;
  docPrefix: string;
  docNextNumber: number;
}) {
  const template = await db.docTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      fileBase64: data.fileBase64,
      sheetName: data.sheetName,
      fileType: data.fileType ?? "excel",
      placeholders: toJson(data.placeholders),
      tableRegion: data.tableRegion ? toJson(data.tableRegion) : undefined,
      docPrefix: data.docPrefix,
      docNextNumber: data.docNextNumber,
    },
  });
  revalidatePath("/mau-chung-tu");
  return template;
}

export async function updateDocTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    placeholders?: Placeholder[];
    tableRegion?: TableRegion | null;
    docPrefix?: string;
    docNextNumber?: number;
  }
) {
  const template = await db.docTemplate.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.placeholders !== undefined && {
        placeholders: toJson(data.placeholders),
      }),
      ...(data.tableRegion !== undefined && {
        tableRegion: data.tableRegion ? toJson(data.tableRegion) : null,
      }),
      ...(data.docPrefix !== undefined && { docPrefix: data.docPrefix }),
      ...(data.docNextNumber !== undefined && {
        docNextNumber: data.docNextNumber,
      }),
    },
  });
  revalidatePath("/mau-chung-tu");
  return template;
}

export async function deleteDocTemplate(id: string) {
  await db.docTemplate.delete({ where: { id } });
  revalidatePath("/mau-chung-tu");
}
