import { getTenantContext } from "@/lib/tenant-context";
import { getTemplates } from "@/services/template-service";
import { DocTemplateListClient } from "@/components/doc-template/doc-template-list-client";

export const dynamic = "force-dynamic";

export default async function TemplateListPage() {
  const { tenantId } = await getTenantContext();
  const templates = await getTemplates(tenantId);

  // Normalize for client component — compute entry counts from relations if available
  const items = templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    sheetName: t.sheetName,
    fileType: t.fileType,
    placeholders: t.placeholders,
    createdAt: t.createdAt,
    _count: { entries: 0 },
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mẫu tài liệu</h1>
      <DocTemplateListClient templates={items} />
    </div>
  );
}
