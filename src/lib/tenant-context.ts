import { headers, cookies } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { tenantMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type TenantContext = {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  role: string;
};

export type TenantInfo = {
  tenantId: string;
  name: string;
  slug: string;
};

/**
 * Resolve the active tenant context from the current request session.
 * Reads `active-tenant-id` cookie; falls back to first membership.
 * Throws if unauthenticated or no tenant membership found.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    throw new Error("Unauthenticated");
  }

  const userId = session.user.id;
  const cookieStore = await cookies();
  const activeTenantId = cookieStore.get("active-tenant-id")?.value;

  // If cookie is set, verify the user is still a member of that tenant
  if (activeTenantId) {
    const membership = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.userId, userId),
        eq(tenantMembers.tenantId, activeTenantId)
      ),
      with: { tenant: true },
    });

    if (membership) {
      return {
        userId,
        tenantId: membership.tenantId,
        tenantSlug: (membership as typeof membership & { tenant: { slug: string } }).tenant.slug,
        role: membership.role,
      };
    }
    // Cookie is stale — fall through to first membership
  }

  // No valid cookie: use first membership (cookie will be set lazily via setActiveTenantCookie)
  const firstMembership = await db.query.tenantMembers.findFirst({
    where: eq(tenantMembers.userId, userId),
    with: { tenant: true },
  });

  if (!firstMembership) {
    throw new Error("No tenant found for user");
  }

  return {
    userId,
    tenantId: firstMembership.tenantId,
    tenantSlug: (firstMembership as typeof firstMembership & { tenant: { slug: string } }).tenant.slug,
    role: firstMembership.role,
  };
}

/**
 * Return all tenants a user belongs to, for the tenant switcher UI.
 */
export async function getUserTenants(userId: string): Promise<TenantInfo[]> {
  const memberships = await db.query.tenantMembers.findMany({
    where: eq(tenantMembers.userId, userId),
    with: { tenant: true },
  });

  return memberships.map((m) => {
    const t = (m as typeof m & { tenant: { id: string; name: string; slug: string } }).tenant;
    return {
      tenantId: m.tenantId,
      name: t.name,
      slug: t.slug,
    };
  });
}
