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

/** Convert a non-negative integer to Vietnamese words */
export function numberToWordsVN(amount: number): string {
  if (amount === 0) return "Không đồng";

  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const teens = ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín"];

  function readGroup(n: number): string {
    if (n === 0) return "";
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let result = "";
    if (h > 0) result += units[h] + " trăm";
    if (t === 0 && u === 0) return result;
    if (t === 0 && h > 0) { result += " linh " + units[u]; return result; }
    if (t === 1) { result += (h > 0 ? " " : "") + teens[u]; return result; }
    result += (h > 0 ? " " : "") + units[t] + " mươi";
    if (u === 5) result += " lăm";
    else if (u === 1) result += " mốt";
    else if (u > 0) result += " " + units[u];
    return result;
  }

  const groups = [
    { divisor: 1_000_000_000, label: "tỷ" },
    { divisor: 1_000_000, label: "triệu" },
    { divisor: 1_000, label: "nghìn" },
    { divisor: 1, label: "" },
  ];

  let n = Math.round(amount);
  const parts: string[] = [];
  for (const { divisor, label } of groups) {
    const q = Math.floor(n / divisor);
    n %= divisor;
    if (q > 0) parts.push(readGroup(q) + (label ? " " + label : ""));
  }

  const result = parts.join(" ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}
