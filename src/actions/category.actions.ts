"use server";

import { revalidatePath } from "next/cache";
import { requireCompanyId } from "@/lib/auth/get-company-id";
import { createCategory, deleteCategory } from "@/services/category.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

export async function createCategoryAction(
  name: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const companyId = await requireCompanyId();
    if (!name.trim()) return err("Tên danh mục không được trống");
    const cat = await createCategory(companyId, name.trim());
    revalidatePath("/settings");
    revalidatePath("/products");
    return ok({ id: cat.id });
  } catch {
    return err("Không thể tạo danh mục.");
  }
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<ActionResult<null>> {
  try {
    const companyId = await requireCompanyId();
    await deleteCategory(companyId, categoryId);
    revalidatePath("/settings");
    revalidatePath("/products");
    return ok(null);
  } catch {
    return err("Không thể xóa danh mục. Có thể đang được sử dụng.");
  }
}
