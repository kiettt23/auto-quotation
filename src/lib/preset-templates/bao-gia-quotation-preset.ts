/**
 * Preset definition for Báo Giá (Quotation).
 * Client-safe metadata — renderers mapped in preset-renderers.ts (server-only).
 */

import type { PresetTemplate } from "./types";

export const baoGiaQuotationPreset: PresetTemplate = {
  id: "preset-bao-gia",
  name: "Báo Giá",
  namePatterns: ["báo giá", "bao gia", "quotation"],
  description: "Bảng báo giá sản phẩm/dịch vụ — Product/Service Quotation",
  fileType: "pdf",
  docPrefix: "BG-{YYYY}-",

  placeholders: [
    // Auto-fill from tenant
    { key: "companyName", label: "Tên công ty", type: "text", autoFill: "tenant.companyName" },
    { key: "companyAddress", label: "Địa chỉ công ty", type: "text", autoFill: "tenant.address" },
    // Customer info
    {
      key: "customerName", label: "Tên khách hàng", type: "text",
      dataSource: "customer",
      linkedFields: { company: "customerCompany", phone: "customerPhone", email: "customerEmail", address: "customerAddress" },
    },
    { key: "customerCompany", label: "Công ty khách hàng", type: "text" },
    { key: "customerPhone", label: "SĐT khách hàng", type: "text" },
    { key: "customerEmail", label: "Email khách hàng", type: "text" },
    { key: "customerAddress", label: "Địa chỉ khách hàng", type: "text" },
    // Quote details
    { key: "createdAt", label: "Ngày tạo", type: "date" },
    { key: "validUntil", label: "Hiệu lực đến", type: "date" },
    { key: "globalDiscountPercent", label: "Chiết khấu chung (%)", type: "number" },
    { key: "vatPercent", label: "VAT (%)", type: "number" },
    { key: "shippingFee", label: "Phí vận chuyển", type: "number" },
    { key: "otherFees", label: "Phí khác", type: "number" },
    { key: "otherFeesLabel", label: "Tên phí khác", type: "text" },
    { key: "notes", label: "Ghi chú", type: "text" },
    { key: "terms", label: "Điều khoản", type: "text" },
  ],

  tableColumns: [
    {
      key: "name", label: "Tên sản phẩm", type: "text",
      dataSource: "product",
      linkedFields: { unit: "unit", unitPrice: "unitPrice" },
    },
    { key: "description", label: "Mô tả", type: "text" },
    { key: "unit", label: "ĐVT", type: "text" },
    { key: "quantity", label: "Số lượng", type: "number" },
    { key: "unitPrice", label: "Đơn giá", type: "number" },
    { key: "discountPercent", label: "CK (%)", type: "number" },
  ],
};
