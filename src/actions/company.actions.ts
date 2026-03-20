"use server";

import { requireSession } from "@/lib/auth/get-session";
import { requireUserId } from "@/lib/auth/get-user-id";
import {
  createCompanySchema,
  updateCompanySchema,
} from "@/lib/validations/company.schema";
import {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/services/company.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";
import { seedDefaultDocumentTypes } from "@/services/document-type.service";
import { revalidatePath } from "next/cache";

export async function setupCompanyAction(
  formData: FormData
): Promise<ActionResult<{ companyId: string }>> {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const parsed = createCompanySchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      taxCode: formData.get("taxCode"),
      email: formData.get("email"),
      bankName: formData.get("bankName"),
      bankAccount: formData.get("bankAccount"),
      driverName: formData.get("driverName"),
      vehicleId: formData.get("vehicleId"),
      logoUrl: formData.get("logoUrl"),
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const company = await createCompany(userId, parsed.data);
    await seedDefaultDocumentTypes(userId);
    return ok({ companyId: company.id });
  } catch {
    return err("Đã xảy ra lỗi. Vui lòng thử lại.");
  }
}

export async function createCompanyAction(
  formData: FormData
): Promise<ActionResult<{ companyId: string }>> {
  try {
    const userId = await requireUserId();

    const parsed = createCompanySchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      taxCode: formData.get("taxCode"),
      email: formData.get("email"),
      bankName: formData.get("bankName"),
      bankAccount: formData.get("bankAccount"),
      driverName: formData.get("driverName"),
      vehicleId: formData.get("vehicleId"),
      logoUrl: formData.get("logoUrl"),
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const company = await createCompany(userId, parsed.data);
    revalidatePath("/companies");
    revalidatePath("/settings");
    return ok({ companyId: company.id });
  } catch {
    return err("Đã xảy ra lỗi. Vui lòng thử lại.");
  }
}

export async function updateCompanyAction(
  companyId: string,
  formData: FormData
): Promise<ActionResult<{ companyId: string }>> {
  try {
    const userId = await requireUserId();

    const parsed = updateCompanySchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      taxCode: formData.get("taxCode"),
      email: formData.get("email"),
      bankName: formData.get("bankName"),
      bankAccount: formData.get("bankAccount"),
      headerLayout: formData.get("headerLayout") || undefined,
      driverName: formData.get("driverName"),
      vehicleId: formData.get("vehicleId"),
      logoUrl: formData.get("logoUrl"),
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    await updateCompany(companyId, userId, parsed.data);
    revalidatePath("/companies");
    revalidatePath("/settings");
    return ok({ companyId });
  } catch {
    return err("Đã xảy ra lỗi. Vui lòng thử lại.");
  }
}

export async function deleteCompanyAction(
  companyId: string
): Promise<ActionResult<null>> {
  try {
    const userId = await requireUserId();
    await deleteCompany(companyId, userId);
    revalidatePath("/companies");
    revalidatePath("/settings");
    return ok(null);
  } catch {
    return err("Không thể xóa công ty.");
  }
}

export async function listCompaniesAction(): Promise<ActionResult<Awaited<ReturnType<typeof listCompanies>>>> {
  try {
    const userId = await requireUserId();
    const companies = await listCompanies(userId);
    return ok(companies);
  } catch {
    return err("Không thể tải danh sách công ty.");
  }
}
