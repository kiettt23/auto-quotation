import {
  Document, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle,
  ShadingType, TableBorders,
} from "docx";
import type { WordTemplateProps } from "./word-template-props";

const FONT = "Roboto";
const SIZE = 20; /* half-points → 10pt */
const SIZE_SM = 18; /* 9pt */
const BORDER_STYLE = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

function txt(text: string, opts?: { bold?: boolean; italic?: boolean; underline?: boolean; size?: number }): TextRun {
  return new TextRun({ text, font: FONT, size: opts?.size ?? SIZE, bold: opts?.bold, italics: opts?.italic, underline: opts?.underline ? {} : undefined });
}

function field(tf: Record<string, string>, key: string, fallback = ""): string {
  return tf[key] || fallback;
}

function fmtVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

function partyRow(label: string, value: string, bold = false): Paragraph {
  return new Paragraph({
    spacing: { after: 20 },
    children: [
      txt(label, { size: SIZE_SM }),
      txt("  :  ", { size: SIZE_SM }),
      txt(value, { bold, size: SIZE_SM }),
    ],
  });
}

function twoColTable(label: string, leftVal: string, rightLabel: string, rightVal: string, boldLeft = false): Table {
  const noBdr = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr, insideHorizontal: noBdr, insideVertical: noBdr };
  return new Table({
    borders: noBorders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ spacing: { after: 20 }, children: [
            txt(label, { size: SIZE_SM }),
            txt("  :  ", { size: SIZE_SM }),
            txt(leftVal, { bold: boldLeft, size: SIZE_SM }),
          ] })],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ spacing: { after: 20 }, children: [
            txt(rightLabel, { size: SIZE_SM }),
            txt("  :  ", { size: SIZE_SM }),
            txt(rightVal, { size: SIZE_SM }),
          ] })],
        }),
      ],
    })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 20 },
    children: [txt("•  ", { size: SIZE_SM }), txt(text, { size: SIZE_SM })],
  });
}

