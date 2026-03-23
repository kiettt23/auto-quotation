import type { ComponentType } from "react";
import type { PdfTemplateProps } from "./template-props";
import type { ColumnDef } from "@/lib/types/column-def";

/** Extra form field definition for template-specific customer inputs */
export interface ExtraFormField {
  key: string;
  label: string;
  placeholder?: string;
}

/** Color scheme for template badges in the document list */
export interface TemplateColor {
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

/** Registry entry — single source of truth for document type + PDF template */
export interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  /** Short prefix for document numbers, e.g. "BG", "PXK", "PGH" */
  shortLabel: string;
  /** Item table columns for both form and PDF */
  columns: ColumnDef[];
  /** Whether to show totals row in form and PDF */
  showTotal: boolean;
  /** Signature block labels in PDF */
  signatureLabels: string[];
  /** Badge color scheme for document list */
  color: TemplateColor;
  /** Extra customer fields shown on document form */
  extraFormFields?: ExtraFormField[];
  /** React component for PDF rendering */
  component: ComponentType<PdfTemplateProps>;
}

/** Lazy-loaded template registry — add new templates here */
const registry: TemplateEntry[] = [
  {
    id: "quotation",
    name: "Báo giá",
    description: "Layout hiện đại, bảng màu, phù hợp đa ngành",
    shortLabel: "BG",
    columns: [
      { key: "stt", label: "STT", type: "number", width: "5%", align: "center", system: true },
      { key: "productName", label: "Sản phẩm", type: "text", width: "22%", system: true },
      { key: "specification", label: "Quy cách", type: "text", width: "13%" },
      { key: "unit", label: "ĐVT", type: "text", width: "7%", align: "center" },
      { key: "quantity", label: "SL", type: "number", width: "6%", align: "right" },
      { key: "unitPrice", label: "Đơn giá", type: "currency", width: "13%", align: "right" },
      { key: "amount", label: "Thành tiền", type: "currency", width: "15%", align: "right" },
      { key: "note", label: "Ghi chú", type: "text", width: "19%" },
    ],
    showTotal: true,
    signatureLabels: ["Bên mua", "Bên bán"],
    color: { badgeBg: "bg-indigo-100", badgeText: "text-indigo-700", dotColor: "bg-indigo-500" },
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/default-template").DefaultTemplate;
    },
  },
{
    id: "delivery-order",
    name: "Phiếu giao hàng",
    description: "Layout chứng từ song ngữ, bảng viền, 5 ô ký",
    shortLabel: "PGH",
    columns: [
      { key: "stt", label: "STT", type: "text", width: "7%", align: "center", system: true },
      { key: "contractNo", label: "Hợp đồng", type: "text", width: "13%" },
      { key: "productName", label: "Tên hàng", type: "text", width: "22%", system: true },
      { key: "lotNo", label: "Số Lô", type: "text", width: "12%" },
      { key: "boxQty", label: "Số thùng/kiện", type: "number", width: "12%", align: "center" },
      { key: "netWeight", label: "Cân nặng (kg)", type: "number", width: "16%", align: "right" },
      { key: "invoiceVat", label: "Hóa đơn", type: "text", width: "18%" },
    ],
    showTotal: false,
    signatureLabels: ["Người giao", "Tài xế", "Người nhận", "Thủ kho", "Kế toán"],
    color: { badgeBg: "bg-emerald-100", badgeText: "text-emerald-700", dotColor: "bg-emerald-500" },
    extraFormFields: [
      { key: "deliveryName", label: "Tên nơi giao", placeholder: "Công Ty TNHH Kyong Gi Vina" },
      { key: "deliveryAddress", label: "Địa chỉ giao", placeholder: "Lô C, Đường N11, KCN Minh Hưng III..." },
      { key: "driverName", label: "Tên tài xế", placeholder: "Nguyễn Văn A" },
      { key: "vehicleId", label: "Số xe", placeholder: "50E-12345" },
    ],
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/jesang-delivery-template").JesangDeliveryTemplate;
    },
  },
  {
    id: "warehouse-export",
    name: "Phiếu xuất kho",
    description: "Layout chứng từ đơn giản, bảng viền, tổng số lượng kgs",
    shortLabel: "PXK",
    columns: [
      { key: "stt", label: "STT", type: "number", width: "8%", align: "center", system: true },
      { key: "productName", label: "Tên Hàng", type: "text", width: "28%", system: true },
      { key: "unit", label: "ĐVT", type: "text", width: "10%", align: "center" },
      { key: "specification", label: "Quy cách", type: "text", width: "16%" },
      { key: "quantity", label: "Tổng cộng (kg)", type: "number", width: "20%", align: "right" },
      { key: "note", label: "Ghi Chú", type: "text", width: "18%" },
    ],
    showTotal: true,
    signatureLabels: ["Thủ kho", "Tài xế", "Người nhận hàng"],
    color: { badgeBg: "bg-amber-100", badgeText: "text-amber-700", dotColor: "bg-amber-500" },
    extraFormFields: [
      { key: "vehicleId", label: "Số xe", placeholder: "50E-12345" },
    ],
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/warehouse-export-template").WarehouseExportTemplate;
    },
  },
];

/** Get all available templates (without component for serialization) */
export function getTemplateList(): Omit<TemplateEntry, "component">[] {
  return registry.map(({ component: _, ...rest }) => rest);
}

/** Get template entry by ID */
export function getTemplateEntry(templateId?: string | null): TemplateEntry | undefined {
  return registry.find((t) => t.id === templateId);
}

/** Get template entry by ID — throws if not found */
export function getTemplateById(templateId: string): TemplateEntry {
  const entry = registry.find((t) => t.id === templateId);
  if (!entry) throw new Error(`Template "${templateId}" not found`);
  return entry;
}

/** Get template component by ID — throws if not found */
export function getTemplateComponent(templateId?: string | null): ComponentType<PdfTemplateProps> {
  const entry = registry.find((t) => t.id === templateId);
  if (!entry) throw new Error(`Template "${templateId}" not found in registry`);
  return entry.component;
}

/** Get extra form fields for a template */
export function getExtraFormFields(templateId?: string | null): ExtraFormField[] {
  return registry.find((t) => t.id === templateId)?.extraFormFields ?? [];
}

/** Get columns for a template */
export function getTemplateColumns(templateId?: string | null): ColumnDef[] {
  return registry.find((t) => t.id === templateId)?.columns ?? registry[0].columns;
}

/** Built-in item fields handled by core autofill — exclude from customData dropdown */
const BUILTIN_KEYS = new Set(["stt", "productName", "specification", "unit", "quantity", "unitPrice", "amount", "note"]);

/** Get all unique custom column keys across all templates (for product customData dropdown) */
export function getAllCustomColumnKeys(): { key: string; label: string }[] {
  const seen = new Set<string>();
  const result: { key: string; label: string }[] = [];
  for (const t of registry) {
    for (const col of t.columns) {
      if (col.system || BUILTIN_KEYS.has(col.key) || seen.has(col.key)) continue;
      seen.add(col.key);
      result.push({ key: col.key, label: col.label });
    }
  }
  return result;
}
