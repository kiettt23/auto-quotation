import { getDocEntries } from "./actions";
import { getDocTemplates } from "../mau-chung-tu/actions";
import { DocEntryListClient } from "@/components/doc-entry/doc-entry-list-client";

export default async function DocEntryListPage() {
  const [entries, templates] = await Promise.all([
    getDocEntries(),
    getDocTemplates(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chứng từ</h1>
        <p className="text-muted-foreground">
          Tạo và quản lý chứng từ từ các mẫu đã định nghĩa
        </p>
      </div>
      <DocEntryListClient entries={entries} templates={templates} />
    </div>
  );
}
