import type { ComponentType } from "react";
import type { PdfTemplateProps } from "./template-props";
import type { ColumnDef } from "@/lib/types/column-def";

/** Extra form field definition for template-specific customer inputs */
export interface ExtraFormField {
  key: string;
  label: string;
  placeholder?: string;
}

/** Registry entry for a PDF template */
export interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  /** Extra customer fields shown on document form when this template is active */
  extraFormFields?: ExtraFormField[];
  /** Override item table columns — if set, form uses these instead of document type columns */
  itemColumns?: ColumnDef[];
  component: ComponentType<PdfTemplateProps>;
}

/** Lazy-loaded template registry — add new templates here */
const registry: TemplateEntry[] = [
  {
    id: "default",
    name: "Mặc định",
    description: "Layout hiện đại, bảng màu, phù hợp đa ngành",
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/default-template").DefaultTemplate;
    },
  },
  {
    id: "jesang-delivery",
    name: "Phiếu giao nhận (Jesang)",
    description: "Layout chứng từ song ngữ, bảng viền, 5 ô ký",
    extraFormFields: [
      { key: "deliveryName", label: "Tên nơi giao", placeholder: "Công Ty TNHH Kyong Gi Vina" },
      { key: "deliveryAddress", label: "Địa chỉ giao", placeholder: "Lô C, Đường N11, KCN Minh Hưng III..." },
      { key: "driverName", label: "Tên tài xế", placeholder: "Nguyễn Văn A" },
      { key: "vehicleId", label: "Số xe", placeholder: "50E-12345" },
    ],
    itemColumns: [
      { key: "stt", label: "STT", type: "text", width: "7%", align: "center", system: true },
      { key: "contractNo", label: "Hợp đồng", type: "text", width: "13%" },
      { key: "productName", label: "Tên hàng", type: "text", width: "22%", system: true },
      { key: "lotNo", label: "Số Lô", type: "text", width: "12%" },
      { key: "boxQty", label: "Số thùng/kiện", type: "number", width: "12%", align: "center" },
      { key: "netWeight", label: "Cân nặng (kg)", type: "number", width: "16%", align: "right" },
      { key: "invoiceVat", label: "Hóa đơn", type: "text", width: "18%" },
    ],
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/jesang-delivery-template").JesangDeliveryTemplate;
    },
  },
];

/** Get all available templates */
export function getTemplateList(): Omit<TemplateEntry, "component">[] {
  return registry.map(({ id, name, description, extraFormFields, itemColumns }) => ({ id, name, description, extraFormFields, itemColumns }));
}

/** Get template entry by ID */
export function getTemplateEntry(templateId?: string | null): TemplateEntry | undefined {
  return registry.find((t) => t.id === templateId);
}

/** Get template component by ID — falls back to default */
export function getTemplateComponent(templateId?: string | null): ComponentType<PdfTemplateProps> {
  const entry = registry.find((t) => t.id === templateId);
  return entry?.component ?? registry[0].component;
}

/** Get extra form fields for a template */
export function getExtraFormFields(templateId?: string | null): ExtraFormField[] {
  return registry.find((t) => t.id === templateId)?.extraFormFields ?? [];
}

/** Get template-specific item columns — if set, overrides document type columns on form */
export function getTemplateItemColumns(templateId?: string | null): ColumnDef[] | undefined {
  return registry.find((t) => t.id === templateId)?.itemColumns;
}
