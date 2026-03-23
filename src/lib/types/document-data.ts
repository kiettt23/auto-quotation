import type { ColumnDef } from "./column-def";

/** Shape of the JSONB `data` column in the document table */
export interface DocumentData {
  /** Custom date override (dd/MM/yyyy) — if not set, uses createdAt */
  date?: string;
  customerName?: string;
  customerAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  notes?: string;
  /** Per-document column override — if set, overrides template defaults */
  columns?: ColumnDef[];
  items?: DocumentDataItem[];
  /**
   * Template-specific extra fields (e.g. deliveryName, driverName).
   * Nested to avoid polluting shared data fields.
   */
  templateFields?: Record<string, string>;
}

export interface DocumentDataItem {
  productId?: string;
  productName: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  note?: string;
  /** Values for user-defined custom columns, keyed by ColumnDef.key */
  customFields?: Record<string, string | number>;
}
