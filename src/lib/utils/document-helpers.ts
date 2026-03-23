import type { ColumnDef } from "@/lib/types/column-def";

/** Map customData keys (human labels) to column keys via case-insensitive label matching */
export function mapCustomDataToColumnKeys(
  customData: Record<string, string | number>,
  columns: ColumnDef[],
): Record<string, string | number> {
  const labelToKey = new Map(columns.map((c) => [c.label.toLowerCase(), c.key]));
  const result: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(customData)) {
    const mapped = labelToKey.get(k.toLowerCase());
    result[mapped ?? k] = v;
  }
  return result;
}

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
