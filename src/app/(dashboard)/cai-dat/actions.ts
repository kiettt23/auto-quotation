"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";
import {
  companyInfoSchema,
  quoteTemplateSchema,
  defaultsSchema,
  categorySchema,
  unitSchema,
} from "@/lib/validations/settings-schemas";

// ─── Settings ───────────────────────────────────────────

export async function updateCompanyInfo(data: unknown) {
  const parsed = companyInfoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dữ liệu không hợp lệ" };
  }
  try {
    await db.settings.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });
    revalidatePath("/cai-dat");
    return { success: true };
  } catch {
    return { error: "Lỗi lưu thông tin công ty" };
  }
}

export async function updateQuoteTemplate(data: unknown) {
  const parsed = quoteTemplateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dữ liệu không hợp lệ" };
  }
  try {
    await db.settings.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });
    revalidatePath("/cai-dat");
    return { success: true };
  } catch {
    return { error: "Lỗi lưu mẫu báo giá" };
  }
}

export async function updateDefaults(data: unknown) {
  const parsed = defaultsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dữ liệu không hợp lệ" };
  }
  try {
    await db.settings.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });
    revalidatePath("/cai-dat");
    return { success: true };
  } catch {
    return { error: "Lỗi lưu cài đặt mặc định" };
  }
}

export async function uploadLogo(formData: FormData) {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) {
    return { error: "Chưa chọn file" };
  }

  // Validate file type and size
  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Chỉ chấp nhận file PNG, JPG hoặc WebP" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "File tối đa 2MB" };
  }

  // Delete old logo if exists
  const settings = await db.settings.findUnique({
    where: { id: "default" },
    select: { logoUrl: true },
  });
  if (settings?.logoUrl) {
    try {
      await del(settings.logoUrl);
    } catch {
      // Ignore delete errors (old blob may not exist)
    }
  }

  // Upload new logo
  const ext = file.name.split(".").pop() ?? "png";
  const blob = await put(`logo-${Date.now()}.${ext}`, file, {
    access: "public",
  });

  await db.settings.upsert({
    where: { id: "default" },
    update: { logoUrl: blob.url },
    create: { id: "default", logoUrl: blob.url },
  });

  revalidatePath("/cai-dat");
  return { success: true, url: blob.url };
}

// ─── Categories ─────────────────────────────────────────

export async function createCategory(name: string) {
  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) {
    return { error: "Nhập tên danh mục" };
  }
  try {
    const category = await db.category.create({
      data: { name: parsed.data.name },
    });
    revalidatePath("/cai-dat");
    return { success: true, category };
  } catch {
    return { error: "Lỗi tạo danh mục" };
  }
}

export async function updateCategory(id: string, name: string) {
  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) {
    return { error: "Nhập tên danh mục" };
  }
  try {
    await db.category.update({
      where: { id },
      data: { name: parsed.data.name },
    });
    revalidatePath("/cai-dat");
    return { success: true };
  } catch {
    return { error: "Lỗi cập nhật danh mục" };
  }
}

export async function deleteCategory(id: string) {
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return { error: `Không thể xóa: đang có ${count} sản phẩm thuộc danh mục này` };
  }
  try {
    await db.category.delete({ where: { id } });
    revalidatePath("/cai-dat");
    return { success: true };
  } catch {
    return { error: "Lỗi xóa danh mục" };
  }
}

// ─── Units ──────────────────────────────────────────────

export async function createUnit(name: string) {
  const parsed = unitSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: "Nhập tên đơn vị" };
  }
  try {
    const unit = await db.unit.create({
      data: { name: parsed.data.name },
    });
    revalidatePath("/cai-dat");
    return { success: true, unit };
  } catch {
    return { error: "Lỗi tạo đơn vị" };
  }
}

export async function updateUnit(id: string, name: string) {
  const parsed = unitSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: "Nhập tên đơn vị" };
  }
  try {
    await db.unit.update({
      where: { id },
      data: { name: parsed.data.name },
    });
    revalidatePath("/cai-dat");
    return { success: true };
  } catch {
    return { error: "Lỗi cập nhật đơn vị" };
  }
}

export async function deleteUnit(id: string) {
  const count = await db.product.count({ where: { unitId: id } });
  if (count > 0) {
    return { error: `Không thể xóa: đang có ${count} sản phẩm sử dụng đơn vị này` };
  }
  try {
    await db.unit.delete({ where: { id } });
    revalidatePath("/cai-dat");
    return { success: true };
  } catch {
    return { error: "Lỗi xóa đơn vị" };
  }
}
