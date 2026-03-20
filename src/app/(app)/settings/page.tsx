import { requireUserId } from "@/lib/auth/get-user-id";
import { listCategories } from "@/services/category.service";
import { listUnits } from "@/services/unit.service";
import { listDocumentTypes } from "@/services/document-type.service";
import { SettingsPageClient } from "./settings-page-client";

export default async function SettingsPage() {
  const userId = await requireUserId();

  const [categories, units, documentTypes] = await Promise.all([
    listCategories(userId),
    listUnits(userId),
    listDocumentTypes(userId),
  ]);

  return (
    <SettingsPageClient
      categories={categories}
      units={units}
      documentTypes={documentTypes}
    />
  );
}
