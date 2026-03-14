import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getTenantContext, getUserTenants } from "@/lib/tenant-context";
import { db } from "@/db";
import { tenants as tenantsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// Pages that are allowed even when onboarding is incomplete
const ONBOARDING_BYPASS_PATHS = ["/onboarding", "/create-company"];

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

    // Onboarding guard: redirect to /onboarding if setup not complete
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const isBypassPath = ONBOARDING_BYPASS_PATHS.some((p) => pathname.startsWith(p));

    if (!isBypassPath) {
      const tenant = await db.query.tenants.findFirst({
        where: eq(tenantsTable.id, currentTenantId),
        columns: { onboardingComplete: true },
      });
      if (tenant && !tenant.onboardingComplete) {
        redirect("/onboarding");
      }
    }
  } catch (err) {
    // If it's a redirect (NEXT_REDIRECT), re-throw so Next.js handles it
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    const e = err as { digest?: string };
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw err;

    // No tenant found — new user needs to create their first company
    if (err instanceof Error && err.message === "No tenant found for user") {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") ?? "";
      if (!pathname.startsWith("/create-company")) {
        redirect("/create-company");
      }
    }
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
