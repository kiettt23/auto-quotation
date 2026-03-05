"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJson(data: unknown): any {
  return JSON.parse(JSON.stringify(data));
}

function generateDocNumber(prefix: string, nextNumber: number): string {
  const year = new Date().getFullYear().toString();
  const formatted = prefix.replace("{YYYY}", year);
  return `${formatted}${String(nextNumber).padStart(3, "0")}`;
}

export async function getDocEntries(templateId?: string) {
  return db.docEntry.findMany({
    where: templateId ? { templateId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { template: { select: { id: true, name: true, placeholders: true } } },
  });
}

export async function getDocEntry(id: string) {
  return db.docEntry.findUnique({
    where: { id },
    include: { template: true },
  });
}

export async function createDocEntry(data: {
  templateId: string;
  fieldData: Record<string, string>;
  tableRows: Record<string, string>[];
}) {
  const template = await db.docTemplate.findUniqueOrThrow({
    where: { id: data.templateId },
  });

  // Find safe next number: skip any existing doc numbers to avoid unique constraint violations
  let nextNum = template.docNextNumber;
  for (let i = 0; i < 20; i++) {
    const candidate = generateDocNumber(template.docPrefix, nextNum);
    const existing = await db.docEntry.findUnique({ where: { docNumber: candidate } });
    if (!existing) break;
    nextNum++;
  }

  const docNumber = generateDocNumber(template.docPrefix, nextNum);

  const [entry] = await db.$transaction([
    db.docEntry.create({
      data: {
        templateId: data.templateId,
        docNumber,
        fieldData: toJson(data.fieldData),
        tableRows: toJson(data.tableRows),
      },
    }),
    db.docTemplate.update({
      where: { id: data.templateId },
      data: { docNextNumber: nextNum + 1 },
    }),
  ]);

  revalidatePath("/chung-tu");
  return entry;
}

export async function updateDocEntry(
  id: string,
  data: {
    fieldData: Record<string, string>;
    tableRows: Record<string, string>[];
  }
) {
  const entry = await db.docEntry.update({
    where: { id },
    data: {
      fieldData: toJson(data.fieldData),
      tableRows: toJson(data.tableRows),
    },
  });
  revalidatePath("/chung-tu");
  return entry;
}

export async function deleteDocEntry(id: string) {
  await db.docEntry.delete({ where: { id } });
  revalidatePath("/chung-tu");
}
