"use server";

import { revalidatePath } from "next/cache";
import { requireCompanyId } from "@/lib/auth/get-company-id";
import { createUnit, deleteUnit } from "@/services/unit.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

export async function createUnitAction(
  name: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const companyId = await requireCompanyId();
    if (!name.trim()) return err("Tên đơn vị không được trống");
    const u = await createUnit(companyId, name.trim());
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
    const companyId = await requireCompanyId();
    await deleteUnit(companyId, unitId);
    revalidatePath("/settings");
    revalidatePath("/products");
    return ok(null);
  } catch {
    return err("Không thể xóa đơn vị. Có thể đang được sử dụng.");
  }
}
