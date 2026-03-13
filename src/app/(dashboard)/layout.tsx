import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getTenantContext } from "@/lib/tenant-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolve role for RBAC-aware sidebar; fall back gracefully if unauthenticated
  let role = "VIEWER";
  try {
    const ctx = await getTenantContext();
    role = ctx.role;
  } catch {
    // unauthenticated — middleware should handle redirect, but be defensive
  }

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <AppHeader />
        <div className="mx-auto w-full max-w-7xl px-6 py-6 pb-20 md:pb-6">
          {children}
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
