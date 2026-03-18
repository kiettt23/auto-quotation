import type { ComponentType } from "react";
import type { PdfTemplateProps } from "./template-props";

/** Registry entry for a PDF template */
export interface TemplateEntry {
  id: string;
  name: string;
  description: string;
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
    get component() {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("./templates/jesang-delivery-template").JesangDeliveryTemplate;
    },
  },
];

/** Get all available templates */
export function getTemplateList(): Omit<TemplateEntry, "component">[] {
  return registry.map(({ id, name, description }) => ({ id, name, description }));
}

/** Get template component by ID — falls back to default */
export function getTemplateComponent(templateId?: string | null): ComponentType<PdfTemplateProps> {
  const entry = registry.find((t) => t.id === templateId);
  return entry?.component ?? registry[0].component;
}
