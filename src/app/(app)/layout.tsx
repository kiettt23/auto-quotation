import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { AppHeader } from "@/components/layout/app-header";
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="hidden lg:block">
        <AppHeader
          userName={session.user.name}
          userEmail={session.user.email}
        />
      </div>
      <main className="mx-auto w-full max-w-[1400px] flex-1 pb-16 lg:pb-0">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
