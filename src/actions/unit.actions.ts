"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/get-user-id";
import { createUnit, deleteUnit } from "@/services/unit.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

export async function createUnitAction(
  name: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    if (!name.trim()) return err("Tên đơn vị không được trống");
    const u = await createUnit(userId, name.trim());
    revalidatePath("/settings");
    revalidatePath("/products");
    return ok({ id: u.id });
  } catch {
    return err("Không thể tạo đơn vị tính.");
  }
}

export async function deleteUnitAction(
  unitId: string
): Promise<ActionResult<null>> {
  try {
    const userId = await requireUserId();
    await deleteUnit(userId, unitId);
    revalidatePath("/settings");
    revalidatePath("/products");
    return ok(null);
  } catch {
    return err("Không thể xóa đơn vị. Có thể đang được sử dụng.");
  }
}
