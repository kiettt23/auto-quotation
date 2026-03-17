import type { DocumentType, DocumentStatus } from "@/db/schema/document";

/** Map document type to display info */
export const documentTypeConfig: Record<
  DocumentType,
  { label: string; prefix: string; badgeBg: string; badgeText: string }
> = {
  QUOTATION: {
    label: "Báo giá",
    prefix: "BG",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  WAREHOUSE_EXPORT: {
    label: "Phiếu xuất kho",
    prefix: "PXK",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
  DELIVERY_ORDER: {
    label: "Phiếu giao hàng",
    prefix: "PGH",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
  },
};

export const documentStatusConfig: Record<
  DocumentStatus,
  { label: string; badgeBg: string; badgeText: string }
> = {
  DRAFT: {
    label: "Nháp",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  FINAL: {
    label: "Hoàn tất",
    badgeBg: "bg-green-50",
    badgeText: "text-green-700",
  },
};

/** Calculate total from document items */
export function calculateTotal(
  items: Array<{ quantity: number; unitPrice: number }>
): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

/** Format currency VND */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

/** Format date to Vietnamese locale */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("vi-VN");
}
