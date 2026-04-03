import { Packer } from "docx";
import type { WordTemplateProps } from "./word-template-props";
import { buildContractAppendixDocx } from "./contract-appendix-word-template";
import { buildPaymentRequestDocx } from "./payment-request-word-template";

const wordTemplateMap: Record<string, (props: WordTemplateProps) => import("docx").Document> = {
  "contract-appendix": buildContractAppendixDocx,
  "payment-request": buildPaymentRequestDocx,
};

/** Check if a template supports Word export */
export function hasWordTemplate(templateId: string): boolean {
  return templateId in wordTemplateMap;
}

/** Generate and download a Word document */
export async function generateAndDownloadWord(
  templateId: string,
  props: WordTemplateProps,
  fileName: string,
): Promise<void> {
  const builder = wordTemplateMap[templateId];
  if (!builder) throw new Error(`No Word template for: ${templateId}`);

  const doc = builder(props);
  const blob = await Packer.toBlob(doc);

  /* Trigger browser download */
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".docx") ? fileName : `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
