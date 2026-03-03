"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { customerSchema } from "@/lib/validations/customer-schemas";
import type { Prisma } from "@/generated/prisma/client";

type GetCustomersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function getCustomers({
  page = 1,
  pageSize = 20,
  search,
}: GetCustomersParams) {
  const where: Prisma.CustomerWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      include: { _count: { select: { quotes: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.customer.count({ where }),
  ]);

  return {
    customers: JSON.parse(JSON.stringify(customers)),
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createCustomer(data: unknown) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  try {
    await db.customer.create({ data: parsed.data });
    revalidatePath("/khach-hang");
    return { success: true };
  } catch {
    return { error: "Lỗi tạo khách hàng" };
  }
}

export async function updateCustomer(id: string, data: unknown) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  try {
    await db.customer.update({ where: { id }, data: parsed.data });
    revalidatePath("/khach-hang");
    return { success: true };
  } catch {
    return { error: "Lỗi cập nhật khách hàng" };
  }
}

export async function deleteCustomer(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const quoteCount = await db.quote.count({ where: { customerId: id } });

    if (quoteCount > 0) {
      await db.$transaction([
        db.quote.updateMany({
          where: { customerId: id },
          data: { customerId: null },
        }),
        db.customer.delete({ where: { id } }),
      ]);
    } else {
      await db.customer.delete({ where: { id } });
    }

    revalidatePath("/khach-hang");
    return { success: true };
  } catch {
    return { error: "Lỗi xóa khách hàng" };
  }
}
