"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/get-user-id";
import { createCategory, deleteCategory } from "@/services/category.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

export async function createCategoryAction(
  name: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    if (!name.trim()) return err("Tên danh mục không được trống");
    const cat = await createCategory(userId, name.trim());
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
    const userId = await requireUserId();
    await deleteCategory(userId, categoryId);
    revalidatePath("/settings");
    revalidatePath("/products");
    return ok(null);
  } catch {
    return err("Không thể xóa danh mục. Có thể đang được sử dụng.");
  }
}
