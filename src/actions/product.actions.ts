"use server";

import { revalidatePath } from "next/cache";
import { requireCompanyId } from "@/lib/auth/get-company-id";
import { productFormSchema } from "@/lib/validations/product.schema";
import * as productService from "@/services/product.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

export async function createProductAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const companyId = await requireCompanyId();

    const parsed = productFormSchema.safeParse({
      name: formData.get("name"),
      categoryId: formData.get("categoryId") || undefined,
      unitId: formData.get("unitId") || undefined,
      unitPrice: formData.get("unitPrice"),
      specification: formData.get("specification") || undefined,
      description: formData.get("description") || undefined,
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const product = await productService.createProduct(companyId, parsed.data);
    revalidatePath("/products");
    return ok({ id: product.id });
  } catch {
    return err("Không thể tạo sản phẩm.");
  }
}

export async function updateProductAction(
  productId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const companyId = await requireCompanyId();

    const parsed = productFormSchema.safeParse({
      name: formData.get("name"),
      categoryId: formData.get("categoryId") || undefined,
      unitId: formData.get("unitId") || undefined,
      unitPrice: formData.get("unitPrice"),
      specification: formData.get("specification") || undefined,
      description: formData.get("description") || undefined,
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const product = await productService.updateProduct(companyId, productId, parsed.data);
    revalidatePath("/products");
    return ok({ id: product.id });
  } catch {
    return err("Không thể cập nhật sản phẩm.");
  }
}

export async function deleteProductAction(
  productId: string
): Promise<ActionResult> {
  try {
    const companyId = await requireCompanyId();
    await productService.deleteProduct(companyId, productId);
    revalidatePath("/products");
    return ok(undefined);
  } catch {
    return err("Không thể xóa sản phẩm.");
  }
}
