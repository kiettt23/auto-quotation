import { redirect } from "next/navigation";
import { getDocTemplate } from "../../mau-chung-tu/actions";
import { DocEntryFormPage } from "@/components/doc-entry/doc-entry-form-page";

export default async function CreateDocEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const { templateId } = await searchParams;
  if (!templateId) redirect("/chung-tu");

  const template = await getDocTemplate(templateId);
  if (!template) redirect("/chung-tu");

  return <DocEntryFormPage template={template} />;
}
