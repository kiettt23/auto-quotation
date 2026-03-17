import { requireSession } from "@/lib/auth/get-session";
import { getCompanyByOwnerId } from "@/services/company.service";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await requireSession();
  const company = await getCompanyByOwnerId(session.user.id);

  if (!company) redirect("/onboarding");

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <h1 className="text-2xl font-bold text-slate-900">Cài đặt công ty</h1>
      <SettingsForm company={company} />
    </div>
  );
}
