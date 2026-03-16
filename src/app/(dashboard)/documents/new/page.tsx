import { notFound, redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { getTemplateById } from "@/services/template-service";
import { getTenantSettings } from "@/services/settings-service";
import { DocEntryFormPage } from "@/components/doc-entry/doc-entry-form-page";

type Props = {
  searchParams: Promise<{ templateId?: string }>;
};

export default async function NewDocumentPage({ searchParams }: Props) {
  const { templateId } = await searchParams;

  // Require a templateId in query — the template picker dialog provides it
  if (!templateId) redirect("/documents");

  const { tenantId } = await getTenantContext();
  const [template, tenant] = await Promise.all([
    getTemplateById(tenantId, templateId),
    getTenantSettings(tenantId),
  ]);
  if (!template) notFound();

  return (
    <DocEntryFormPage
      template={{
        id: template.id,
        name: template.name,
        description: template.description,
        fileType: template.fileType,
        placeholders: template.placeholders as never,
        tableRegion: template.tableRegion as never,
        presetId: template.presetId,
      }}
      tenantData={tenant ? {
        companyName: tenant.companyName,
        address: tenant.address,
        phone: tenant.phone,
        email: tenant.email,
        taxCode: tenant.taxCode,
        website: tenant.website,
      } : undefined}
    />
  );
}
