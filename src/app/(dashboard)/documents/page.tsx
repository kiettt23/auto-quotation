import { getTenantContext } from "@/lib/tenant-context";
import { getDocuments } from "@/services/document-service";
import { getTemplates } from "@/services/template-service";
import { DocEntryListClient } from "@/components/doc-entry/doc-entry-list-client";

export const dynamic = "force-dynamic";

export default async function DocumentListPage() {
  const { tenantId } = await getTenantContext();
  const [docs, templates] = await Promise.all([
    getDocuments(tenantId),
    getTemplates(tenantId),
  ]);

  const entries = docs.map((d) => ({
    id: d.id,
    docNumber: d.docNumber,
    createdAt: d.createdAt.toISOString(),
    template: { id: d.template.id, name: d.template.name },
  }));

  const templateOptions = templates.map((t) => ({
    id: t.id,
    name: t.name,
    _count: { entries: 0 },
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tài liệu</h1>
      <DocEntryListClient entries={entries} templates={templateOptions} />
    </div>
  );
}
