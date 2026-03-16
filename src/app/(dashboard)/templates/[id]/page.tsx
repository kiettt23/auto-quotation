import { notFound } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { getTemplateById } from "@/services/template-service";
import { DocTemplateBuilderPage } from "@/components/doc-template/doc-template-builder-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params;
  const { tenantId } = await getTenantContext();
  const template = await getTemplateById(tenantId, id);

  if (!template) notFound();

  return (
    <DocTemplateBuilderPage
      template={{
        id: template.id,
        name: template.name,
        description: template.description,
        sheetName: template.sheetName,
        fileType: template.fileType,
        fileBase64: template.fileBase64,
        fileUrl: template.fileUrl,
        docPrefix: template.docPrefix,
        docNextNumber: template.docNextNumber,
        placeholders: template.placeholders as never,
        tableRegion: template.tableRegion as never,
      }}
    />
  );
}
