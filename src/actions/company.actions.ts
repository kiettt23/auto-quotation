"use server";

import { requireSession } from "@/lib/auth/get-session";
import {
  createCompanySchema,
  updateCompanySchema,
} from "@/lib/validations/company.schema";
import {
  createCompany,
  getCompanyByOwnerId,
  updateCompany,
} from "@/services/company.service";
import { requireCompanyId } from "@/lib/auth/get-company-id";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

export async function setupCompanyAction(
  formData: FormData
): Promise<ActionResult<{ companyId: string }>> {
  try {
    const session = await requireSession();

    // Prevent duplicate company
    const existing = await getCompanyByOwnerId(session.user.id);
    if (existing) {
      return ok({ companyId: existing.id });
    }

    const parsed = createCompanySchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      taxCode: formData.get("taxCode"),
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const company = await createCompany(session.user.id, parsed.data);
    return ok({ companyId: company.id });
  } catch {
    return err("Đã xảy ra lỗi. Vui lòng thử lại.");
  }
}

export async function updateCompanyAction(
  formData: FormData
): Promise<ActionResult<{ companyId: string }>> {
  try {
    const companyId = await requireCompanyId();

    const parsed = updateCompanySchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      taxCode: formData.get("taxCode"),
      email: formData.get("email"),
      bankName: formData.get("bankName"),
      bankAccount: formData.get("bankAccount"),
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    await updateCompany(companyId, parsed.data);
    return ok({ companyId });
  } catch {
    return err("Đã xảy ra lỗi. Vui lòng thử lại.");
  }
}
