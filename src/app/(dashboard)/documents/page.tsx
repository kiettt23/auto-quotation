import { getTenantContext } from "@/lib/tenant-context";
import { getDocuments } from "@/services/document-service";
import { getTemplates } from "@/services/template-service";
import { DocEntryListClient } from "@/components/doc-entry/doc-entry-list-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ page?: string; templateId?: string; search?: string }>;
};

export default async function DocumentListPage({ searchParams }: Props) {
  const params = await searchParams;
  const { tenantId } = await getTenantContext();

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const templateId = params.templateId || undefined;
  const search = params.search || undefined;

  const [docs, templates] = await Promise.all([
    getDocuments(tenantId, {
      templateId,
      search,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
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
      <DocEntryListClient
        entries={entries}
        templates={templateOptions}
        currentPage={page}
        pageSize={PAGE_SIZE}
        currentTemplateId={templateId}
        currentSearch={search}
      />
    </div>
  );
}
