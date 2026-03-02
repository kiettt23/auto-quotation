export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export default async function SettingsPage() {
  const [settings, categories, units] = await Promise.all([
    db.settings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.unit.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Cài đặt</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cấu hình thông tin công ty, mẫu báo giá và giá trị mặc định
      </p>
      <div className="mt-6">
        <SettingsPageClient
          settings={JSON.parse(JSON.stringify(settings))}
          categories={JSON.parse(JSON.stringify(categories))}
          units={JSON.parse(JSON.stringify(units))}
        />
      </div>
    </div>
  );
}
