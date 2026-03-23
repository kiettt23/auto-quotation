import { requireUserId } from "@/lib/auth/get-user-id";
import { listCompanies } from "@/services/company.service";
import { CompanyPageClient } from "./company-page-client";

export default async function CompaniesPage() {
  const userId = await requireUserId();
  const companies = await listCompanies(userId);

  return <CompanyPageClient companies={companies} />;
}