export function buildContractAppendixDocx(props: WordTemplateProps): Document {
  const { date, company, data, signatureLabels } = props;
  const tf = (data.templateFields ?? {}) as Record<string, string>;
  const items = data.items ?? [];

  const dp = date.split("/");
  const formattedDate = dp.length === 3
    ? `Hồ Chí Minh, ngày ${parseInt(dp[0])} tháng ${parseInt(dp[1])} năm ${dp[2]}`
    : date;

  const totalAmount = items.reduce((sum, it) => {
    const cfAmt = it.customFields?.amount ? Number(it.customFields.amount) : 0;
    return sum + (cfAmt || it.amount || 0);
  }, 0);

  /* Table borders */
  const tableBorders = {
    top: BORDER_STYLE, bottom: BORDER_STYLE,
    left: BORDER_STYLE, right: BORDER_STYLE,
    insideHorizontal: BORDER_STYLE, insideVertical: BORDER_STYLE,
  };
  const noBorders = TableBorders.NONE;

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
        /* Header — two column via table */
        new Table({
          borders: noBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [txt(company.name, { bold: true, size: SIZE_SM })] })],
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [txt("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { bold: true, size: SIZE_SM })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [txt("Độc lập – Tự Do – Hạnh Phúc", { bold: true, size: SIZE_SM })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [txt("-------o0o-------", { size: SIZE_SM })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [txt(formattedDate, { italic: true, size: SIZE_SM })] }),
                  ],
                }),
              ],
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),

        /* Title */
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [txt("PHỤ LỤC HỢP ĐỒNG", { bold: true, size: 26 })],
        }),

        /* Preamble */
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("Căn cứ Hợp đồng Cung cấp và Sử dụng Dịch vụ số ", { size: SIZE_SM }),
            txt(field(tf, "contractNo"), { bold: true, size: SIZE_SM }),
            txt(" ký ngày ", { size: SIZE_SM }),
            txt(field(tf, "contractDate"), { bold: true, size: SIZE_SM }),
            txt(" và các Phụ lục kèm theo giữa:", { size: SIZE_SM }),
          ],
        }),

        /* Bên A */
        partyRow("Bên A", data.customerName ?? "", true),
        twoColTable("Người đại diện", field(tf, "representative"), "Chức vụ", field(tf, "position")),
        partyRow("Địa chỉ lắp đặt", field(tf, "installAddress", data.customerAddress ?? "")),
        partyRow("Địa chỉ hóa đơn", field(tf, "invoiceAddress", data.customerAddress ?? "")),
        twoColTable("Điện thoại", field(tf, "phone"), "Fax", field(tf, "fax")),
        twoColTable("Số tài khoản", field(tf, "bankAccount"), "Tại Ngân hàng", field(tf, "bankName")),
        twoColTable("Mã số thuế", field(tf, "taxCode"), "Email", field(tf, "email")),

        /* Bên B */
        partyRow("Bên B", company.name, true),
        twoColTable("Người đại diện", `Ông: ${company.representative ?? ""}`, "Chức vụ", company.position ?? ""),
        partyRow("Vp giao dịch", company.address ?? ""),
        twoColTable("Điện thoại", company.phone ?? "", "Mã số thuế", company.taxCode ?? ""),
        twoColTable("Số tài khoản", company.bankAccount ?? "", "Tại", company.bankName ?? ""),

        /* Contract reference */
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            txt('Sau đây gọi tắt là ', { size: SIZE_SM }),
            txt('"Hợp đồng"', { bold: true, size: SIZE_SM }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt('Bằng phụ lục này ("Phụ lục"), hai Bên cùng nhau thống nhất sửa đổi các điều khoản của Hợp đồng như sau:', {
              bold: true, italic: true, underline: true, size: SIZE_SM,
            }),
          ],
        }),

        /* ĐIỀU 1 */
        new Paragraph({ spacing: { before: 80, after: 40 }, children: [txt("ĐIỀU 1: NỘI DUNG SỬA ĐỔI", { bold: true, size: SIZE_SM })] }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("Kể từ ngày ", { size: SIZE_SM }),
            txt(field(tf, "effectiveDate"), { bold: true, size: SIZE_SM }),
            txt(" Bên A yêu cầu", { size: SIZE_SM }),
          ],
        }),
        new Paragraph({ spacing: { after: 20 }, children: [txt(" THÔNG TIN GÓI DỊCH VỤ:", { bold: true, size: SIZE_SM })] }),

        bullet(`Sử dụng gói Dịch vụ: ${field(tf, "servicePackage")}; Gói tính cước: ${field(tf, "servicePriceCode")}`),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("•  Giá gói Dịch vụ: ", { size: SIZE_SM }),
            txt(`${field(tf, "servicePrice")} VNĐ`, { bold: true, size: SIZE_SM }),
            txt(`/ ${field(tf, "paymentMonths")} Tháng.`, { size: SIZE_SM }),
          ],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("•  Kỳ hạn thanh toán từ ngày ", { size: SIZE_SM }),
            txt(field(tf, "paymentPeriodFrom"), { bold: true, size: SIZE_SM }),
            txt(" đến ngày ", { size: SIZE_SM }),
            txt(field(tf, "paymentPeriodTo"), { bold: true, size: SIZE_SM }),
            txt(".", { size: SIZE_SM }),
          ],
        }),
        bullet("Trường hợp Bên A có nhu cầu thay đổi gói Dịch vụ mà chỉ làm thay đổi duy nhất kỳ hạn thanh toán thì Bên B sẽ chủ động cập nhật gói Dịch vụ đáp ứng nhu cầu của Bên A và được xác nhận bằng Biên nhận thu tiền/hóa đơn mà Bên B cung cấp cho Bên A. Trường hợp hết kỳ hạn thanh toán của gói Dịch vụ Bên A đang sử dụng mà Bên A không tiếp tục thanh toán theo gói Dịch vụ đó thì được xem là Bên A tự động chuyển đổi sang gói Dịch vụ mới có cùng tốc độ đường truyền và các dịch vụ kèm theo với kỳ hạn thanh toán trả theo từng tháng."),

        /* ĐIỀU 2 */
        new Paragraph({ spacing: { before: 80, after: 40 }, children: [txt("ĐIỀU 2: CHÍNH SÁCH DỊCH VỤ", { bold: true, size: SIZE_SM })] }),
        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("2.1.", { bold: true, size: SIZE_SM }),
            txt(`     Tổng số tiền Bên A thanh toán cho Bên B để thực hiện nội dung sửa đổi tại ĐIỀU 1 là `, { size: SIZE_SM }),
            txt(`${field(tf, "servicePrice", fmtVND(totalAmount))} VNĐ`, { bold: true, size: SIZE_SM }),
          ],
        }),
        new Paragraph({ spacing: { after: 20 }, children: [txt("Trong đó, bao gồm:", { size: SIZE_SM })] }),

        /* Fee table */
        new Table({
          borders: tableBorders,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            /* Header */
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 60, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [txt("Khoản thu", { bold: true, size: SIZE_SM })] })],
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [txt("Số tiền (VNĐ)", { bold: true, size: SIZE_SM })] })],
                }),
              ],
            }),
            /* Data rows */
            ...items.map((item) => {
              const cfAmt = item.customFields?.amount ? Number(item.customFields.amount) : 0;
              const amt = cfAmt || item.amount || 0;
              return new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [txt(item.productName || String(item.customFields?.label ?? ""), { size: SIZE_SM })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [txt(fmtVND(amt), { size: SIZE_SM })] })] }),
                ],
              });
            }),
            /* Total row */
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [txt("Tổng tiền", { bold: true, size: SIZE_SM })] })] }),
                new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [txt(fmtVND(totalAmount), { size: SIZE_SM })] })] }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { after: 20 }, children: [txt("Khoản thu đã bao gồm thuế VAT", { italic: true, size: SIZE_SM })] }),

        new Paragraph({
          spacing: { after: 20 },
          children: [
            txt("2.2.", { bold: true, size: SIZE_SM }),
            txt("     Theo quy định pháp luật, hóa đơn của Bên B phát hành hợp lệ không nhất thiết phải có con dấu của Bên B và Bên B lựa chọn sử dụng chữ viết là tiếng Việt không dấu trên hóa đơn", { size: SIZE_SM }),
          ],
        }),

        /* ĐIỀU 3 */
        new Paragraph({ spacing: { before: 80, after: 40 }, children: [txt("ĐIỀU 3: ĐIỀU KHOẢN CHUNG", { bold: true, size: SIZE_SM })] }),
        bullet("Bên A có trách nhiệm thanh toán khoản thu cho Bên B trong vòng 07 (bảy) ngày kể từ ngày phát hành hóa đơn giá trị gia tăng. Trường hợp Bên A thanh toán quá hạn so với quy định này hoặc không đồng ý thanh toán, Bên A phải bồi thường 8% giá trị thanh toán của hóa đơn."),
        bullet("Trong quá trình sử dụng Dịch vụ nếu Bên A muốn thay đổi gói Dịch vụ sử dụng hoặc bất kỳ thay đổi nào khác liên quan đến Hợp đồng đã ký kết, hai Bên thống nhất Phương thức giao dịch điện tử (Ví dụ: SMS, email, qua website fpt.vn/member, ứng dụng Hi FPT) là một trong những Phương thức giao dịch giữa hai bên. Phụ lục này là một phần không tách rời của Hợp đồng, các nội dung khác của Hợp đồng không được đề cập đến trong Phụ lục này là không thay đổi và giữ nguyên giá trị pháp lý."),
        bullet("Phụ lục này được lập thành 02 bản có giá trị như nhau, mỗi Bên giữ 01 (một) bản và có hiệu lực kể từ ngày ký hoặc ngày xác nhận Phụ lục thông qua Phương thức giao dịch điện tử."),

        /* Signatures */
        new Paragraph({ spacing: { before: 200 }, children: [] }),
        new Table({
          borders: noBorders,
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [txt(signatureLabels[0] ?? "Đại diện bên A", { bold: true, size: SIZE_SM })] }),
                  ],
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [txt(signatureLabels[1] ?? "Đại diện bên B", { bold: true, size: SIZE_SM })] }),
                    ...(company.position ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [txt(company.position, { size: SIZE_SM })] })] : []),
                    new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [txt(company.representative ?? "", { bold: true, size: SIZE })] }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }],
  });
}
