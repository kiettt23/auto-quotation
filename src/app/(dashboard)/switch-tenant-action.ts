"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { tenantMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { setActiveTenantCookie } from "@/lib/tenant-cookie";

export async function switchTenantAction(tenantId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) throw new Error("Unauthenticated");

  // Verify user is member of target tenant
  const membership = await db.query.tenantMembers.findFirst({
    where: and(
      eq(tenantMembers.userId, session.user.id),
      eq(tenantMembers.tenantId, tenantId)
    ),
  });
  if (!membership) throw new Error("Not a member of this tenant");

  await setActiveTenantCookie(tenantId);
  redirect("/dashboard");
}
