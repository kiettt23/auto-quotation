import { requireSession } from "@/lib/auth/get-session";
import { requireCompanyId } from "@/lib/auth/get-company-id";
import { getCompanyByOwnerId } from "@/services/company.service";
import { listCategories } from "@/services/category.service";
import { listUnits } from "@/services/unit.service";
import { listDocumentTypes } from "@/services/document-type.service";
import { redirect } from "next/navigation";
import { SettingsPageClient } from "./settings-page-client";

export default async function SettingsPage() {
  const companyId = await requireCompanyId();
  const session = await requireSession();

  const [company, categories, units, documentTypes] = await Promise.all([
    getCompanyByOwnerId(session.user.id),
    listCategories(companyId),
    listUnits(companyId),
    listDocumentTypes(companyId),
  ]);

  if (!company) redirect("/onboarding");

  return (
    <SettingsPageClient
      company={company}
      categories={categories}
      units={units}
      documentTypes={documentTypes}
    />
  );
}
