/**
 * Built-in renderer for Phiếu Xuất Kho (PXK) PDF.
 * Wraps generatePxkWarehouseExport with tenant-aware company data.
 */

import { generatePxkWarehouseExport } from "@/lib/pdf-layouts/pxk-warehouse-export-layout";
import type { RenderResult } from "./types";
import type { Tenant } from "@/db/schema";

export async function renderPxkPdf(
  fieldData: Record<string, string>,
  tableRows: Record<string, string>[],
  tenant: Tenant,
  docNumber: string
): Promise<RenderResult> {
  const items = tableRows.map((row) => ({
    itemName: row.itemName ?? "",
    unit: row.unit ?? "",
    specification: row.specification ?? "",
    totalWeight: row.totalWeight ?? "0",
    note: row.note ?? "",
  }));

  const data = {
    companyName: fieldData.companyName ?? tenant.companyName,
    companyAddress: fieldData.companyAddress ?? tenant.address,
    docNumber: fieldData.docNumber ?? docNumber,
    date: fieldData.date ?? new Date().toISOString(),
    vehicleId: fieldData.vehicleId ?? "",
    customerName: fieldData.customerName ?? "",
    deliveryAddress: fieldData.deliveryAddress ?? "",
    receiverName: fieldData.receiverName ?? "",
    receiverPhone: fieldData.receiverPhone ?? "",
    items,
  };

  const buffer = await generatePxkWarehouseExport(data);

  return {
    buffer,
    contentType: "application/pdf",
    fileName: `${docNumber}.pdf`,
  };
}
