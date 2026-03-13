/**
 * Built-in renderer for Phiếu Giao Nhận (PGH) PDF.
 * Wraps generatePghDeliveryOrder with tenant-aware company data.
 */

import { generatePghDeliveryOrder } from "@/lib/pdf-layouts/pgh-delivery-order-layout";
import type { RenderResult } from "./types";
import type { Tenant } from "@/db/schema";

export async function renderPghPdf(
  fieldData: Record<string, string>,
  tableRows: Record<string, string>[],
  tenant: Tenant,
  docNumber: string
): Promise<RenderResult> {
  const items = tableRows.map((row) => ({
    contractNo: row.contractNo ?? "",
    itemName: row.itemName ?? "",
    lotNo: row.lotNo ?? "",
    boxQty: row.boxQty ?? "0",
    netWeight: row.netWeight ?? "0",
    invoiceVat: row.invoiceVat ?? "",
  }));

  const data = {
    companyName: fieldData.companyName ?? tenant.companyName,
    companyAddress: fieldData.companyAddress ?? tenant.address,
    companyTaxCode: fieldData.companyTaxCode ?? tenant.taxCode,
    docNumber: fieldData.docNumber ?? docNumber,
    date: fieldData.date ?? new Date().toISOString(),
    deliveryDate: fieldData.deliveryDate ?? new Date().toISOString(),
    buyerName: fieldData.buyerName ?? "",
    buyerAddress: fieldData.buyerAddress ?? "",
    deliveryTo: fieldData.deliveryTo ?? "",
    deliveryAddress: fieldData.deliveryAddress ?? "",
    vehicleId: fieldData.vehicleId ?? "",
    driverName: fieldData.driverName ?? "",
    receiverName: fieldData.receiverName ?? "",
    receiverPhone: fieldData.receiverPhone ?? "",
    items,
  };

  const buffer = await generatePghDeliveryOrder(data);

  return {
    buffer,
    contentType: "application/pdf",
    fileName: `${docNumber}.pdf`,
  };
}
