/**
 * Quote service — Drizzle-based CRUD for quotes and quote items.
 * All functions are tenant-scoped. Totals always recalculated server-side.
 */
import { db } from "@/db";
import { quotes, quoteItems, tenants } from "@/db/schema";
import type { Quote, QuoteItem, Tenant } from "@/db/schema";
import { eq, and, or, ilike, count, desc, asc, sql } from "drizzle-orm";
import { generateDocNumber } from "@/lib/generate-doc-number";
import { calculateQuoteTotals, calculateLineTotal } from "@/lib/pricing-engine";
import type { QuoteFormData } from "@/lib/validations/quote-schemas";

export type QuoteWithItems = Quote & { items: QuoteItem[] };
export type QuoteWithItemsAndTenant = QuoteWithItems & { tenant: Tenant };

type GetQuotesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  customerId?: string;
  sort?: string;
};

type GetQuotesResult = {
  quotes: Quote[];
  total: number;
  page: number;
  totalPages: number;
};

export async function getQuotes(
  tenantId: string,
  params: GetQuotesParams
): Promise<GetQuotesResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(quotes.tenantId, tenantId)];

  if (params.status && params.status !== "all") {
    conditions.push(eq(quotes.status, params.status as Quote["status"]));
  }

  if (params.customerId) {
    conditions.push(eq(quotes.customerId, params.customerId));
  }

  const searchFilter = params.search
    ? or(
        ilike(quotes.quoteNumber, `%${params.search}%`),
        ilike(quotes.customerName, `%${params.search}%`),
        ilike(quotes.customerCompany, `%${params.search}%`)
      )
    : undefined;

  const where = searchFilter
    ? and(...conditions, searchFilter)
    : and(...conditions);

  // Determine sort order
  let orderBy;
  switch (params.sort) {
    case "quoteNumber": orderBy = asc(quotes.quoteNumber); break;
    case "customerName": orderBy = asc(quotes.customerName); break;
    case "total": orderBy = desc(quotes.total); break;
    case "status": orderBy = asc(quotes.status); break;
    default: orderBy = desc(quotes.createdAt);
  }

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(quotes).where(where).orderBy(orderBy).limit(pageSize).offset(offset),
    db.select({ total: count() }).from(quotes).where(where),
  ]);

  return {
    quotes: rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getQuoteById(
  tenantId: string,
  id: string
): Promise<QuoteWithItems | null> {
  const quote = await db.query.quotes.findFirst({
    where: and(eq(quotes.id, id), eq(quotes.tenantId, tenantId)),
    with: { items: { orderBy: [asc(quoteItems.sortOrder)] } },
  });
  return quote ?? null;
}

export async function getQuoteByShareToken(
  token: string
): Promise<QuoteWithItemsAndTenant | null> {
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.shareToken, token),
    with: {
      items: { orderBy: [asc(quoteItems.sortOrder)] },
      tenant: true,
    },
  });
  return (quote as QuoteWithItemsAndTenant) ?? null;
}

export async function saveQuote(
  tenantId: string,
  data: QuoteFormData,
  quoteId?: string
): Promise<{ id: string }> {
  // Server-side recalculation of all totals
  const itemsWithTotals = data.items.map((item, i) => ({
    productId: item.productId ?? null,
    name: item.name,
    description: item.description ?? "",
    unit: item.unit ?? "",
    quantity: item.quantity,
    unitPrice: String(item.unitPrice),
    discountPercent: String(item.discountPercent),
    lineTotal: String(calculateLineTotal(item.unitPrice, item.quantity, item.discountPercent)),
    isCustomItem: item.isCustomItem ? "true" : "false",
    sortOrder: item.sortOrder ?? i,
  }));

  const totals = calculateQuoteTotals(
    data.items.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity, discountPercent: i.discountPercent })),
    data.globalDiscountPercent,
    data.vatPercent,
    data.shippingFee,
    data.otherFees
  );

  if (quoteId) {
    // Update existing quote
    await db.transaction(async (tx) => {
      await tx.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));
      await tx.update(quotes)
        .set({
          customerId: data.customerId ?? null,
          customerName: data.customerName,
          customerCompany: data.customerCompany,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          customerAddress: data.customerAddress,
          globalDiscountPercent: String(data.globalDiscountPercent),
          vatPercent: String(data.vatPercent),
          shippingFee: String(data.shippingFee),
          otherFees: String(data.otherFees),
          otherFeesLabel: data.otherFeesLabel,
          notes: data.notes,
          terms: data.terms,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          subtotal: String(totals.subtotal),
          discountAmount: String(totals.discountAmount),
          vatAmount: String(totals.vatAmount),
          total: String(totals.total),
          updatedAt: new Date(),
        })
        .where(and(eq(quotes.id, quoteId), eq(quotes.tenantId, tenantId)));

      if (itemsWithTotals.length > 0) {
        await tx.insert(quoteItems).values(
          itemsWithTotals.map((item) => ({ ...item, quoteId }))
        );
      }
    });
    return { id: quoteId };
  }

  // New quote: generate number and increment counter
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) throw new Error("Tenant not found");

  const quoteNumber = generateDocNumber(
    tenant.quotePrefix,
    tenant.quoteNextNumber
  );

  // Calculate validUntil from tenant defaults if not provided
  const validUntil = data.validUntil
    ? new Date(data.validUntil)
    : new Date(Date.now() + tenant.defaultValidityDays * 86400000);

  let newId: string;

  await db.transaction(async (tx) => {
    const [created] = await tx.insert(quotes).values({
      tenantId,
      quoteNumber,
      status: "DRAFT",
      customerId: data.customerId ?? null,
      customerName: data.customerName,
      customerCompany: data.customerCompany,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerAddress: data.customerAddress,
      globalDiscountPercent: String(data.globalDiscountPercent),
      vatPercent: String(data.vatPercent),
      shippingFee: String(data.shippingFee),
      otherFees: String(data.otherFees),
      otherFeesLabel: data.otherFeesLabel,
      notes: data.notes,
      terms: data.terms,
      validUntil,
      subtotal: String(totals.subtotal),
      discountAmount: String(totals.discountAmount),
      vatAmount: String(totals.vatAmount),
      total: String(totals.total),
    }).returning({ id: quotes.id });

    newId = created.id;

    if (itemsWithTotals.length > 0) {
      await tx.insert(quoteItems).values(
        itemsWithTotals.map((item) => ({ ...item, quoteId: newId }))
      );
    }

    // Increment quote next number
    await tx.update(tenants)
      .set({ quoteNextNumber: tenant.quoteNextNumber + 1 })
      .where(eq(tenants.id, tenantId));
  });

  return { id: newId! };
}

