import type { DocumentDataItem } from "@/lib/types/document-data";
import type { ColumnDef } from "@/lib/types/column-def";
import { fmtCurrency } from "./template-props";

/** Get raw value from item — known fields or customFields */
export function getFieldValue(item: DocumentDataItem, key: string): string | number {
  const known = item as unknown as Record<string, unknown>;
  if (key in known && known[key] !== undefined) return known[key] as string | number;
  return item.customFields?.[key] ?? "";
}

/** Get formatted cell value for a column from an item */
export function getCellValue(item: DocumentDataItem, col: ColumnDef, rowIndex: number): string {
  if (col.key === "stt") return String(rowIndex + 1);
  if (col.key === "amount") return fmtCurrency((item.quantity ?? 0) * (item.unitPrice ?? 0));
  if (col.type === "currency") {
    const val = getFieldValue(item, col.key);
    return fmtCurrency(Number(val) || 0);
  }
  return String(getFieldValue(item, col.key) ?? "");
}

/** Calculate total amount from items */
export function calculateTotal(items: DocumentDataItem[]): number {
  return items.reduce(
    (sum, item) => sum + (item.amount ?? (item.quantity ?? 0) * (item.unitPrice ?? 0)),
    0
  );
}
