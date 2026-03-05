import { notFound } from "next/navigation";
import { getDocTemplate } from "../actions";
import { DocTemplateBuilderPage } from "@/components/doc-template/doc-template-builder-page";

export default async function EditDocTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getDocTemplate(id);
  if (!template) notFound();

  return <DocTemplateBuilderPage template={template} />;
}
