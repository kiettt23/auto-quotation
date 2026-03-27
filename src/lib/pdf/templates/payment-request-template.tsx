import { Document, Page, Text, View } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import type { PdfTemplateProps } from "../template-props";

const BC = "#000000";

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 48,
    color: BC,
    lineHeight: 1.5,
  },

  /* Top header — two columns */
  topRow: { flexDirection: "row", marginBottom: 12 },
  topLeft: { flex: 1, alignItems: "center" },
  topRight: { flex: 1, alignItems: "center" },
  companyNameHeader: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  departmentHeader: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  separator: { fontSize: 9, textAlign: "center", marginTop: 2 },
  republicHeader: { fontSize: 11, fontWeight: "bold", textAlign: "center" },
  subHeader: { fontSize: 9, textAlign: "center", marginTop: 1 },
  dateRight: { fontSize: 10, textAlign: "center", marginTop: 4, fontStyle: "italic" },

  /* Ref number / subject */
  refRow: { marginBottom: 2, textAlign: "center" },
  refText: { fontSize: 10 },
  refBold: { fontSize: 10, fontWeight: "bold" },
  subjectText: { fontSize: 10, fontStyle: "italic", textAlign: "center", marginBottom: 12 },

  /* Title */
  title: { fontSize: 15, fontWeight: "bold", textAlign: "center", marginTop: 8, marginBottom: 16 },

  /* Kính gửi */
  kinhGuiRow: { flexDirection: "row", marginBottom: 2 },
  kinhGuiLabel: { fontSize: 10, fontStyle: "italic", fontWeight: "bold", width: 60 },
  kinhGuiValue: { fontSize: 10, fontWeight: "bold", flex: 1 },
  addressRow: { flexDirection: "row", marginBottom: 8 },
  addressLabel: { fontSize: 10, fontStyle: "italic", fontWeight: "bold", width: 60 },
  addressValue: { fontSize: 10, flex: 1 },

  /* Body text */
  bodyText: { fontSize: 10, marginBottom: 4, textAlign: "justify" },
  bodyTextBold: { fontSize: 10, fontWeight: "bold" },
  bodyTextIndent: { fontSize: 10, marginBottom: 4, paddingLeft: 16 },

  /* Numbered list */
  numberedItem: { flexDirection: "row", marginBottom: 3, paddingLeft: 0 },
  numberedNum: { fontSize: 10, width: 16 },
  numberedText: { fontSize: 10, flex: 1 },

  /* Bank info */
  bankRow: { flexDirection: "row", marginBottom: 1, paddingLeft: 16 },
  bankLabel: { fontSize: 10, width: 8 },
  bankText: { fontSize: 10, flex: 1 },

  /* Closing */
  closingText: { fontSize: 10, fontStyle: "italic", fontWeight: "bold", marginTop: 8, marginBottom: 4 },

  /* Signatures */
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  sigBlockLeft: { width: 180 },
  sigBlockRight: { width: 220, alignItems: "center" },
  sigLabel: { fontSize: 9, fontStyle: "italic", marginBottom: 2 },
  sigLabelItem: { fontSize: 9, paddingLeft: 8 },
  sigTitle: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  sigPosition: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  sigName: { fontSize: 11, fontWeight: "bold", textAlign: "center", marginTop: 50 },
});

function field(data: Record<string, string>, key: string, fallback = ""): string {
  return data[key] || fallback;
}

