"use server";

import { revalidatePath } from "next/cache";
import { requireCompanyId } from "@/lib/auth/get-company-id";
import { customerFormSchema } from "@/lib/validations/customer.schema";
import * as customerService from "@/services/customer.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

function parseFormData(formData: FormData) {
  return customerFormSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    taxCode: formData.get("taxCode") || undefined,
    deliveryAddress: formData.get("deliveryAddress") || undefined,
    receiverName: formData.get("receiverName") || undefined,
    receiverPhone: formData.get("receiverPhone") || undefined,
  });
}

export async function createCustomerAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const companyId = await requireCompanyId();
    const parsed = parseFormData(formData);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const customer = await customerService.createCustomer(companyId, parsed.data);
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
    const companyId = await requireCompanyId();
    const parsed = parseFormData(formData);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const customer = await customerService.updateCustomer(companyId, customerId, parsed.data);
    revalidatePath("/customers");
    return ok({ id: customer.id });
  } catch {
    return err("Không thể cập nhật khách hàng.");
  }
}

export async function deleteCustomerAction(
  customerId: string
): Promise<ActionResult> {
  try {
    const companyId = await requireCompanyId();
    await customerService.deleteCustomer(companyId, customerId);
    revalidatePath("/customers");
    return ok(undefined);
  } catch {
    return err("Không thể xóa khách hàng.");
  }
}
