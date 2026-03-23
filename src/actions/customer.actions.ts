"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/get-user-id";
import { customerFormSchema } from "@/lib/validations/customer.schema";
import * as customerService from "@/services/customer.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

function parseFormData(formData: FormData) {
  const customDataRaw = formData.get("customData") as string | null;
  return customerFormSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    taxCode: formData.get("taxCode") || undefined,
    deliveryName: formData.get("deliveryName") || undefined,
    deliveryAddress: formData.get("deliveryAddress") || undefined,
    receiverName: formData.get("receiverName") || undefined,
    receiverPhone: formData.get("receiverPhone") || undefined,
    customData: customDataRaw ? JSON.parse(customDataRaw) : undefined,
  });
}

export async function createCustomerAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = parseFormData(formData);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const customer = await customerService.createCustomer(userId, parsed.data);
    revalidatePath("/customers");
    return ok({ id: customer.id });
  } catch {
    return err("Không thể tạo khách hàng.");
  }
}

export async function updateCustomerAction(
  customerId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = parseFormData(formData);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const customer = await customerService.updateCustomer(userId, customerId, parsed.data);
    if (!customer) return err("Không tìm thấy khách hàng.");
    revalidatePath("/customers");
    return ok({ id: customer.id });
  } catch {
    return err("Không thể cập nhật khách hàng.");
  }
}

export async function duplicateCustomerAction(
  customerId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const customer = await customerService.duplicateCustomer(userId, customerId);
    if (!customer) return err("Không tìm thấy khách hàng gốc.");
    revalidatePath("/customers");
    return ok({ id: customer.id });
  } catch {
    return err("Không thể sao chép khách hàng.");
  }
}

export async function deleteCustomerAction(
  customerId: string
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await customerService.deleteCustomer(userId, customerId);
    revalidatePath("/customers");
    return ok(undefined);
  } catch {
    return err("Không thể xóa khách hàng.");
  }
}
