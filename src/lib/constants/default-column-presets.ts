import type { ColumnDef } from "@/lib/types/column-def";

/** Báo giá — full pricing columns */
export const QUOTATION_COLUMNS: ColumnDef[] = [
  { key: "stt", label: "STT", type: "number", width: "5%", align: "center", system: true },
  { key: "productName", label: "Sản phẩm", type: "text", width: "22%", system: true },
  { key: "specification", label: "Quy cách", type: "text", width: "13%" },
  { key: "unit", label: "ĐVT", type: "text", width: "7%", align: "center" },
  { key: "quantity", label: "SL", type: "number", width: "6%", align: "right" },
  { key: "unitPrice", label: "Đơn giá", type: "currency", width: "13%", align: "right" },
  { key: "amount", label: "Thành tiền", type: "currency", width: "15%", align: "right" },
  { key: "note", label: "Ghi chú", type: "text", width: "19%" },
];

/** Phiếu xuất kho — no pricing */
export const WAREHOUSE_EXPORT_COLUMNS: ColumnDef[] = [
  { key: "stt", label: "STT", type: "number", width: "6%", align: "center", system: true },
  { key: "productName", label: "Sản phẩm", type: "text", width: "28%", system: true },
  { key: "specification", label: "Quy cách", type: "text", width: "18%" },
  { key: "unit", label: "ĐVT", type: "text", width: "10%", align: "center" },
  { key: "quantity", label: "SL", type: "number", width: "10%", align: "right" },
  { key: "note", label: "Ghi chú", type: "text", width: "28%" },
];

/** Phiếu giao hàng — no pricing */
export const DELIVERY_ORDER_COLUMNS: ColumnDef[] = [
  { key: "stt", label: "STT", type: "number", width: "6%", align: "center", system: true },
  { key: "productName", label: "Sản phẩm", type: "text", width: "28%", system: true },
  { key: "specification", label: "Quy cách", type: "text", width: "18%" },
  { key: "unit", label: "ĐVT", type: "text", width: "10%", align: "center" },
  { key: "quantity", label: "SL", type: "number", width: "10%", align: "right" },
  { key: "note", label: "Ghi chú", type: "text", width: "28%" },
];

/** Map old type enum to default columns */
export const DEFAULT_PRESETS: Record<string, { label: string; shortLabel: string; columns: ColumnDef[]; showTotal: boolean }> = {
  QUOTATION: { label: "Báo giá", shortLabel: "BG", columns: QUOTATION_COLUMNS, showTotal: true },
  WAREHOUSE_EXPORT: { label: "Phiếu xuất kho", shortLabel: "PXK", columns: WAREHOUSE_EXPORT_COLUMNS, showTotal: false },
  DELIVERY_ORDER: { label: "Phiếu giao hàng", shortLabel: "PGH", columns: DELIVERY_ORDER_COLUMNS, showTotal: false },
};