export function PaymentRequestTemplate({
  documentNumber,
  date,
  company,
  data,
}: PdfTemplateProps) {
  const tf = (data.templateFields ?? {}) as Record<string, string>;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Top header — two columns */}
        <View style={s.topRow}>
          <View style={s.topLeft}>
            <Text style={s.companyNameHeader}>{company.name}</Text>
            <Text style={s.separator}>------------------</Text>
            <Text style={s.refText}>
              Số: <Text style={s.refBold}>{field(tf, "refNumber", documentNumber)}</Text>
            </Text>
            <Text style={[s.refText, { fontStyle: "italic" }]}>
              V/v {field(tf, "subject", "Thanh toán cước phí")}
            </Text>
          </View>
          <View style={s.topRight}>
            <Text style={s.republicHeader}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
            <Text style={s.subHeader}>Độc lập - Tự do - Hạnh phúc</Text>
            <Text style={s.separator}>----------o0o----------</Text>
            <Text style={s.dateRight}>{date}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={s.title}>GIẤY ĐỀ NGHỊ THANH TOÁN</Text>

        {/* Kính gửi */}
        <View style={s.kinhGuiRow}>
          <Text style={s.kinhGuiLabel}>Kính gửi:</Text>
          <Text style={s.kinhGuiValue}>{data.customerName}</Text>
        </View>
        <View style={s.addressRow}>
          <Text style={s.addressLabel}>Địa chỉ:</Text>
          <Text style={s.addressValue}>{data.customerAddress}</Text>
        </View>

        {/* Opening paragraph */}
        <Text style={s.bodyText}>
          {company.name} cảm ơn Quý khách hàng đã tin tưởng, lựa chọn và sử dụng dịch vụ của chúng tôi.
        </Text>

        {/* Contract reference */}
        <Text style={s.bodyText}>
          Căn cứ Hợp đồng cung cấp và sử dụng dịch vụ số{" "}
          <Text style={s.bodyTextBold}>{field(tf, "contractNo")}</Text> ký ngày{" "}
          {field(tf, "contractDate")} giữa{" "}
          <Text style={s.bodyTextBold}>{data.customerName}</Text> và {company.name}, gói dịch vụ{" "}
          {field(tf, "servicePackage")}, {company.name} xin thông báo:
        </Text>

        {/* Fee info */}
        <Text style={s.bodyText}>
          Cước phí {field(tf, "periodMonths")} Tháng ({field(tf, "periodFrom")} đến ngày{" "}
          {field(tf, "periodTo")}) của hợp đồng là:{" "}
          <Text style={s.bodyTextBold}>{field(tf, "totalAmount")} VNĐ</Text>
        </Text>

        <Text style={s.bodyText}>
          Số tiền còn phải thanh toán:{" "}
          <Text style={s.bodyTextBold}>{field(tf, "totalAmount")} VNĐ</Text> bao gồm VAT (Số tiền bằng chữ:{" "}
          <Text style={{ fontStyle: "italic" }}>{field(tf, "amountInWords")}./.</Text>).
        </Text>

        {/* Payment methods intro */}
        <Text style={s.bodyText}>
          Hiện nay, {company.name} triển khai nhiều hình thức thanh toán trực tuyến đơn giản, tiện lợi cho Quý khách hàng chỉ bằng cách nhập thông tin số hợp đồng:{" "}
          <Text style={s.bodyTextBold}>{field(tf, "contractNo")}</Text>, trước ngày{" "}
          <Text style={s.bodyTextBold}>{field(tf, "paymentDeadline")}</Text> qua các kênh sau:
        </Text>

        {/* Payment methods */}
        <View style={s.numberedItem}>
          <Text style={s.numberedNum}>1.</Text>
          <Text style={s.numberedText}>
            Thanh toán trực tuyến tại website chính thức, ứng dụng hoặc các ví điện tử.
          </Text>
        </View>
        <View style={s.numberedItem}>
          <Text style={s.numberedNum}>2.</Text>
          <Text style={s.numberedText}>
            Thanh toán qua Internet Banking, Mobile Banking tại mục &quot;Thanh toán hóa đơn&quot; trên ứng dụng của các ngân hàng.
          </Text>
        </View>
        <View style={s.numberedItem}>
          <Text style={s.numberedNum}>3.</Text>
          <Text style={s.numberedText}>
            Hoặc chuyển khoản đến tài khoản của {company.name}:
          </Text>
        </View>

        {/* Bank details */}
        <View style={s.bankRow}>
          <Text style={s.bankLabel}>-</Text>
          <Text style={s.bankText}>Đơn vị thụ hưởng: {company.name}</Text>
        </View>
        <View style={s.bankRow}>
          <Text style={s.bankLabel}>-</Text>
          <Text style={s.bankText}>
            Số tài khoản: {field(tf, "bankAccount")} tại Ngân hàng {field(tf, "bankName")}-Chi nhánh {field(tf, "bankBranch")}
          </Text>
        </View>
        <View style={s.bankRow}>
          <Text style={s.bankLabel}>-</Text>
          <Text style={s.bankText}>
            Nội dung (Ghi đúng cú pháp): <Text style={s.bodyTextBold}>{field(tf, "paymentContent")}</Text>
          </Text>
        </View>

        {/* Support */}
        <Text style={[s.bodyText, { marginTop: 6 }]}>
          Mọi yêu cầu cần hỗ trợ, Quý khách hàng vui lòng liên hệ với bộ phận tiếp nhận và hỗ trợ thông tin
          {company.phone ? `: ${company.phone}` : ""}.
        </Text>

        {/* Closing */}
        <Text style={s.closingText}>Trân trọng cảm ơn!</Text>

        {/* Signatures */}
        <View style={s.sigRow}>
          <View style={s.sigBlockLeft}>
            <Text style={s.sigLabel}>Nơi nhận:</Text>
            <Text style={s.sigLabelItem}>- Quý KH;</Text>
            <Text style={s.sigLabelItem}>- Lưu.</Text>
          </View>
          <View style={s.sigBlockRight}>
            <Text style={s.sigTitle}>{company.name}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
