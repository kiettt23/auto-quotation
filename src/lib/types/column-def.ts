/** Column definition for document item tables */
export interface ColumnDef {
  /** Unique key — system keys: "stt", "productName", "quantity", "unitPrice", "amount". Custom keys: user-defined */
  key: string;
  /** Display label shown in table header and PDF */
  label: string;
  /** Data type determines input/rendering behavior */
  type: "text" | "number" | "currency";
  /** Width percentage for PDF rendering (e.g. "15%") */
  width: string;
  /** Text alignment — defaults to "left" for text, "right" for number/currency */
  align?: "left" | "right" | "center";
  /** System columns cannot be deleted by user (STT, productName) */
  system?: boolean;
}

/** Well-known system column keys */
export const SYSTEM_COLUMN_KEYS = ["stt", "productName"] as const;

/** Well-known optional column keys (pre-defined but removable) */
export const OPTIONAL_COLUMN_KEYS = [
  "specification",
  "unit",
  "quantity",
  "unitPrice",
  "amount",
  "note",
] as const;

/** Auto-calculate column widths based on column type and count */
export function autoCalculateWidths(columns: ColumnDef[]): ColumnDef[] {
  const weights = columns.map((col) => {
    if (col.key === "stt") return 1;
    if (col.key === "productName") return 4;
    if (col.type === "number" || col.type === "currency") return 2;
    return 3;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return columns.map((col, i) => ({
    ...col,
    width: `${Math.round((weights[i] / totalWeight) * 100)}%`,
  }));
}
