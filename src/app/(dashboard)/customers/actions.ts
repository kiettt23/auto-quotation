"use server";

import { revalidatePath } from "next/cache";
import { getTenantContext } from "@/lib/tenant-context";
import { ok, err } from "@/lib/result";
import * as customerService from "@/services/customer-service";
import type { CustomerFormData } from "@/lib/validations/customer-schemas";

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
    const ctx = await getTenantContext();
    const result = await customerService.saveCustomer(ctx.tenantId, data, id);
    revalidatePath("/customers");
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi");
  }
}

export async function deleteCustomer(id: string) {
  try {
    const ctx = await getTenantContext();
    await customerService.deleteCustomer(ctx.tenantId, id);
    revalidatePath("/customers");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi");
  }
}
