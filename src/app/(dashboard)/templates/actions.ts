"use server";

// Stub actions for templates route — full implementation in a future phase
import { err } from "@/lib/result";

export async function createDocTemplate(_data: {
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
  return err("Tính năng mẫu chứng từ chưa được triển khai");
}

export async function updateDocTemplate(
  _id: string,
  _data: {
    name?: string;
    description?: string;
    placeholders?: unknown;
    tableRegion?: unknown;
    docPrefix?: string;
    docNextNumber?: number;
  }
) {
  return err("Tính năng mẫu chứng từ chưa được triển khai");
}

export async function deleteDocTemplate(_id: string) {
  return err("Tính năng mẫu chứng từ chưa được triển khai");
}
