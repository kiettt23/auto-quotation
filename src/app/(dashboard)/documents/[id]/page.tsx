import { notFound } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { getDocumentById } from "@/services/document-service";
import { DocEntryFormPage } from "@/components/doc-entry/doc-entry-form-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditDocumentPage({ params }: Props) {
  const { id } = await params;
  const { tenantId } = await getTenantContext();
  const doc = await getDocumentById(tenantId, id);

  if (!doc) notFound();

  return (
    <DocEntryFormPage
      template={{
        id: doc.template.id,
        name: doc.template.name,
        description: doc.template.description,
        fileType: doc.template.fileType,
        placeholders: doc.template.placeholders as never,
        tableRegion: doc.template.tableRegion as never,
        presetId: doc.template.presetId,
      }}
      entry={{
        id: doc.id,
        templateId: doc.templateId,
        docNumber: doc.docNumber,
        fieldData: doc.fieldData as never,
        tableRows: doc.tableRows as never,
      }}
    />
  );
}
