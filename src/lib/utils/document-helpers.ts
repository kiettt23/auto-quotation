import type { DocumentType } from "@/db/schema/document";

/** Map document type to display info */
export const documentTypeConfig: Record<
  DocumentType,
  { label: string; prefix: string; badgeBg: string; badgeText: string; dotColor: string }
> = {
  QUOTATION: {
    label: "Báo giá",
    prefix: "BG",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
    dotColor: "bg-indigo-500",
  },
  WAREHOUSE_EXPORT: {
    label: "Phiếu xuất kho",
    prefix: "PXK",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    dotColor: "bg-amber-500",
  },
  DELIVERY_ORDER: {
    label: "Phiếu giao hàng",
    prefix: "PGH",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
    dotColor: "bg-emerald-500",
  },
};

/** Calculate total from document items */
export function calculateTotal(
  items: Array<{ quantity?: number; unitPrice?: number; amount?: number }>
): number {
  return items.reduce((sum, item) => sum + (item.amount ?? (item.quantity ?? 0) * (item.unitPrice ?? 0)), 0);
}

/** Format currency VND */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

/** Format date to Vietnamese locale */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("vi-VN");
}
