import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { getCompanyByOwnerId } from "@/services/company.service";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Already has company → go home
  const existing = await getCompanyByOwnerId(session.user.id);
  if (existing) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <OnboardingForm />
    </div>
  );
}
