import type { DocumentType } from "@/db/schema/document";

/** PDF title for each document type */
export const presetTitleMap: Record<DocumentType, string> = {
  QUOTATION: "BÁO GIÁ",
  WAREHOUSE_EXPORT: "PHIẾU XUẤT KHO",
  DELIVERY_ORDER: "PHIẾU GIAO HÀNG",
};
