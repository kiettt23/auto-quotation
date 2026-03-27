import type { ComponentType } from "react";
import type { PdfTemplateProps } from "./template-props";
import type { ColumnDef } from "@/lib/types/column-def";
import type { DocumentDataItem } from "@/lib/types/document-data";

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
  /**
   * Document number generation mode:
   * - "auto" (default): shortLabel-year-autoIncrement (e.g. BG-2026-001)
   * - "manual": prefix-date, user provides suffix (e.g. JS-260324-<input>)
   */
  numberMode?: "auto" | "manual";
  /** Prefix for manual number mode (e.g. "JS") */
  numberPrefix?: string;
  /** Show product selector dropdown in item rows (default: true) */
  showProductSelector?: boolean;
  /** Show items section at all in detail pane (default: true). Set false for letter-type templates */
  hasItems?: boolean;
  /** Default item rows seeded when creating a new document with this template */
  defaultItems?: DocumentDataItem[];
  /** Hide company detail fields (phone, email, bank, representative etc.) in detail pane */
  hideCompanyDetails?: boolean;
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
    numberMode: "manual",
    numberPrefix: "JS",
    hideCompanyDetails: true,
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
    hideCompanyDetails: true,
    color: { badgeBg: "bg-amber-100", badgeText: "text-amber-700", dotColor: "bg-amber-500" },
    extraFormFields: [
      { key: "vehicleId", label: "Số xe", placeholder: "50E-12345" },
    ],
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/warehouse-export-template").WarehouseExportTemplate;
    },
  },
  {
    id: "contract-appendix",
    name: "Phụ lục hợp đồng",
    description: "Layout hợp đồng 2 bên, bảng khoản thu, điều khoản cố định",
    shortLabel: "PLHD",
    columns: [
      { key: "label", label: "Khoản thu", type: "text", width: "60%", system: false },
      { key: "amount", label: "Số tiền (VNĐ)", type: "currency", width: "40%", align: "right" },
    ],
    showTotal: true,
    showProductSelector: false,
    defaultItems: [
      { productName: "Tiền cước Internet", customFields: { label: "Tiền cước Internet", amount: "0" } },
      { productName: "Tiền cước PayTV", customFields: { label: "Tiền cước PayTV", amount: "0" } },
      { productName: "Tiền thuê thiết bị đầu cuối", customFields: { label: "Tiền thuê thiết bị đầu cuối", amount: "0" } },
    ],
    signatureLabels: ["Đại diện bên A", "Đại diện bên B"],
    color: { badgeBg: "bg-sky-100", badgeText: "text-sky-700", dotColor: "bg-sky-500" },
    extraFormFields: [
      { key: "representative", label: "Người đại diện Bên A", placeholder: "Nguyễn Văn A" },
      { key: "position", label: "Chức vụ Bên A", placeholder: "Giám đốc" },
      { key: "installAddress", label: "Địa chỉ lắp đặt", placeholder: "1D Nguyễn Duy, Phường Gia Định..." },
      { key: "invoiceAddress", label: "Địa chỉ hóa đơn", placeholder: "1D Nguyễn Duy, Phường Gia Định..." },
      { key: "phone", label: "Điện thoại Bên A", placeholder: "0969659975" },
      { key: "fax", label: "Fax", placeholder: "" },
      { key: "bankAccount", label: "Số tài khoản Bên A", placeholder: "" },
      { key: "bankName", label: "Ngân hàng Bên A", placeholder: "" },
      { key: "taxCode", label: "Mã số thuế Bên A", placeholder: "0316142378" },
      { key: "email", label: "Email Bên A", placeholder: "" },
      { key: "contractNo", label: "Số hợp đồng", placeholder: "SGAAV3359" },
      { key: "contractDate", label: "Ngày ký HĐ", placeholder: "25/10/2022" },
      { key: "effectiveDate", label: "Ngày hiệu lực", placeholder: "10/03/2026" },
      { key: "servicePackage", label: "Gói dịch vụ", placeholder: "Meta (1000Mbps/1000Mbps)" },
      { key: "servicePriceCode", label: "Gói tính cước", placeholder: "Meta-13.0T" },
      { key: "servicePrice", label: "Giá gói dịch vụ", placeholder: "4.080.000" },
      { key: "paymentMonths", label: "Số tháng", placeholder: "13.0" },
      { key: "paymentPeriodFrom", label: "Kỳ hạn TT từ", placeholder: "10/03/2026" },
      { key: "paymentPeriodTo", label: "Kỳ hạn TT đến", placeholder: "09/04/2027" },
    ],
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/contract-appendix-template").ContractAppendixTemplate;
    },
  },
  {
    id: "payment-request",
    name: "Đề nghị thanh toán",
    description: "Layout thư đề nghị thanh toán, không có bảng sản phẩm",
    shortLabel: "DNTT",
    columns: [],
    showTotal: false,
    hasItems: false,
    showProductSelector: false,
    signatureLabels: [],
    color: { badgeBg: "bg-rose-100", badgeText: "text-rose-700", dotColor: "bg-rose-500" },
    extraFormFields: [
      { key: "refNumber", label: "Số công văn", placeholder: "SGAAV3359 / FTEL" },
      { key: "subject", label: "V/v", placeholder: "Thanh toán cước phí Internet" },
      { key: "contractNo", label: "Số hợp đồng", placeholder: "SGAAV3359" },
      { key: "contractDate", label: "Ngày ký HĐ", placeholder: "25/10/2022" },
      { key: "servicePackage", label: "Gói dịch vụ", placeholder: "FTTH - Super500" },
      { key: "periodMonths", label: "Số tháng", placeholder: "13" },
      { key: "periodFrom", label: "Từ ngày", placeholder: "10/03/2026" },
      { key: "periodTo", label: "Đến ngày", placeholder: "09/04/2027" },
      { key: "totalAmount", label: "Tổng tiền (VNĐ)", placeholder: "4.080.000" },
      { key: "amountInWords", label: "Số tiền bằng chữ", placeholder: "Bốn triệu không trăm tám mươi nghìn đồng" },
      { key: "paymentDeadline", label: "Hạn thanh toán", placeholder: "15/03/2026" },
      { key: "bankAccount", label: "Số tài khoản", placeholder: "0181002666594" },
      { key: "bankName", label: "Ngân hàng", placeholder: "Vietcombank" },
      { key: "bankBranch", label: "Chi nhánh NH", placeholder: "Nam Sài Gòn" },
      { key: "paymentContent", label: "Nội dung CK", placeholder: "SGAAV3359 _ thanh toán cước" },
    ],
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/payment-request-template").PaymentRequestTemplate;
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

/** Get template component by ID — falls back to default template */
export function getTemplateComponent(templateId?: string | null): ComponentType<PdfTemplateProps> {
  const entry = registry.find((t) => t.id === templateId) ?? registry[0];
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
