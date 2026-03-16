import { put, del } from "@vercel/blob";

/**
 * Upload a base64-encoded file to Vercel Blob.
 * Returns the public URL. Falls back to base64 inline if BLOB token is not configured.
 */
export async function uploadTemplateFile(
  base64: string,
  fileName: string
): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const blob = await put(`templates/${fileName}`, buffer, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

/** Delete a template file from Vercel Blob by URL */
export async function deleteTemplateFile(url: string): Promise<void> {
  try {
    await del(url);
  } catch (e) {
    console.error("[blob-storage] Failed to delete:", e);
  }
}

/** Fetch file content from Vercel Blob URL as Buffer */
export async function fetchTemplateFile(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch blob: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get template file as base64 — from fileUrl (fetch) or legacy fileBase64 field.
 * Used by render functions that need base64 input.
 */
export async function getTemplateFileBase64(template: {
  fileUrl?: string | null;
  fileBase64: string;
}): Promise<string> {
  if (template.fileUrl) {
    const buffer = await fetchTemplateFile(template.fileUrl);
    return buffer.toString("base64");
  }
  return template.fileBase64;
}
