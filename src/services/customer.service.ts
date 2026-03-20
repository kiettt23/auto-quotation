import { db } from "@/db";
import { customer } from "@/db/schema";
import { eq, and, isNull, ilike, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils/generate-id";
import { escapeLike } from "@/lib/utils/escape-like";

export type CustomerRow = typeof customer.$inferSelect;

/** List active customers for a user */
export async function listCustomers(userId: string, search?: string) {
  return db
    .select()
    .from(customer)
    .where(
      and(
        eq(customer.userId, userId),
        isNull(customer.deletedAt),
        search ? ilike(customer.name, `%${escapeLike(search)}%`) : undefined
      )
    )
    .orderBy(desc(customer.createdAt));
}

/** Get single customer by ID */
export async function getCustomerById(userId: string, customerId: string) {
  const rows = await db
    .select()
    .from(customer)
    .where(
      and(
        eq(customer.id, customerId),
        eq(customer.userId, userId),
        isNull(customer.deletedAt)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Create a new customer */
export async function createCustomer(
  userId: string,
  data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxCode?: string;
    deliveryName?: string;
    deliveryAddress?: string;
    receiverName?: string;
    receiverPhone?: string;
  }
) {
  const id = generateId();
  const [row] = await db
    .insert(customer)
    .values({ id, userId, ...data })
    .returning();

  return row;
}

/** Update a customer */
export async function updateCustomer(
  userId: string,
  customerId: string,
  data: Partial<Omit<typeof customer.$inferInsert, "id" | "userId" | "createdAt">>
) {
  const [row] = await db
    .update(customer)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(customer.id, customerId), eq(customer.userId, userId)))
    .returning();

  return row;
}

/** Soft-delete a customer */
export async function deleteCustomer(userId: string, customerId: string) {
  const [row] = await db
    .update(customer)
    .set({ deletedAt: new Date() })
    .where(and(eq(customer.id, customerId), eq(customer.userId, userId)))
    .returning();

  return row;
}
