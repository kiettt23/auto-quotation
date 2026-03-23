import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { listCompanies } from "@/services/company.service";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Already has a company → go home
  const companies = await listCompanies(session.user.id);
  if (companies.length > 0) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <OnboardingForm />
    </div>
  );
}
