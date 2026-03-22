import { requireUserId } from "@/lib/auth/get-user-id";
import { listCategories } from "@/services/category.service";
import { listUnits } from "@/services/unit.service";
import { SettingsPageClient } from "./settings-page-client";

export default async function SettingsPage() {
  const userId = await requireUserId();

  const [categories, units] = await Promise.all([
    listCategories(userId),
    listUnits(userId),
  ]);

  return (
    <SettingsPageClient
      categories={categories}
      units={units}
    />
  );
}
