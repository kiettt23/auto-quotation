"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { quoteFormSchema } from "@/lib/validations/quote-schemas";
import { calculateLineTotal, calculateQuoteTotals } from "@/lib/pricing-engine";
import { generateQuoteNumber } from "@/lib/generate-quote-number";

type GetQuotesParams = {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getQuotes({
  page = 1,
  pageSize = 20,
  status,
  search,
  customerId,
  dateFrom,
  dateTo,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetQuotesParams) {
  const where: Record<string, unknown> = {};

  if (status && status !== "all") where.status = status;
  if (customerId) where.customerId = customerId;
  if (search) {
    where.OR = [
      { quoteNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerCompany: { contains: search, mode: "insensitive" } },
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
    };
  }

  const allowedSorts = ["quoteNumber", "customerName", "total", "createdAt", "status"];
  const orderField = allowedSorts.includes(sortBy) ? sortBy : "createdAt";

  const [quotes, total] = await Promise.all([
    db.quote.findMany({
      where,
      orderBy: { [orderField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.quote.count({ where }),
  ]);

  return {
    quotes: JSON.parse(JSON.stringify(quotes)),
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function searchProducts(query: string) {
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { code: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const products = await db.product.findMany({
    where,
    include: {
      category: true,
      unit: true,
      pricingTiers: { orderBy: { minQuantity: "asc" } },
      volumeDiscounts: { orderBy: { minQuantity: "asc" } },
    },
    take: 20,
    orderBy: { name: "asc" },
  });

  return JSON.parse(JSON.stringify(products));
}

export async function searchCustomers(query: string) {
  if (!query || query.length < 1) return [];

  return db.customer.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });
}

export async function getQuoteForEdit(id: string) {
  const quote = await db.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!quote) return null;
  return JSON.parse(JSON.stringify(quote));
}

export async function saveQuote(data: unknown, quoteId?: string) {
  const parsed = quoteFormSchema.safeParse(data);
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const form = parsed.data;

  // Server-side recalculation
  const itemsWithTotals = form.items.map((item) => ({
    ...item,
    lineTotal: calculateLineTotal(
      item.unitPrice,
      item.quantity,
      item.discountPercent
    ),
  }));

  const totals = calculateQuoteTotals(
    itemsWithTotals.map((i) => ({
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      discountPercent: i.discountPercent,
    })),
    form.globalDiscountPercent,
    form.vatPercent,
    form.shippingFee,
    form.otherFees
  );

  try {
    if (quoteId) {
      // Update existing quote
      await db.$transaction([
        db.quoteItem.deleteMany({ where: { quoteId } }),
        db.quote.update({
          where: { id: quoteId },
          data: {
            customerId: form.customerId || null,
            customerName: form.customerName,
            customerCompany: form.customerCompany,
            customerPhone: form.customerPhone,
            customerEmail: form.customerEmail,
            customerAddress: form.customerAddress,
            globalDiscountPercent: form.globalDiscountPercent,
            vatPercent: form.vatPercent,
            shippingFee: form.shippingFee,
            otherFees: form.otherFees,
            otherFeesLabel: form.otherFeesLabel,
            subtotal: totals.subtotal,
            discountAmount: totals.discountAmount,
            vatAmount: totals.vatAmount,
            total: totals.total,
            notes: form.notes,
            terms: form.terms,
            validUntil: new Date(form.validUntil),
            items: { create: itemsWithTotals.map(mapItem) },
          },
        }),
      ]);

      revalidatePath("/bao-gia");
      revalidatePath("/");
      return { success: true, id: quoteId };
    }

    // New quote: generate number
    const settings = await db.settings.findFirst();
    const prefix = settings?.quotePrefix ?? "BG-{YYYY}-";
    const nextNum = settings?.quoteNextNumber ?? 1;
    const quoteNumber = generateQuoteNumber(prefix, nextNum);

    const quote = await db.quote.create({
      data: {
        quoteNumber,
        status: "DRAFT",
        customerId: form.customerId || null,
        customerName: form.customerName,
        customerCompany: form.customerCompany,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        customerAddress: form.customerAddress,
        globalDiscountPercent: form.globalDiscountPercent,
        vatPercent: form.vatPercent,
        shippingFee: form.shippingFee,
        otherFees: form.otherFees,
        otherFeesLabel: form.otherFeesLabel,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        vatAmount: totals.vatAmount,
        total: totals.total,
        notes: form.notes,
        terms: form.terms,
        validUntil: new Date(form.validUntil),
        items: { create: itemsWithTotals.map(mapItem) },
      },
    });

    // Increment quote number
    if (settings) {
      await db.settings.update({
        where: { id: settings.id },
        data: { quoteNextNumber: nextNum + 1 },
      });
    }

    revalidatePath("/bao-gia");
    revalidatePath("/");
    return { success: true, id: quote.id };
  } catch {
    return { error: "Lỗi lưu báo giá" };
  }
}

export async function generateShareLink(quoteId: string) {
  try {
    const token = crypto.randomUUID();
    await db.quote.update({
      where: { id: quoteId },
      data: { shareToken: token },
    });
    return { success: true, token };
  } catch {
    return { error: "Lỗi tạo link chia sẻ" };
  }
}

export async function updateQuoteStatus(quoteId: string, status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED") {
  try {
    await db.quote.update({
      where: { id: quoteId },
      data: { status },
    });
    revalidatePath("/bao-gia");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Lỗi cập nhật trạng thái" };
  }
}

export async function cloneQuote(quoteId: string) {
  const source = await db.quote.findUnique({
    where: { id: quoteId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!source) return { error: "Không tìm thấy báo giá" };

  const settings = await db.settings.findFirst();
  const prefix = settings?.quotePrefix ?? "BG-{YYYY}-";
  const nextNum = settings?.quoteNextNumber ?? 1;
  const quoteNumber = generateQuoteNumber(prefix, nextNum);

  try {
    const quote = await db.quote.create({
      data: {
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
        subtotal: source.subtotal,
        discountAmount: source.discountAmount,
        vatAmount: source.vatAmount,
        total: source.total,
        notes: source.notes,
        terms: source.terms,
        validUntil: source.validUntil,
        items: {
          create: source.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            description: i.description,
            unit: i.unit,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discountPercent: i.discountPercent,
            lineTotal: i.lineTotal,
            isCustomItem: i.isCustomItem,
            sortOrder: i.sortOrder,
          })),
        },
      },
    });

    if (settings) {
      await db.settings.update({
        where: { id: settings.id },
        data: { quoteNextNumber: nextNum + 1 },
      });
    }

    revalidatePath("/bao-gia");
    revalidatePath("/");
    return { success: true, id: quote.id };
  } catch {
    return { error: "Lỗi nhân bản báo giá" };
  }
}

export async function deleteQuote(quoteId: string) {
  try {
    await db.$transaction([
      db.quoteItem.deleteMany({ where: { quoteId } }),
      db.quote.delete({ where: { id: quoteId } }),
    ]);
    revalidatePath("/bao-gia");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Lỗi xóa báo giá" };
  }
}

function mapItem(item: {
  productId: string | null;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
  isCustomItem: boolean;
  sortOrder: number;
}) {
  return {
    productId: item.productId || null,
    name: item.name,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPercent: item.discountPercent,
    lineTotal: item.lineTotal,
    isCustomItem: item.isCustomItem,
    sortOrder: item.sortOrder,
  };
}
