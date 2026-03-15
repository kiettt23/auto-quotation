import { db } from "@/db";
import { customers } from "@/db/schema";
import type { Customer } from "@/db/schema";
import { eq, and, or, ilike, count, desc } from "drizzle-orm";
import type { CustomerFormData } from "@/lib/validations/customer-schemas";
import { escapeIlike } from "@/lib/escape-ilike";
import { ok, err } from "@/lib/result";
import type { Result } from "@/lib/result";

// quoteCount kept as 0 — quotes workflow removed; field retained for UI compatibility
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
      .select()
      .from(customers)
      .where(baseWhere)
      .orderBy(desc(customers.updatedAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(customers)
      .where(baseWhere),
  ]);

  // quoteCount always 0 — quotes workflow removed
  const withCount: CustomerWithQuoteCount[] = rows.map((r) => ({ ...r, quoteCount: 0 }));

  return {
    customers: withCount,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Top-10 search for combobox. Searches name and company.
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
 * Create or update a customer.
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
 * Delete customer by id, tenant-scoped.
 */
export async function deleteCustomer(
  tenantId: string,
  id: string
): Promise<Result<void>> {
  try {
    await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)));

    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi xoá khách hàng");
  }
}
