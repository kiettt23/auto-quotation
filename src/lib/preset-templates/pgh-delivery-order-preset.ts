/**
 * Preset definition for Phiếu Giao Hàng (Delivery Order).
 * Client-safe metadata — renderer mapped in preset-renderers.ts (server-only).
 */

import type { PresetTemplate } from "./types";

export const pghDeliveryOrderPreset: PresetTemplate = {
  id: "preset-pgh",
  name: "Phiếu Giao Nhận",
  namePatterns: ["phiếu giao nhận", "phieu giao nhan", "pgh"],
  description: "Phiếu giao nhận hàng hóa — Delivery Order (bilingual VN/EN)",
  fileType: "pdf",
  docPrefix: "PGH-{YYYY}-",

  placeholders: [
    { key: "companyName", label: "Tên công ty", type: "text", autoFill: "tenant.companyName" },
    { key: "companyAddress", label: "Địa chỉ công ty", type: "text", autoFill: "tenant.address" },
    { key: "companyTaxCode", label: "Mã số thuế", type: "text", autoFill: "tenant.taxCode" },
    { key: "deliveryDate", label: "Ngày giao hàng", type: "date" },
    { key: "buyerName", label: "Tên người mua", type: "text" },
    { key: "buyerAddress", label: "Địa chỉ người mua", type: "text" },
    { key: "deliveryTo", label: "Giao đến (người nhận)", type: "text" },
    { key: "deliveryAddress", label: "Địa chỉ giao hàng", type: "text" },
    { key: "vehicleId", label: "Số xe", type: "text" },
    { key: "driverName", label: "Tên tài xế", type: "text" },
    { key: "receiverName", label: "Người nhận hàng", type: "text" },
    { key: "receiverPhone", label: "SĐT người nhận", type: "text" },
  ],

  tableColumns: [
    { key: "contractNo", label: "Số hợp đồng", type: "text" },
    { key: "itemName", label: "Tên hàng", type: "text" },
    { key: "lotNo", label: "Số lô", type: "text" },
    { key: "boxQty", label: "Số thùng", type: "number" },
    { key: "netWeight", label: "Trọng lượng (KG)", type: "number" },
    { key: "invoiceVat", label: "Hóa đơn VAT", type: "text" },
  ],
};
