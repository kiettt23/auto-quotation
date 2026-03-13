"use server";

import { db } from "@/db";
import { tenants, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { ok, err } from "@/lib/result";

/** Step 1: save company name and slug */
export async function saveCompanyStep(data: { name: string; slug: string }) {
  try {
    const ctx = await getTenantContext();
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(data.slug)) {
      return err("Slug chỉ gồm chữ thường, số và dấu gạch ngang");
    }
    await db.update(tenants)
      .set({ name: data.name, companyName: data.name, slug: data.slug })
      .where(eq(tenants.id, ctx.tenantId));
    revalidatePath("/onboarding");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi lưu thông tin công ty");
  }
}

/** Step 3: add first product (optional) — code auto-generated from name */
export async function saveFirstProduct(data: {
  name: string;
  price: string;
}) {
  try {
    const ctx = await getTenantContext();
    const code = data.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "-")
      .slice(0, 20);
    await db.insert(products).values({
      tenantId: ctx.tenantId,
      code,
      name: data.name,
      basePrice: data.price,
      pricingType: "FIXED",
    });
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi lưu sản phẩm");
  }
}

/** Mark onboarding complete and redirect to /quotes */
export async function completeOnboarding() {
  const ctx = await getTenantContext();
  await db.update(tenants)
    .set({ onboardingComplete: true })
    .where(eq(tenants.id, ctx.tenantId));
  redirect("/quotes");
}
