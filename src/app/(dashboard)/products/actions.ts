"use server";

import { revalidatePath } from "next/cache";
import { getTenantContext } from "@/lib/tenant-context";
import { ok, err } from "@/lib/result";
import type { Result } from "@/lib/result";
import { requireRole } from "@/lib/rbac";
import {
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct,
} from "@/services/product-service";
import { productFormSchema } from "@/lib/validations/product-schemas";
import type { ProductWithRelations } from "@/services/product-service";

type PaginatedProducts = {
  products: ProductWithRelations[];
  total: number;
  page: number;
  totalPages: number;
};

export async function getProductsAction(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
}): Promise<Result<PaginatedProducts>> {
  try {
    const { tenantId } = await getTenantContext();
    const result = await getProducts(tenantId, params);
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tải danh sách sản phẩm");
  }
}

export async function getProductByIdAction(
  id: string
): Promise<Result<ProductWithRelations>> {
  try {
    const { tenantId } = await getTenantContext();
    const product = await getProductById(tenantId, id);
    if (!product) return err("Không tìm thấy sản phẩm");
    return ok(product);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tải sản phẩm");
  }
}

export async function saveProductAction(
  data: unknown,
  id?: string
): Promise<Result<ProductWithRelations>> {
  try {
    const ctx = await getTenantContext();
    requireRole(ctx.role, "MEMBER");
    const { tenantId } = ctx;
    const parsed = productFormSchema.safeParse(data);
    if (!parsed.success) {
      return err("Dữ liệu không hợp lệ");
    }
    const result = await saveProduct(tenantId, parsed.data, id);
    if (!result.ok) return err(result.error);
    revalidatePath("/products");
    return ok(result.value);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi lưu sản phẩm");
  }
}

export async function deleteProductAction(id: string): Promise<Result<null>> {
  try {
    const ctx = await getTenantContext();
    requireRole(ctx.role, "MEMBER");
    const { tenantId } = ctx;
    const result = await deleteProduct(tenantId, id);
    if (!result.ok) return err(result.error);
    revalidatePath("/products");
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi xoá sản phẩm");
  }
}
