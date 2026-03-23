"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/get-user-id";
import { productFormSchema } from "@/lib/validations/product.schema";
import * as productService from "@/services/product.service";
import { ok, err, type ActionResult } from "@/lib/utils/action-result";

export async function createProductAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();

    const customDataRaw = formData.get("customData") as string | null;
    const parsed = productFormSchema.safeParse({
      name: formData.get("name"),
      categoryId: formData.get("categoryId") || undefined,
      unitId: formData.get("unitId") || undefined,
      unitPrice: formData.get("unitPrice"),
      specification: formData.get("specification") || undefined,
      description: formData.get("description") || undefined,
      customData: customDataRaw ? JSON.parse(customDataRaw) : undefined,
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const product = await productService.createProduct(userId, parsed.data);
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
    const userId = await requireUserId();

    const customDataRaw = formData.get("customData") as string | null;
    const parsed = productFormSchema.safeParse({
      name: formData.get("name"),
      categoryId: formData.get("categoryId") || undefined,
      unitId: formData.get("unitId") || undefined,
      unitPrice: formData.get("unitPrice"),
      specification: formData.get("specification") || undefined,
      description: formData.get("description") || undefined,
      customData: customDataRaw ? JSON.parse(customDataRaw) : undefined,
    });

    if (!parsed.success) {
      return err(parsed.error.issues[0].message);
    }

    const product = await productService.updateProduct(userId, productId, parsed.data);
    if (!product) return err("Không tìm thấy sản phẩm.");
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
    const userId = await requireUserId();
    await productService.deleteProduct(userId, productId);
    revalidatePath("/products");
    return ok(undefined);
  } catch {
    return err("Không thể xóa sản phẩm.");
  }
}
