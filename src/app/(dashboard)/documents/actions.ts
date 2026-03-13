"use server";

// Stub actions for documents route — full implementation in a future phase
import { ok, err } from "@/lib/result";

export async function createDocEntry(_data: {
  templateId: string;
  fieldData: unknown;
  tableRows: unknown;
}) {
  return err("Tính năng chứng từ chưa được triển khai");
}

export async function updateDocEntry(
  _id: string,
  _data: { fieldData: unknown; tableRows: unknown }
) {
  return err("Tính năng chứng từ chưa được triển khai");
}

export async function deleteDocEntry(_id: string) {
  return err("Tính năng chứng từ chưa được triển khai");
}
