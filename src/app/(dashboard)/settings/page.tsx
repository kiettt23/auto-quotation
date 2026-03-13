import { getTenantContext } from "@/lib/tenant-context";
import * as settingsService from "@/services/settings-service";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await getTenantContext().catch(() => null);
  if (!ctx) redirect("/login");

  const [settings, categories, units] = await Promise.all([
    settingsService.getTenantSettings(ctx.tenantId),
    settingsService.getCategories(ctx.tenantId),
    settingsService.getUnits(ctx.tenantId),
  ]);

  if (!settings) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cài đặt</h1>
      <SettingsPageClient settings={settings} categories={categories} units={units} />
    </div>
  );
}
