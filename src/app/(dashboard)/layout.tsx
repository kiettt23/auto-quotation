import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getTenantContext, getUserTenants } from "@/lib/tenant-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role = "VIEWER";
  let currentTenantId = "";
  let tenants: Array<{ tenantId: string; name: string; slug: string }> = [];

  try {
    const ctx = await getTenantContext();
    role = ctx.role;
    currentTenantId = ctx.tenantId;
    tenants = await getUserTenants(ctx.userId);

  } catch (err) {
    // If it's a redirect (NEXT_REDIRECT), re-throw so Next.js handles it
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    const e = err as { digest?: string };
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw err;

    // No tenant found — render with empty defaults, page will handle redirect
    // (Cannot redirect here because /create-company is in the same layout group)
  }

  return (
    <SidebarProvider>
      <AppSidebar role={role} currentTenantId={currentTenantId} tenants={tenants} />
      <SidebarInset>
        <AppHeader />
        <div className="mx-auto w-full max-w-7xl px-6 py-6 pb-20 md:pb-6">
          {children}
        </div>
      </SidebarInset>
      <MobileBottomNav role={role} />
    </SidebarProvider>
  );
}
