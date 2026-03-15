"use server";

import { getTenantContext } from "@/lib/tenant-context";
import { ok, err } from "@/lib/result";
import * as customerService from "@/services/customer-service";
import * as productService from "@/services/product-service";

/** Search customers by name/company — used by autocomplete in doc-entry forms */
export async function searchCustomers(query: string) {
  try {
    const ctx = await getTenantContext();
    const results = await customerService.searchCustomers(ctx.tenantId, query);
    return ok(results);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tìm khách hàng");
  }
}

/** Search products by name/code — used by autocomplete in doc-entry forms */
export async function searchProducts(query: string) {
  try {
    const ctx = await getTenantContext();
    const results = await productService.searchProducts(ctx.tenantId, query);
    return ok(results);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tìm sản phẩm");
  }
}
