import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { tenantMembers, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export type TenantContext = {
  userId: string;
  tenantId: string;
  tenantSlug: string;
};

/**
 * Resolve the active tenant context from the current request session.
 * Call this in Server Components and Route Handlers that need tenant-scoped data.
 * Throws if unauthenticated or no tenant membership found.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    throw new Error("Unauthenticated");
  }

  const userId = session.user.id;

  // Find the first tenant membership for the user
  const membership = await db.query.tenantMembers.findFirst({
    where: eq(tenantMembers.userId, userId),
    with: { tenant: true },
  });

  if (!membership) {
    throw new Error("No tenant found for user");
  }

  return {
    userId,
    tenantId: membership.tenantId,
    tenantSlug: (membership as typeof membership & { tenant: { slug: string } }).tenant.slug,
  };
}
