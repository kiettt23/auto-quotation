/**
 * Preset definition for Phiếu Xuất Kho (Warehouse Export Note).
 * Client-safe metadata — renderer mapped in preset-renderers.ts (server-only).
 */

import type { PresetTemplate } from "./types";

export const pxkWarehouseExportPreset: PresetTemplate = {
  id: "preset-pxk",
  name: "Phiếu Xuất Kho",
  namePatterns: ["phiếu xuất kho", "phieu xuat kho", "pxk"],
  description: "Phiếu xuất kho hàng hóa — Warehouse Export Note",
  fileType: "pdf",
  docPrefix: "PXK-{YYYY}-",

  placeholders: [
    { key: "companyName", label: "Tên công ty", type: "text", autoFill: "tenant.companyName" },
    { key: "companyAddress", label: "Địa chỉ công ty", type: "text", autoFill: "tenant.address" },
    { key: "date", label: "Ngày xuất kho", type: "date" },
    { key: "vehicleId", label: "Số xe", type: "text" },
    {
      key: "customerName", label: "Tên khách hàng", type: "text",
      dataSource: "customer",
      linkedFields: { phone: "receiverPhone" },
    },
    { key: "deliveryAddress", label: "Nơi giao hàng", type: "text" },
    { key: "receiverName", label: "Người nhận", type: "text" },
    { key: "receiverPhone", label: "SĐT người nhận", type: "text" },
  ],

  tableColumns: [
    {
      key: "itemName", label: "Tên Hàng", type: "text",
      dataSource: "product",
      linkedFields: { unit: "unit", specification: "specification", weight: "totalWeight" },
    },
    { key: "unit", label: "Đvt", type: "text" },
    { key: "specification", label: "Quy cách", type: "text" },
    { key: "totalWeight", label: "Tổng Cộng (kgs)", type: "number" },
    { key: "note", label: "Ghi Chú", type: "text" },
  ],
};
