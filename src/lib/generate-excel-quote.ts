import ExcelJS from "exceljs";
import { numberToVietnameseWords } from "./format-number-to-words";
import { calculateLineTotal, calculateQuoteTotals } from "./pricing-engine";

type QuoteData = {
  quoteNumber: string;
  createdAt: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: {
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
  }[];
  globalDiscountPercent: number;
  vatPercent: number;
  shippingFee: number;
  otherFees: number;
  otherFeesLabel: string;
  terms: string;
  validUntil: string;
  total: number;
};

type CompanyData = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  showAmountInWords: boolean;
  showBankInfo: boolean;
  primaryColor: string;
};

export async function generateExcelQuote(
  quote: QuoteData,
  company: CompanyData
): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Báo giá");

  const themeColor = (company.primaryColor || "#0369A1").replace("#", "FF");

  // Column widths
  ws.columns = [
    { width: 5 },
    { width: 35 },
    { width: 8 },
    { width: 8 },
    { width: 15 },
    { width: 8 },
    { width: 18 },
  ];

  // Company header
  ws.mergeCells("A1:G1");
  const titleCell = ws.getCell("A1");
  titleCell.value = company.companyName;
  titleCell.font = { bold: true, size: 14 };

  const companyDetails = [company.address, company.phone, company.email].filter(Boolean).join(" | ");
  ws.mergeCells("A2:G2");
  ws.getCell("A2").value = companyDetails;
  ws.getCell("A2").font = { size: 9, color: { argb: "FF666666" } };

  // Title
  ws.mergeCells("A4:G4");
  const bgTitle = ws.getCell("A4");
  bgTitle.value = "BẢNG BÁO GIÁ";
  bgTitle.font = { bold: true, size: 16, color: { argb: themeColor } };
  bgTitle.alignment = { horizontal: "center" };

  ws.mergeCells("A5:G5");
  ws.getCell("A5").value = `Số: ${quote.quoteNumber} — Ngày: ${new Date(quote.createdAt).toLocaleDateString("vi-VN")}`;
  ws.getCell("A5").alignment = { horizontal: "center" };
  ws.getCell("A5").font = { size: 9 };

  // Customer info
  let custRow = 7;
  const addCustRow = (label: string, value: string) => {
    ws.getCell(`A${custRow}`).value = label;
    ws.getCell(`A${custRow}`).font = { bold: true };
    ws.getCell(`B${custRow}`).value = value;
    custRow++;
  };

  addCustRow("Khách hàng:", quote.customerName);
  if (quote.customerCompany) addCustRow("Công ty:", quote.customerCompany);
  if (quote.customerPhone) addCustRow("ĐT:", quote.customerPhone);
  if (quote.customerEmail) addCustRow("Email:", quote.customerEmail);
  if (quote.customerAddress) addCustRow("Địa chỉ:", quote.customerAddress);

  // Table header
  const headerRowNum = custRow + 1;
  const headerRow = ws.getRow(headerRowNum);
  const headers = ["STT", "Sản phẩm", "ĐVT", "SL", "Đơn giá", "CK%", "Thành tiền"];
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: themeColor } };
    cell.alignment = { horizontal: i >= 3 ? "right" : "left" };
    cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
  });

  // Items
  let rowNum = headerRowNum + 1;
  quote.items.forEach((item, i) => {
    const lt = calculateLineTotal(item.unitPrice, item.quantity, item.discountPercent);
    const row = ws.getRow(rowNum);
    row.getCell(1).value = i + 1;
    row.getCell(2).value = item.name;
    row.getCell(3).value = item.unit;
    row.getCell(4).value = item.quantity;
    row.getCell(5).value = item.unitPrice;
    row.getCell(5).numFmt = "#,##0";
    row.getCell(6).value = item.discountPercent > 0 ? `${item.discountPercent}%` : "";
    row.getCell(7).value = lt;
    row.getCell(7).numFmt = "#,##0";
    for (let c = 1; c <= 7; c++) {
      row.getCell(c).border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    }
    rowNum++;
  });

  // Totals — same order as QuotePreview
  const totals = calculateQuoteTotals(
    quote.items.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity, discountPercent: i.discountPercent })),
    quote.globalDiscountPercent,
    quote.vatPercent,
    quote.shippingFee,
    quote.otherFees
  );

  rowNum++;
  const addSummaryRow = (label: string, value: number) => {
    ws.getCell(`F${rowNum}`).value = label;
    ws.getCell(`F${rowNum}`).font = { bold: true };
    ws.getCell(`G${rowNum}`).value = value;
    ws.getCell(`G${rowNum}`).numFmt = "#,##0";
    rowNum++;
  };

  addSummaryRow("Tạm tính:", totals.subtotal);
  if (quote.globalDiscountPercent > 0) addSummaryRow(`CK ${quote.globalDiscountPercent}%:`, -totals.discountAmount);
  if (quote.shippingFee > 0) addSummaryRow("Vận chuyển:", quote.shippingFee);
  if (quote.otherFees > 0) addSummaryRow(`${quote.otherFeesLabel || "Phí khác"}:`, quote.otherFees);
  if (quote.vatPercent > 0) addSummaryRow(`VAT ${quote.vatPercent}%:`, totals.vatAmount);

  ws.getCell(`F${rowNum}`).value = "TỔNG CỘNG:";
  ws.getCell(`F${rowNum}`).font = { bold: true, size: 12, color: { argb: themeColor } };
  ws.getCell(`G${rowNum}`).value = totals.total;
  ws.getCell(`G${rowNum}`).numFmt = "#,##0";
  ws.getCell(`G${rowNum}`).font = { bold: true, size: 12, color: { argb: themeColor } };
  rowNum++;

  // Amount in words
  if (company.showAmountInWords && totals.total > 0) {
    rowNum++;
    ws.mergeCells(`A${rowNum}:G${rowNum}`);
    ws.getCell(`A${rowNum}`).value = `Bằng chữ: ${numberToVietnameseWords(totals.total)}`;
    ws.getCell(`A${rowNum}`).font = { italic: true, size: 9 };
    rowNum++;
  }

  // Terms
  if (quote.terms) {
    rowNum++;
    ws.mergeCells(`A${rowNum}:G${rowNum}`);
    ws.getCell(`A${rowNum}`).value = "Điều khoản:";
    ws.getCell(`A${rowNum}`).font = { bold: true };
    rowNum++;
    ws.mergeCells(`A${rowNum}:G${rowNum}`);
    ws.getCell(`A${rowNum}`).value = quote.terms;
    ws.getCell(`A${rowNum}`).font = { size: 9, color: { argb: "FF555555" } };
    ws.getCell(`A${rowNum}`).alignment = { wrapText: true };
    rowNum++;
  }

  // Valid until
  if (quote.validUntil) {
    ws.mergeCells(`A${rowNum}:G${rowNum}`);
    ws.getCell(`A${rowNum}`).value = `Hiệu lực đến: ${new Date(quote.validUntil).toLocaleDateString("vi-VN")}`;
    ws.getCell(`A${rowNum}`).font = { size: 9, color: { argb: "FF888888" } };
    rowNum++;
  }

  // Bank info
  if (company.showBankInfo && company.bankName) {
    rowNum++;
    ws.mergeCells(`A${rowNum}:G${rowNum}`);
    ws.getCell(`A${rowNum}`).value = "Thông tin chuyển khoản:";
    ws.getCell(`A${rowNum}`).font = { bold: true, size: 9 };
    rowNum++;
    ws.mergeCells(`A${rowNum}:G${rowNum}`);
    ws.getCell(`A${rowNum}`).value = `Ngân hàng: ${company.bankName} | STK: ${company.bankAccount} | CTK: ${company.bankOwner}`;
    ws.getCell(`A${rowNum}`).font = { size: 9, color: { argb: "FF555555" } };
  }

  return await wb.xlsx.writeBuffer();
}
