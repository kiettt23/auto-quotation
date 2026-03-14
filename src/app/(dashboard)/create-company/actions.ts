"use server";

import { headers, cookies } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { tenants, tenantMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";

export async function createCompanyAction(data: { name: string; slug: string }) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) throw new Error("Unauthenticated");

  // Validate slug: lowercase, alphanumeric + hyphens only
  const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug || slug.length < 3) throw new Error("Slug phải có ít nhất 3 ký tự");

  // Check slug uniqueness
  const existing = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });
  if (existing) throw new Error("Slug đã được sử dụng");

  const tenantId = createId();

  // Create tenant with defaults
  await db.insert(tenants).values({
    id: tenantId,
    name: data.name,
    slug,
    onboardingComplete: false,
    quotePrefix: "BG-{YYYY}-",
    quoteNextNumber: 1,
  });

  // Add user as OWNER
  await db.insert(tenantMembers).values({
    tenantId,
    userId: session.user.id,
    role: "OWNER",
  });

  // Switch to new tenant
  const cookieStore = await cookies();
  cookieStore.set("active-tenant-id", tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect("/onboarding");
}
