"use server";

import { revalidatePath } from "next/cache";
import { getTenantContext } from "@/lib/tenant-context";
import { ok, err } from "@/lib/result";
import { requireRole } from "@/lib/rbac";
import * as customerService from "@/services/customer-service";
import { customerFormSchema } from "@/lib/validations/customer-schemas";
import type { CustomerFormData } from "@/lib/validations/customer-schemas";
import { logAudit } from "@/lib/audit-logger";

type GetCustomersParams = {
  page?: number;
  search?: string;
};

export async function getCustomers(params: GetCustomersParams) {
  try {
    const ctx = await getTenantContext();
    return ok(await customerService.getCustomers(ctx.tenantId, params));
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi");
  }
}

export async function searchCustomers(query: string) {
  try {
    const ctx = await getTenantContext();
    return ok(await customerService.searchCustomers(ctx.tenantId, query));
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi");
  }
}

export async function saveCustomer(data: CustomerFormData, id?: string) {
  try {
    const parsed = customerFormSchema.safeParse(data);
    if (!parsed.success) {
      return err(parsed.error.issues.map((i) => i.message).join(", "));
    }
    const ctx = await getTenantContext();
    requireRole(ctx.role, "MEMBER");
    const result = await customerService.saveCustomer(ctx.tenantId, parsed.data, id);
    if (!result.ok) return err(result.error);
    logAudit({ tenantId: ctx.tenantId, userId: ctx.userId, action: id ? "customer.update" : "customer.create", resourceType: "customer", resourceId: result.value.id });
    revalidatePath("/customers");
    return ok(result.value);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi");
  }
}

export async function deleteCustomer(id: string) {
  try {
    const ctx = await getTenantContext();
    requireRole(ctx.role, "MEMBER");
    const result = await customerService.deleteCustomer(ctx.tenantId, id);
    if (!result.ok) return err(result.error);
    logAudit({ tenantId: ctx.tenantId, userId: ctx.userId, action: "customer.delete", resourceType: "customer", resourceId: id });
    revalidatePath("/customers");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi");
  }
}