export async function cloneQuote(
  tenantId: string,
  quoteId: string
): Promise<{ id: string }> {
  const source = await getQuoteById(tenantId, quoteId);
  if (!source) throw new Error("Không tìm thấy báo giá");

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });
  if (!tenant) throw new Error("Tenant not found");

  const quoteNumber = generateDocNumber(tenant.quotePrefix, tenant.quoteNextNumber);
  let newId: string;

  await db.transaction(async (tx) => {
    const [created] = await tx.insert(quotes).values({
      tenantId,
      quoteNumber,
      status: "DRAFT",
      customerId: source.customerId,
      customerName: source.customerName,
      customerCompany: source.customerCompany,
      customerPhone: source.customerPhone,
      customerEmail: source.customerEmail,
      customerAddress: source.customerAddress,
      globalDiscountPercent: source.globalDiscountPercent,
      vatPercent: source.vatPercent,
      shippingFee: source.shippingFee,
      otherFees: source.otherFees,
      otherFeesLabel: source.otherFeesLabel,
      notes: source.notes,
      terms: source.terms,
      validUntil: source.validUntil,
      subtotal: source.subtotal,
      discountAmount: source.discountAmount,
      vatAmount: source.vatAmount,
      total: source.total,
    }).returning({ id: quotes.id });

    newId = created.id;

    if (source.items.length > 0) {
      await tx.insert(quoteItems).values(
        source.items.map((item) => ({
          quoteId: newId,
          productId: item.productId,
          name: item.name,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          lineTotal: item.lineTotal,
          isCustomItem: item.isCustomItem,
          sortOrder: item.sortOrder,
        }))
      );
    }

    await tx.update(tenants)
      .set({ quoteNextNumber: tenant.quoteNextNumber + 1 })
      .where(eq(tenants.id, tenantId));
  });

  return { id: newId! };
}

export async function deleteQuote(
  tenantId: string,
  quoteId: string
): Promise<void> {
  await db.delete(quotes)
    .where(and(eq(quotes.id, quoteId), eq(quotes.tenantId, tenantId)));
}

export async function updateQuoteStatus(
  tenantId: string,
  quoteId: string,
  status: Quote["status"]
): Promise<void> {
  await db.update(quotes)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.tenantId, tenantId)));
}

export async function generateShareLink(
  tenantId: string,
  quoteId: string
): Promise<string> {
  const token = crypto.randomUUID();
  await db.update(quotes)
    .set({ shareToken: token, updatedAt: new Date() })
    .where(and(eq(quotes.id, quoteId), eq(quotes.tenantId, tenantId)));
  return token;
}

/** Search products for quote builder (tenant-scoped) */
export async function searchProductsForQuote(tenantId: string, query: string) {
  const { products, pricingTiers: tiers, volumeDiscounts: vd, units } = await import("@/db/schema");
  const { ilike: ilikeFn, or: orFn, and: andFn, eq: eqFn, asc: ascFn } = await import("drizzle-orm");

  const where = query
    ? andFn(
        eqFn(products.tenantId, tenantId),
        orFn(
          ilikeFn(products.name, `%${query}%`),
          ilikeFn(products.code, `%${query}%`)
        )
      )
    : eqFn(products.tenantId, tenantId);

  return db.query.products.findMany({
    where,
    with: {
      unit: true,
      pricingTiers: { orderBy: [ascFn(tiers.minQuantity)] },
      volumeDiscounts: { orderBy: [ascFn(vd.minQuantity)] },
    },
    limit: 20,
  });
}

// Re-export for convenience
export { sql };
