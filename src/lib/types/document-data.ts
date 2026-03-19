import type { ColumnDef } from "./column-def";

/** Shape of the JSONB `data` column in the document table */
export interface DocumentData {
  /** Custom date override (dd/MM/yyyy) — if not set, uses createdAt */
  date?: string;
  customerName?: string;
  customerAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  /** Delivery-specific fields (used by delivery templates) */
  deliveryName?: string;
  deliveryAddress?: string;
  driverName?: string;
  vehicleId?: string;
  notes?: string;
  /** Per-document column override — if set, overrides document type defaults */
  columns?: ColumnDef[];
  items?: DocumentDataItem[];
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
