import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const ctx = await getTenantContext();

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, ctx.tenantId),
  });

  if (!tenant) redirect("/");
  if (tenant.onboardingComplete) redirect("/dashboard");

  return (
    <OnboardingWizard
      defaultName={tenant.name}
      defaultSlug={tenant.slug}
    />
  );
}
