import { Document, Page, Text, View } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import type { PdfTemplateProps } from "../template-props";

const BC = "#000000";

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 9,
    paddingTop: 14,
    paddingBottom: 8,
    paddingHorizontal: 38,
    color: BC,
    lineHeight: 1.3,
    flex: 1,
  },

  /* Top header — two columns */
  topRow: { flexDirection: "row", marginBottom: 2 },
  topLeft: { flex: 1, alignItems: "center" },
  topRight: { flex: 1, alignItems: "center" },
  companyNameHeader: { fontSize: 9, fontWeight: "bold", textAlign: "center" },
  republicHeader: { fontSize: 9, fontWeight: "bold", textAlign: "center" },
  subHeader: { fontSize: 8, textAlign: "center" },
  separator: { fontSize: 7, textAlign: "center", marginTop: 0 },
  dateRight: { fontSize: 8, textAlign: "center", marginTop: 0, fontStyle: "italic" },

  /* Title */
  title: { fontSize: 12, fontWeight: "bold", textAlign: "center", marginTop: 2, marginBottom: 3 },

  /* Body text */
  bodyText: { fontSize: 9, marginBottom: 1.5 },
  bodyTextBold: { fontSize: 9, fontWeight: "bold" },

  /* Party info — label : value */
  partyRow: { flexDirection: "row", marginBottom: 0.5 },
  partyLabel: { fontSize: 9, width: 80 },
  partyLabelBold: { fontSize: 9, fontWeight: "bold", width: 80 },
  partyColon: { fontSize: 9, width: 8 },
  partyValue: { fontSize: 9, flex: 1 },
  partyValueBold: { fontSize: 9, fontWeight: "bold", flex: 1 },

  /* Two-column value row (e.g. phone | fax) */
  twoColValue: { fontSize: 9, flex: 1, flexDirection: "row" },
  twoColLeft: { fontSize: 9, flex: 1 },
  twoColRight: { fontSize: 9, flex: 1 },
  twoColLabel: { fontSize: 9, color: BC },

  /* Section headers */
  sectionTitle: { fontSize: 9, fontWeight: "bold", marginTop: 3, marginBottom: 1.5 },

  /* Bullet */
  bullet: { flexDirection: "row", marginBottom: 1, paddingLeft: 4 },
  bulletDot: { fontSize: 9, width: 10, fontWeight: "bold" },
  bulletText: { fontSize: 9, flex: 1 },

  /* Fee table */
  table: { marginTop: 2, marginBottom: 2 },
  tableHeaderRow: { flexDirection: "row", borderWidth: 1, borderColor: BC },
  tableRow: { flexDirection: "row", borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderLeftColor: BC, borderRightColor: BC, borderBottomColor: BC },
  tableRowLast: { flexDirection: "row", borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderLeftColor: BC, borderRightColor: BC, borderBottomColor: BC },
  tableCellLabel: { flex: 3, paddingVertical: 1.5, paddingHorizontal: 4, fontSize: 9, borderRightWidth: 1, borderRightColor: BC },
  tableCellAmount: { flex: 2, paddingVertical: 1.5, paddingHorizontal: 4, fontSize: 9, textAlign: "right" },
  tableCellLabelHeader: { flex: 3, paddingVertical: 1.5, paddingHorizontal: 4, fontSize: 9, fontWeight: "bold", textAlign: "center", borderRightWidth: 1, borderRightColor: BC },
  tableCellAmountHeader: { flex: 2, paddingVertical: 1.5, paddingHorizontal: 4, fontSize: 9, fontWeight: "bold", textAlign: "center" },
  tableNote: { fontSize: 8, fontStyle: "italic", marginTop: 1, marginBottom: 2 },

  /* Signatures */
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingHorizontal: 16 },
  sigBlock: { alignItems: "center", width: 180 },
  sigTitle: { fontSize: 9, fontWeight: "bold" },
  sigPosition: { fontSize: 9, marginTop: 2 },
  sigName: { fontSize: 10, fontWeight: "bold", marginTop: 70 },

  /* Footer */
  footerSpacer: { flexGrow: 1 },
  footerLine: { height: 1, backgroundColor: BC, marginBottom: 3 },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7 },
});

function fmtVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

function field(data: Record<string, string>, key: string, fallback = ""): string {
  return data[key] || fallback;
}

/* Two-column party row helper: label : leftVal  |  rightLabel : rightVal */
function TwoColPartyRow({
  label,
  leftVal,
  rightLabel,
  rightVal,
  labelBold,
}: {
  label: string;
  leftVal: React.ReactNode;
  rightLabel: string;
  rightVal: string;
  labelBold?: boolean;
}) {
  return (
    <View style={s.partyRow}>
      <Text style={labelBold ? s.partyLabelBold : s.partyLabel}>{label}</Text>
      <Text style={s.partyColon}>:</Text>
      <View style={s.twoColValue}>
        <View style={s.twoColLeft}>{typeof leftVal === "string" ? <Text>{leftVal}</Text> : leftVal}</View>
        <View style={s.twoColRight}>
          <Text>
            <Text style={s.twoColLabel}>{rightLabel} : </Text>
            {rightVal}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function ContractAppendixTemplate({
  date,
  company,
  data,
  signatureLabels,
}: PdfTemplateProps) {
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

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.topRow}>
          <View style={s.topLeft}>
            <Text style={s.companyNameHeader}>{company.name}</Text>
          </View>
          <View style={s.topRight}>
            <Text style={s.republicHeader}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
            <Text style={s.subHeader}>Độc lập – Tự Do – Hạnh Phúc</Text>
            <Text style={s.separator}>-------o0o-------</Text>
            <Text style={s.dateRight}>{formattedDate}</Text>
          </View>
        </View>

        <Text style={s.title}>PHỤ LỤC HỢP ĐỒNG</Text>

        {/* Preamble */}
        <Text style={s.bodyText}>
          Căn cứ Hợp đồng Cung cấp và Sử dụng Dịch vụ số{" "}
          <Text style={s.bodyTextBold}>{field(tf, "contractNo")}</Text> ký ngày{" "}
          <Text style={s.bodyTextBold}>{field(tf, "contractDate")}</Text> và các Phụ lục kèm theo giữa:
        </Text>

        {/* Bên A */}
        <View style={{ marginTop: 2, marginBottom: 2 }}>
          <View style={s.partyRow}>
            <Text style={s.partyLabelBold}>Bên A</Text>
            <Text style={s.partyColon}>:</Text>
            <Text style={s.partyValueBold}>{data.customerName}</Text>
          </View>
          <TwoColPartyRow
            label="Người đại diện"
            leftVal={field(tf, "representative")}
            rightLabel="Chức vụ"
            rightVal={field(tf, "position")}
          />
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>Địa chỉ lắp đặt</Text>
            <Text style={s.partyColon}>:</Text>
            <Text style={s.partyValue}>{field(tf, "installAddress", data.customerAddress)}</Text>
          </View>
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>Địa chỉ hóa đơn</Text>
            <Text style={s.partyColon}>:</Text>
            <Text style={s.partyValue}>{field(tf, "invoiceAddress", data.customerAddress)}</Text>
          </View>
          <TwoColPartyRow
            label="Điện thoại"
            leftVal={<Text style={s.bodyTextBold}>{field(tf, "phone")}</Text>}
            rightLabel="Fax"
            rightVal={field(tf, "fax")}
          />
          <TwoColPartyRow
            label="Số tài khoản"
            leftVal={field(tf, "bankAccount")}
            rightLabel="Tại Ngân hàng"
            rightVal={field(tf, "bankName")}
          />
          <TwoColPartyRow
            label="Mã số thuế"
            leftVal={<Text style={s.bodyTextBold}>{field(tf, "taxCode")}</Text>}
            rightLabel="Email"
            rightVal={field(tf, "email")}
          />
        </View>

        {/* Bên B */}
        <View style={{ marginBottom: 2 }}>
          <View style={s.partyRow}>
            <Text style={s.partyLabelBold}>Bên B</Text>
            <Text style={s.partyColon}>:</Text>
            <Text style={s.partyValueBold}>{company.name}</Text>
          </View>
          <TwoColPartyRow
            label="Người đại diện"
            leftVal={
              <Text>
                {company.representative ? "Ông: " : ""}
                <Text style={s.bodyTextBold}>{company.representative ?? ""}</Text>
              </Text>
            }
            rightLabel="Chức vụ"
            rightVal={company.position ?? ""}
          />
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>Vp giao dịch</Text>
            <Text style={s.partyColon}>:</Text>
            <Text style={s.partyValue}>{company.address ?? ""}</Text>
          </View>
          <TwoColPartyRow
            label="Điện thoại"
            leftVal={company.phone ?? ""}
            rightLabel="Mã số thuế"
            rightVal={company.taxCode ?? ""}
          />
          <TwoColPartyRow
            label="Số tài khoản"
            leftVal={company.bankAccount ?? ""}
            rightLabel="Tại"
            rightVal={company.bankName ?? ""}
          />
        </View>

        {/* Contract reference */}
        <Text style={s.bodyText}>
          Sau đây gọi tắt là <Text style={s.bodyTextBold}>&quot;Hợp đồng&quot;</Text>
        </Text>
        <Text style={[s.bodyText, { fontStyle: "italic", fontWeight: "bold", textDecoration: "underline" }]}>
          Bằng phụ lục này (&quot;Phụ lục&quot;), hai Bên cùng nhau thống nhất sửa đổi các điều khoản của Hợp đồng như sau:
        </Text>

        {/* ĐIỀU 1 */}
        <Text style={s.sectionTitle}>ĐIỀU 1: NỘI DUNG SỬA ĐỔI</Text>
        <Text style={s.bodyText}>
          Kể từ ngày{" "}
          <Text style={s.bodyTextBold}>{field(tf, "effectiveDate")}</Text>{" "}
          Bên A yêu cầu
        </Text>
        <Text style={[s.bodyText, { fontWeight: "bold", marginTop: 1 }]}> THÔNG TIN GÓI DỊCH VỤ:</Text>

        <View style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            Sử dụng gói Dịch vụ: {field(tf, "servicePackage")}; Gói tính cước:{field(tf, "servicePriceCode")}
          </Text>
        </View>
        <View style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            Giá gói Dịch vụ: <Text style={s.bodyTextBold}>{field(tf, "servicePrice")} VNĐ</Text>/ {field(tf, "paymentMonths")} Tháng.
          </Text>
        </View>
        <View style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            Kỳ hạn thanh toán từ ngày <Text style={s.bodyTextBold}>{field(tf, "paymentPeriodFrom")}</Text> đến ngày <Text style={s.bodyTextBold}>{field(tf, "paymentPeriodTo")}</Text>.
          </Text>
        </View>
        <View style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            Trường hợp Bên A có nhu cầu thay đổi gói Dịch vụ mà chỉ làm thay đổi duy nhất kỳ hạn thanh toán thì Bên B sẽ chủ động cập nhật gói Dịch vụ đáp ứng nhu cầu của Bên A và được xác nhận bằng Biên nhận thu tiền/hóa đơn mà Bên B cung cấp cho Bên A. Trường hợp hết kỳ hạn thanh toán của gói Dịch vụ Bên A đang sử dụng mà Bên A không tiếp tục thanh toán theo gói Dịch vụ đó thì được xem là Bên A tự động chuyển đổi sang gói Dịch vụ mới có cùng tốc độ đường truyền và các dịch vụ kèm theo với kỳ hạn thanh toán trả theo từng tháng.
          </Text>
        </View>

        {/* ĐIỀU 2 */}
        <Text style={s.sectionTitle}>ĐIỀU 2: CHÍNH SÁCH DỊCH VỤ</Text>
        <Text style={s.bodyText}>
          <Text style={s.bodyTextBold}>2.1.</Text>{"     "}Tổng số tiền Bên A thanh toán cho Bên B để thực hiện nội dung sửa đổi tại ĐIỀU 1 là{" "}
          <Text style={s.bodyTextBold}>{field(tf, "servicePrice", fmtVND(totalAmount))} VNĐ</Text>
        </Text>
        <Text style={s.bodyText}>Trong đó, bao gồm:</Text>

        {/* Fee table */}
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={s.tableCellLabelHeader}>Khoản thu</Text>
            <Text style={s.tableCellAmountHeader}>Số tiền (VNĐ)</Text>
          </View>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            const cfAmt = item.customFields?.amount ? Number(item.customFields.amount) : 0;
            const amt = cfAmt || item.amount || 0;
            return (
              <View key={idx} style={isLast ? s.tableRowLast : s.tableRow}>
                <Text style={s.tableCellLabel}>{item.productName || item.customFields?.label || ""}</Text>
                <Text style={s.tableCellAmount}>{fmtVND(amt)}</Text>
              </View>
            );
          })}
          <View style={s.tableRowLast}>
            <Text style={[s.tableCellLabelHeader, { textAlign: "left" }]}>Tổng tiền</Text>
            <Text style={[s.tableCellAmountHeader, { textAlign: "right" }]}>{fmtVND(totalAmount)}</Text>
          </View>
        </View>
        <Text style={s.tableNote}>Khoản thu đã bao gồm thuế VAT</Text>

        <Text style={s.bodyText}>
          <Text style={s.bodyTextBold}>2.2.</Text>{"     "}Theo quy định pháp luật, hóa đơn của Bên B phát hành hợp lệ không nhất thiết phải có con dấu của Bên B và Bên B lựa chọn sử dụng chữ viết là tiếng Việt không dấu trên hóa đơn
        </Text>

        {/* ĐIỀU 3 */}
        <Text style={s.sectionTitle}>ĐIỀU 3: ĐIỀU KHOẢN CHUNG</Text>
        <View style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            Bên A có trách nhiệm thanh toán khoản thu cho Bên B trong vòng 07 (bảy) ngày kể từ ngày phát hành hóa đơn giá trị gia tăng. Trường hợp Bên A thanh toán quá hạn so với quy định này hoặc không đồng ý thanh toán, Bên A phải bồi thường 8% giá trị thanh toán của hóa đơn.
          </Text>
        </View>
        <View style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            Trong quá trình sử dụng Dịch vụ nếu Bên A muốn thay đổi gói Dịch vụ sử dụng hoặc bất kỳ thay đổi nào khác liên quan đến Hợp đồng đã ký kết, hai Bên thống nhất Phương thức giao dịch điện tử (Ví dụ: SMS, email, qua website fpt.vn/member, ứng dụng Hi FPT) là một trong những Phương thức giao dịch giữa hai bên. Phụ lục này là một phần không tách rời của Hợp đồng, các nội dung khác của Hợp đồng không được đề cập đến trong Phụ lục này là không thay đổi và giữ nguyên giá trị pháp lý.
          </Text>
        </View>
        <View style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>
            Phụ lục này được lập thành 02 bản có giá trị như nhau, mỗi Bên giữ 01 (một) bản và có hiệu lực kể từ ngày ký hoặc ngày xác nhận Phụ lục thông qua Phương thức giao dịch điện tử.
          </Text>
        </View>

        {/* Signatures */}
        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <Text style={s.sigTitle}>{signatureLabels[0] ?? "Đại diện bên A"}</Text>
            <Text style={s.sigName}>{" "}</Text>
          </View>
          <View style={s.sigBlock}>
            <Text style={s.sigTitle}>{signatureLabels[1] ?? "Đại diện bên B"}</Text>
            {company.position && <Text style={s.sigPosition}>{company.position}</Text>}
            <Text style={s.sigName}>{company.representative ?? ""}</Text>
          </View>
        </View>

        {/* Footer — pushed to bottom via flexGrow spacer */}
        <View style={s.footerSpacer} />
        <View style={s.footerLine} />
        <View style={s.footerRow}>
          <Text style={s.footerText}>6-CS.0.1.1-BM/DVKH/HDCV/FTEL 1/0</Text>
          <Text style={s.footerText}>1/1</Text>
        </View>
      </Page>
    </Document>
  );
}
