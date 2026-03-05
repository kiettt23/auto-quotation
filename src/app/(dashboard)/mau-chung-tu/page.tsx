import { getDocTemplates } from "./actions";
import { DocTemplateListClient } from "@/components/doc-template/doc-template-list-client";

export default async function DocTemplateListPage() {
  const templates = await getDocTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mẫu chứng từ</h1>
        <p className="text-muted-foreground">
          Tạo và quản lý các mẫu chứng từ linh hoạt
        </p>
      </div>
      <DocTemplateListClient templates={templates} />
    </div>
  );
}
