"use server";

import { revalidatePath } from "next/cache";
import { getTenantContext } from "@/lib/tenant-context";
import { ok, err } from "@/lib/result";
import * as settingsService from "@/services/settings-service";
import type {
  CompanyInfoFormData,
  BankingFormData,
  QuoteTemplateFormData,
  DefaultsFormData,
} from "@/lib/validations/settings-schemas";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function updateCompanyInfo(data: CompanyInfoFormData) {
  try {
    const ctx = await getTenantContext();
    await settingsService.updateCompanyInfo(ctx.tenantId, data);
    revalidatePath("/settings");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi cập nhật thông tin công ty");
  }
}

export async function updateBanking(data: BankingFormData) {
  try {
    const ctx = await getTenantContext();
    await settingsService.updateBanking(ctx.tenantId, data);
    revalidatePath("/settings");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi cập nhật thông tin ngân hàng");
  }
}

export async function updateQuoteTemplate(data: QuoteTemplateFormData) {
  try {
    const ctx = await getTenantContext();
    await settingsService.updateQuoteTemplate(ctx.tenantId, data);
    revalidatePath("/settings");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi cập nhật mẫu báo giá");
  }
}

export async function updateDefaults(data: DefaultsFormData) {
  try {
    const ctx = await getTenantContext();
    await settingsService.updateDefaults(ctx.tenantId, data);
    revalidatePath("/settings");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi cập nhật giá trị mặc định");
  }
}

export async function saveCategory(data: { name: string; sortOrder?: number }, id?: string) {
  try {
    const ctx = await getTenantContext();
    const result = await settingsService.saveCategory(ctx.tenantId, data, id);
    revalidatePath("/settings");
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi lưu danh mục");
  }
}

export async function deleteCategory(id: string) {
  try {
    const ctx = await getTenantContext();
    await settingsService.deleteCategory(ctx.tenantId, id);
    revalidatePath("/settings");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi xóa danh mục");
  }
}

export async function saveUnit(data: { name: string }, id?: string) {
  try {
    const ctx = await getTenantContext();
    const result = await settingsService.saveUnit(ctx.tenantId, data, id);
    revalidatePath("/settings");
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi lưu đơn vị tính");
  }
}

export async function deleteUnit(id: string) {
  try {
    const ctx = await getTenantContext();
    await settingsService.deleteUnit(ctx.tenantId, id);
    revalidatePath("/settings");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi xóa đơn vị tính");
  }
}

export async function uploadLogo(formData: FormData) {
  try {
    const ctx = await getTenantContext();
    const file = formData.get("file") as File | null;
    if (!file) return err("Không có file");

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() ?? "png";
    const filename = `logo-${ctx.tenantId}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    await settingsService.updateBranding(ctx.tenantId, { logoUrl: url });
    revalidatePath("/settings");
    return ok({ url });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tải logo");
  }
}
