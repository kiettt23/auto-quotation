import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { getCompanyByOwnerId } from "@/services/company.service";
import { CompanyProvider } from "@/lib/auth/company-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userCompany = await getCompanyByOwnerId(session.user.id);

  if (!userCompany) {
    redirect("/onboarding");
  }

  return (
    <CompanyProvider
      value={{ companyId: userCompany.id, companyName: userCompany.name }}
    >
      <div className="flex min-h-screen bg-slate-50">
        <AppSidebar />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <MobileBottomNav />
      </div>
    </CompanyProvider>
  );
}
