"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations/product-schemas";
import type { Prisma } from "@/generated/prisma/client";

type GetProductsParams = {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getProducts({
  page = 1,
  pageSize = 20,
  categoryId,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetProductsParams) {
  const where: Prisma.ProductWhereInput = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  const allowedSorts = ["name", "code", "basePrice", "createdAt"];
  const orderField = allowedSorts.includes(sortBy) ? sortBy : "createdAt";

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        unit: true,
        pricingTiers: { orderBy: { minQuantity: "asc" } },
        volumeDiscounts: { orderBy: { minQuantity: "asc" } },
      },
      orderBy: { [orderField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createProduct(data: unknown) {
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dữ liệu không hợp lệ" };
  }

  const { pricingTiers, volumeDiscounts, ...productData } = parsed.data;

  // Check code uniqueness
  const existing = await db.product.findUnique({
    where: { code: productData.code },
  });
  if (existing) {
    return { error: `Mã sản phẩm "${productData.code}" đã tồn tại` };
  }

  try {
    await db.product.create({
      data: {
        ...productData,
        basePrice: productData.basePrice ?? 0,
        pricingTiers: pricingTiers?.length
          ? { create: pricingTiers }
          : undefined,
        volumeDiscounts: volumeDiscounts?.length
          ? { create: volumeDiscounts }
          : undefined,
      },
    });

    revalidatePath("/san-pham");
    return { success: true };
  } catch {
    return { error: "Lỗi tạo sản phẩm" };
  }
}

export async function updateProduct(id: string, data: unknown) {
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dữ liệu không hợp lệ" };
  }

  const { pricingTiers, volumeDiscounts, ...productData } = parsed.data;

  // Check code uniqueness (exclude self)
  const existing = await db.product.findFirst({
    where: { code: productData.code, NOT: { id } },
  });
  if (existing) {
    return { error: `Mã sản phẩm "${productData.code}" đã tồn tại` };
  }

  try {
    // Transaction: update product + replace tiers/discounts
    await db.$transaction([
      db.pricingTier.deleteMany({ where: { productId: id } }),
      db.volumeDiscount.deleteMany({ where: { productId: id } }),
      db.product.update({
        where: { id },
        data: {
          ...productData,
          basePrice: productData.basePrice ?? 0,
          pricingTiers: pricingTiers?.length
            ? { create: pricingTiers }
            : undefined,
          volumeDiscounts: volumeDiscounts?.length
            ? { create: volumeDiscounts }
            : undefined,
        },
      }),
    ]);

    revalidatePath("/san-pham");
    return { success: true };
  } catch {
    return { error: "Lỗi cập nhật sản phẩm" };
  }
}

export async function deleteProduct(id: string) {
  const quoteItemCount = await db.quoteItem.count({
    where: { productId: id },
  });
  if (quoteItemCount > 0) {
    return {
      error: `Không thể xóa: sản phẩm đang được sử dụng trong ${quoteItemCount} dòng báo giá`,
    };
  }

  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/san-pham");
    return { success: true };
  } catch {
    return { error: "Lỗi xóa sản phẩm" };
  }
}
