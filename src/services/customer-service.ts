import { db } from "@/db";
import { customers, quotes } from "@/db/schema";
import type { Customer } from "@/db/schema";
import { eq, and, or, ilike, count, desc, sql } from "drizzle-orm";
import type { CustomerFormData } from "@/lib/validations/customer-schemas";
import { escapeIlike } from "@/lib/escape-ilike";
import { ok, err } from "@/lib/result";
import type { Result } from "@/lib/result";

export type CustomerWithQuoteCount = Customer & { quoteCount: number };

type GetCustomersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

type GetCustomersResult = {
  customers: CustomerWithQuoteCount[];
  total: number;
  page: number;
  totalPages: number;
};

/**
 * Paginated customer list with optional search across name/company/phone/email.
 */
export async function getCustomers(
  tenantId: string,
  params: GetCustomersParams
): Promise<GetCustomersResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const searchFilter = params.search
    ? or(
        ilike(customers.name, `%${escapeIlike(params.search)}%`),
        ilike(customers.company, `%${escapeIlike(params.search)}%`),
        ilike(customers.phone, `%${escapeIlike(params.search)}%`),
        ilike(customers.email, `%${escapeIlike(params.search)}%`)
      )
    : undefined;

  const baseWhere = searchFilter
    ? and(eq(customers.tenantId, tenantId), searchFilter)
    : eq(customers.tenantId, tenantId);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: customers.id,
        tenantId: customers.tenantId,
        name: customers.name,
        company: customers.company,
        phone: customers.phone,
        email: customers.email,
        address: customers.address,
        notes: customers.notes,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        quoteCount: sql<number>`cast(count(${quotes.id}) as int)`,
      })
      .from(customers)
      .leftJoin(quotes, eq(quotes.customerId, customers.id))
      .where(baseWhere)
      .groupBy(customers.id)
      .orderBy(desc(customers.updatedAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(customers)
      .where(baseWhere),
  ]);

  return {
    customers: rows as CustomerWithQuoteCount[],
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Top-10 search for combobox in quote builder. Searches name and company.
 */
export async function searchCustomers(
  tenantId: string,
  query: string
): Promise<Customer[]> {
  if (!query.trim()) return [];

  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tenantId),
        or(
          ilike(customers.name, `%${escapeIlike(query)}%`),
          ilike(customers.company, `%${escapeIlike(query)}%`)
        )
      )
    )
    .orderBy(desc(customers.updatedAt))
    .limit(10);
}

/**
 * Fetch single customer by id, tenant-scoped.
 */
export async function getCustomerById(
  tenantId: string,
  id: string
): Promise<Customer | null> {
  const [row] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
    .limit(1);

  return row ?? null;
}

/**
 * Create or update a customer. If id is provided, performs an update with tenantId guard.
 */
export async function saveCustomer(
  tenantId: string,
  data: CustomerFormData,
  id?: string
): Promise<Result<Customer>> {
  try {
    const payload = {
      name: data.name,
      company: data.company ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      address: data.address ?? "",
      notes: data.notes ?? "",
    };

    if (id) {
      const [updated] = await db
        .update(customers)
        .set({ ...payload, updatedAt: new Date() })
        .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
        .returning();

      if (!updated) return err("Không tìm thấy khách hàng");
      return ok(updated);
    }

    const [created] = await db
      .insert(customers)
      .values({ ...payload, tenantId })
      .returning();

    return ok(created);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi lưu khách hàng");
  }
}

/**
 * Delete customer. Rejects if the customer has any associated quotes.
 */
export async function deleteCustomer(
  tenantId: string,
  id: string
): Promise<Result<void>> {
  try {
    const [{ quoteCount }] = await db
      .select({ quoteCount: count() })
      .from(quotes)
      .where(and(eq(quotes.customerId, id), eq(quotes.tenantId, tenantId)));

    if (quoteCount > 0) {
      return err("Không thể xoá khách hàng đang có báo giá");
    }

    await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)));

    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi xoá khách hàng");
  }
}
