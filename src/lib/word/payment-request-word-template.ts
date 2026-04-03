import {
  Document, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle,
  TableBorders,
} from "docx";
import type { WordTemplateProps } from "./word-template-props";

const FONT = "Roboto";
const SIZE = 20; /* 10pt */
const SIZE_SM = 18; /* 9pt */
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

function txt(text: string, opts?: { bold?: boolean; italic?: boolean; size?: number }): TextRun {
  return new TextRun({ text, font: FONT, size: opts?.size ?? SIZE, bold: opts?.bold, italics: opts?.italic });
}

function f(tf: Record<string, string>, key: string, fallback = ""): string {
  return tf[key] || fallback;
}

function parseAmt(v: string | number | undefined): number {
  if (!v) return 0;
  const n = Number(String(v).replace(/\./g, "").replace(/,/g, "."));
  return isNaN(n) ? 0 : n;
}

export function buildPaymentRequestDocx(props: WordTemplateProps): Document {
  const { documentNumber, date, company, data } = props;
  const tf = (data.templateFields ?? {}) as Record<string, string>;
  const allItems = data.items ?? [];

  const [dd, mm, yyyy] = (date || "").split("/");
  const fmtDate = dd ? `HCM, ngày ${parseInt(dd)} tháng ${parseInt(mm)} năm ${yyyy}` : date;

  const contractNo = f(tf, "contractNo");
  const customerName = data.customerName ?? "";
  const totalAmount = f(tf, "totalAmount");

  const noBorders = TableBorders.NONE;

  /* Fee lines — merge hidden items into first visible */
  const hiddenTotal = allItems
    .filter((it) => {
      const v = (it.customFields ?? {} as Record<string, string | number>).hideInDntt;
      return v && v !== "0";
    })
    .reduce((sum, it) => sum + parseAmt((it.customFields ?? {} as Record<string, string | number>).amount), 0);
  const visibleItems = allItems.filter((it) => {
    const v = (it.customFields ?? {} as Record<string, string | number>).hideInDntt;
    return !v || v === "0";
  });

  const feeLineParagraphs = visibleItems.map((item, idx) => {
    const cf = (item.customFields ?? {}) as Record<string, string | number>;
    const ownAmt = parseAmt(cf.amount);
    const displayAmt = idx === 0 ? ownAmt + hiddenTotal : ownAmt;
    const fmtAmt = new Intl.NumberFormat("vi-VN").format(displayAmt);
    const months = String(cf.paymentMonths || f(tf, "paymentMonths"));
    const periodFrom = String(cf.paymentPeriodFrom || f(tf, "paymentPeriodFrom"));
    const periodTo = String(cf.paymentPeriodTo || f(tf, "paymentPeriodTo"));
    return new Paragraph({
      spacing: { after: 20 },
      children: [txt(`Cước phí ${item.productName || "Internet"} ${months} Tháng (${periodFrom} đến ngày ${periodTo}) của hợp đồng là: ${fmtAmt} VNĐ`, { size: SIZE_SM })],
    });
  });

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_SM },
          paragraph: { spacing: { after: 0, line: 220, lineRule: "exact" } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 14 * 20, bottom: 8 * 20, left: 38 * 20, right: 38 * 20 },
        },
      },
      children: [
        /* Header */
        new Table({
          borders: noBorders,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({
            children: [
              new TableCell({
                width: { size: 45, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ children: [txt(company.name, { bold: true, size: SIZE_SM })] }),
                  new Paragraph({ children: [txt("TRUNG TÂM SÀI GÒN 4", { bold: true, size: SIZE_SM })] }),
                  new Paragraph({ children: [txt("----------------------", { size: SIZE_SM })] }),
                  new Paragraph({ children: [txt(`Số: ${contractNo || documentNumber} / FTEL`, { size: SIZE_SM })] }),
                  new Paragraph({ children: [txt("V/v Thanh toán cước phí", { italic: true, size: SIZE_SM })] }),
                ],
              }),
              new TableCell({
                width: { size: 55, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [txt("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { bold: true, size: SIZE_SM })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [txt("Độc lập - Tự do - Hạnh phúc", { bold: true, size: SIZE_SM })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [txt("----------o0o----------", { size: SIZE_SM })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [txt(fmtDate, { italic: true, size: SIZE_SM })] }),
                ],
              }),
            ],
          })],
        }),

        /* Title */
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [txt("GIẤY ĐỀ NGHỊ THANH TOÁN", { bold: true, size: 26 })],
        }),

        /* Kính gửi / Địa chỉ */
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("Kính gửi:  ", { italic: true, bold: true, size: SIZE_SM }),
            txt(customerName, { bold: true, size: SIZE_SM }),
          ],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            txt("Địa chỉ:  ", { italic: true, size: SIZE_SM }),
            txt(data.customerAddress || f(tf, "invoiceAddress") || f(tf, "installAddress"), { size: SIZE_SM }),
          ],
        }),

        /* Opening */
        new Paragraph({
          spacing: { after: 20 },
          children: [txt(`${company.name} (FPT Telecom) cảm ơn Quý khách hàng đã tin tưởng, lựa chọn và sử dụng dịch vụ của chúng tôi.`, { size: SIZE_SM })],
        }),

        /* Contract reference */
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("Căn cứ Hợp đồng cung cấp và sử dụng dịch vụ số ", { size: SIZE_SM }),
            txt(contractNo, { bold: true, size: SIZE_SM }),
            txt(" ký ngày ", { size: SIZE_SM }),
            txt(f(tf, "contractDate"), { bold: true, size: SIZE_SM }),
            txt(` giữa `, { size: SIZE_SM }),
            txt(customerName, { bold: true, size: SIZE_SM }),
            txt(` và FPT Telecom, gói dịch vụ ${f(tf, "servicePackage")},`, { size: SIZE_SM }),
            txt("\nFPT Telecom xin thông báo:", { size: SIZE_SM }),
          ],
        }),

        /* Fee lines */
        ...feeLineParagraphs,

        /* Amount due */
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("Số tiền còn phải thanh toán: ", { size: SIZE_SM }),
            txt(`${totalAmount} VNĐ`, { bold: true, size: SIZE_SM }),
            txt(" bao gồm VAT (", { size: SIZE_SM }),
            txt(`Số tiền bằng chữ: ${f(tf, "amountInWords")}./.`, { italic: true, size: SIZE_SM }),
            txt(").", { size: SIZE_SM }),
          ],
        }),

        /* Payment methods intro */
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("Hiện nay, FPT Telecom triển khai nhiều hình thức thanh toán trực tuyến đơn giản, tiện lợi cho Quý khách hàng chỉ bằng cách nhập thông tin số hợp đồng: ", { size: SIZE_SM }),
            txt(contractNo, { bold: true, size: SIZE_SM }),
            txt(" , trước ngày ", { size: SIZE_SM }),
            txt(f(tf, "paymentDeadline"), { bold: true, size: SIZE_SM }),
            txt(" qua các kênh sau :", { size: SIZE_SM }),
          ],
        }),

        /* Payment methods */
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("1. Thanh toán trực tuyến tại website chính thức của FPT Telecom: ", { size: SIZE_SM }),
            txt("fpt.vn/pay, ứng dụng HiFPT", { bold: true, size: SIZE_SM }),
            txt(" ví điện tử ", { size: SIZE_SM }),
            txt("FPT Pay", { bold: true, size: SIZE_SM }),
            txt(" hoặc các ví điện tử khác.", { size: SIZE_SM }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [txt('2. Thanh toán qua Internet Banking, Mobile Banking tại mục "Thanh toán hóa đơn" trên ứng dụng của các ngân hàng.', { size: SIZE_SM })],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [txt("3. Hoặc chuyển khoản đến tài khoản của FPT Telecom:", { size: SIZE_SM })],
        }),

        /* Bank details */
        new Paragraph({ spacing: { after: 20 }, children: [txt(`- Đơn vị thụ hưởng: ${company.name}`, { size: SIZE_SM })] }),
        new Paragraph({ spacing: { after: 20 }, children: [txt(`- Số tài khoản: ${company.bankAccount ?? ""} tại ${company.bankName ?? ""}`, { size: SIZE_SM })] }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("- Nội dung (Ghi đúng cú pháp): ", { size: SIZE_SM }),
            txt(f(tf, "paymentContent", `${contractNo} _ thanh toán cước`), { bold: true, size: SIZE_SM }),
          ],
        }),

        /* Support */
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [txt("Mọi yêu cầu cần hỗ trợ, Quý khách hàng vui lòng liên hệ với bộ phận tiếp nhận và hỗ trợ thông tin của dịch vụ khách hàng 24/7: ứng dụng HiFPT hoặc tổng đài 19006600.", { size: SIZE_SM })],
        }),

        /* Closing */
        new Paragraph({
          spacing: { after: 40 },
          children: [txt("Trân trọng cảm ơn!", { italic: true, size: SIZE_SM })],
        }),

        /* Signatures */
        new Table({
          borders: noBorders,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({
            children: [
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ children: [txt("Nơi nhận:", { italic: true, bold: true, size: SIZE_SM })] }),
                  new Paragraph({ children: [txt("- Quý KH;", { italic: true, size: SIZE_SM })] }),
                  new Paragraph({ children: [txt("- Lưu.", { italic: true, size: SIZE_SM })] }),
                ],
              }),
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [txt((company.name ?? "").toUpperCase(), { bold: true, size: SIZE_SM })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [txt((company.position ?? "GIÁM ĐỐC").toUpperCase(), { size: SIZE_SM })] }),
                  new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [txt((company.representative ?? "").toUpperCase(), { bold: true, size: SIZE })] }),
                ],
              }),
            ],
          })],
        }),
      ],
    }],
  });
}
