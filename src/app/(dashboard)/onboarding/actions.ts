"use server";

import { z } from "zod/v4";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { ok, err } from "@/lib/result";
import { updateCompanyInfo } from "@/services/settings-service";
import { saveProduct } from "@/services/product-service";

const companyStepSchema = z.object({
  name: z.string().min(1, "Tên công ty không được để trống"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
});

const firstProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  price: z.string().regex(/^\d+(\.\d+)?$/, "Giá không hợp lệ"),
});

/** Step 1: save company name and slug */
export async function saveCompanyStep(data: { name: string; slug: string }) {
  try {
    const parsed = companyStepSchema.safeParse(data);
    if (!parsed.success) {
      return err(parsed.error.issues.map((i) => i.message).join(", "));
    }
    const ctx = await getTenantContext();
    // Update slug separately (not in CompanyInfoData), then company info
    await db.update(tenants)
      .set({ name: parsed.data.name, slug: parsed.data.slug })
      .where(eq(tenants.id, ctx.tenantId));
    await updateCompanyInfo(ctx.tenantId, { companyName: parsed.data.name });
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
    const parsed = firstProductSchema.safeParse(data);
    if (!parsed.success) {
      return err(parsed.error.issues.map((i) => i.message).join(", "));
    }
    const ctx = await getTenantContext();
    const code = parsed.data.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "-")
      .slice(0, 20);

    const result = await saveProduct(ctx.tenantId, {
      code,
      name: parsed.data.name,
      basePrice: Number(parsed.data.price),
      pricingType: "FIXED",
      description: "",
      notes: "",
      pricingTiers: [],
      volumeDiscounts: [],
    });

    if (!result.ok) return err(result.error);
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
