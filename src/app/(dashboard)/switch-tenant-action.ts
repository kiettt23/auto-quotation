"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { tenantMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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

  const cookieStore = await cookies();
  cookieStore.set("active-tenant-id", tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect("/dashboard");
}
