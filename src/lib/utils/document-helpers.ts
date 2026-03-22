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
