"use server";

import { revalidatePath } from "next/cache";
import { getTenantContext } from "@/lib/tenant-context";
import { ok, err } from "@/lib/result";
import { requireRole } from "@/lib/rbac";
import { quoteFormSchema } from "@/lib/validations/quote-schemas";
import * as quoteService from "@/services/quote-service";
import * as customerService from "@/services/customer-service";
import * as productService from "@/services/product-service";

export async function getQuotes(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  customerId?: string;
  sort?: string;
}) {
  try {
    const ctx = await getTenantContext();
    const result = await quoteService.getQuotes(ctx.tenantId, params);
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tải danh sách báo giá");
  }
}

export async function getQuoteForEdit(id: string) {
  try {
    const ctx = await getTenantContext();
    const quote = await quoteService.getQuoteById(ctx.tenantId, id);
    if (!quote) return ok(null);
    return ok(quote);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tải báo giá");
  }
}

export async function saveQuote(data: unknown, quoteId?: string) {
  const parsed = quoteFormSchema.safeParse(data);
  if (!parsed.success) return err("Dữ liệu không hợp lệ");

  try {
    const ctx = await getTenantContext();
    requireRole(ctx.role, "MEMBER");
    const result = await quoteService.saveQuote(ctx.tenantId, parsed.data, quoteId);
    revalidatePath("/quotes");
    revalidatePath("/");
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi lưu báo giá");
  }
}

export async function deleteQuote(quoteId: string) {
  try {
    const ctx = await getTenantContext();
    requireRole(ctx.role, "MEMBER");
    await quoteService.deleteQuote(ctx.tenantId, quoteId);
    revalidatePath("/quotes");
    revalidatePath("/");
    return ok(true);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi xóa báo giá");
  }
}

export async function cloneQuote(quoteId: string) {
  try {
    const ctx = await getTenantContext();
    requireRole(ctx.role, "MEMBER");
    const result = await quoteService.cloneQuote(ctx.tenantId, quoteId);
    revalidatePath("/quotes");
    revalidatePath("/");
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi nhân bản báo giá");
  }
}

export async function updateQuoteStatus(
  quoteId: string,
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED"
) {
  try {
    const ctx = await getTenantContext();
    requireRole(ctx.role, "MEMBER");
    await quoteService.updateQuoteStatus(ctx.tenantId, quoteId, status);
    revalidatePath("/quotes");
    revalidatePath("/");
    return ok(true);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi cập nhật trạng thái");
  }
}

export async function generateShareLink(quoteId: string) {
  try {
    const ctx = await getTenantContext();
    const token = await quoteService.generateShareLink(ctx.tenantId, quoteId);
    return ok({ token });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tạo link chia sẻ");
  }
}

export async function searchProducts(query: string) {
  try {
    const ctx = await getTenantContext();
    const results = await productService.searchProducts(ctx.tenantId, query);
    return ok(results);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tìm sản phẩm");
  }
}

export async function searchCustomers(query: string) {
  try {
    const ctx = await getTenantContext();
    const results = await customerService.searchCustomers(ctx.tenantId, query);
    return ok(results);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tìm khách hàng");
  }
}
