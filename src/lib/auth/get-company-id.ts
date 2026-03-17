import { requireSession } from "./get-session";
import { getCompanyByOwnerId } from "@/services/company.service";

/**
 * Get companyId for the current authenticated user.
 * Use in server actions that need company scope.
 * Throws if not authenticated or no company found.
 */
export async function requireCompanyId(): Promise<string> {
  const session = await requireSession();
  const company = await getCompanyByOwnerId(session.user.id);

  if (!company) {
    throw new Error("No company found. Please complete onboarding.");
  }

  return company.id;
}
