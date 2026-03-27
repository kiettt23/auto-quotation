import { Document, Page, Text, View } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import type { PdfTemplateProps } from "../template-props";

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 42,
    color: "#000",
    lineHeight: 1.4,
  },

  /* Top header — two columns */
  topRow: { flexDirection: "row", marginBottom: 4 },
  topLeft: { flex: 1, alignItems: "center" },
  topRight: { flex: 1, alignItems: "center" },
  companyName: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  department: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  headerSep: { fontSize: 9, textAlign: "center", marginTop: 1 },
  republic: { fontSize: 10.5, fontWeight: "bold", textAlign: "center" },
  motto: {
    fontSize: 9,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 1,
  },
  dateLine: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
    fontStyle: "italic",
  },

  /* Ref / subject */
  refLine: { fontSize: 10, textAlign: "center" },
  refBold: { fontSize: 10, fontWeight: "bold" },
  subjectLine: { fontSize: 10, fontStyle: "italic", textAlign: "center" },

  /* Title */
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  /* Kính gửi / Địa chỉ — no paddingLeft, aligned with body */
  fieldRow: { flexDirection: "row", marginBottom: 2 },
  fieldLabel: {
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "bold",
    textDecoration: "underline",
    width: 70,
  },
  fieldValue: { fontSize: 10, fontWeight: "bold", flex: 1 },
  fieldValueNormal: { fontSize: 10, flex: 1 },

  /* Body */
  body: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: "justify",
    paddingLeft: 16,
  },
  bodyNoIndent: { fontSize: 10, marginBottom: 4, textAlign: "justify" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  boldItalic: { fontWeight: "bold", fontStyle: "italic" },

  /* Numbered list */
  numRow: { flexDirection: "row", marginBottom: 2, paddingLeft: 16 },
  numLabel: { fontSize: 10, width: 14 },
  numText: { fontSize: 10, flex: 1 },

  /* Bank info */
  bankRow: { flexDirection: "row", marginBottom: 1, paddingLeft: 16 },
  bankDash: { fontSize: 10, width: 10 },
  bankText: { fontSize: 10, flex: 1 },

  /* Closing */
  closing: {
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 2,
  },

  /* Signature area */
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sigLeft: { width: 160 },
  sigRight: { width: 240, alignItems: "center" },
  sigLabel: {
    fontSize: 9,
    fontStyle: "italic",
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 1,
  },
  sigItem: { fontSize: 9, paddingLeft: 6 },
  sigCompany: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  sigPosition: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  sigName: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
  },
});

function f(data: Record<string, string>, key: string, fallback = ""): string {
  return data[key] || fallback;
}

export function PaymentRequestTemplate({
  documentNumber,
  date,
  company,
  data,
}: PdfTemplateProps) {
  const tf = (data.templateFields ?? {}) as Record<string, string>;

  /* Parse date DD/MM/YYYY for formatted output */
  const [dd, mm, yyyy] = (date || "").split("/");
  const fmtDate = dd
    ? `HCM, ngày ${parseInt(dd)} tháng ${parseInt(mm)} năm ${yyyy}`
    : date;

  const contractNo = f(tf, "contractNo");
  const customerName = data.customerName ?? "";
  const totalAmount = f(tf, "totalAmount");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.topRow}>
          <View style={s.topLeft}>
            <Text style={s.companyName}>{company.name}</Text>
            <Text style={s.department}>TRUNG TÂM SÀI GÒN 4</Text>
            <Text style={s.headerSep}>----------------------</Text>
            <Text style={s.refLine}>
              Số: <Text style={s.refBold}>{contractNo || documentNumber}</Text>{" "}
              / FTEL
            </Text>
            <Text style={s.subjectLine}>V/v Thanh toán cước phí</Text>
          </View>
          <View style={s.topRight}>
            <Text style={s.republic}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
            <Text style={s.motto}>Độc lập - Tự do - Hạnh phúc</Text>
            <Text style={s.headerSep}>----------o0o----------</Text>
            <Text style={s.dateLine}>{fmtDate}</Text>
          </View>
        </View>

        {/* ── Title ── */}
        <Text style={s.title}>GIẤY ĐỀ NGHỊ THANH TOÁN</Text>

        {/* ── Kính gửi / Địa chỉ ── */}
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Kính gửi:</Text>
          <Text style={s.fieldValue}>{customerName}</Text>
        </View>
        <View style={[s.fieldRow, { marginBottom: 8 }]}>
          <Text style={s.fieldLabel}>Địa chỉ:</Text>
          <Text style={s.fieldValueNormal}>
            {data.customerAddress ||
              f(tf, "invoiceAddress") ||
              f(tf, "installAddress")}
          </Text>
        </View>

        {/* ── Opening paragraph ── */}
        <Text style={s.body}>
          {company.name} (FPT Telecom) cảm ơn Quý khách hàng đã tin tưởng, lựa
          chọn và sử dụng dịch vụ của chúng tôi.
        </Text>

        {/* ── Contract reference ── */}
        <Text style={s.body}>
          Căn cứ Hợp đồng cung cấp và sử dụng dịch vụ số{" "}
          <Text style={s.bold}>{contractNo}</Text> ký ngày{" "}
          <Text style={s.bold}>{f(tf, "contractDate")}</Text> giữa{" "}
          <Text style={s.bold}>{customerName}</Text> và FPT Telecom, gói dịch vụ{" "}
          <Text style={s.bold}>{f(tf, "servicePackage")}</Text>,{"\n"}
          FPT Telecom xin thông báo:
        </Text>

        {/* ── Fee line ── */}
        <Text style={s.body}>
          Cước phí Internet <Text style={s.bold}>{f(tf, "paymentMonths")}</Text>{" "}
          Tháng ({f(tf, "paymentPeriodFrom")} đến ngày {f(tf, "paymentPeriodTo")}) của hợp
          đồng là: <Text style={s.bold}>{totalAmount} VNĐ</Text>
        </Text>

        {/* ── Amount due ── */}
        <Text style={s.body}>
          Số tiền còn phải thanh toán:{" "}
          <Text style={s.bold}>{totalAmount} VNĐ</Text> bao gồm VAT (
          <Text style={s.italic}>Số tiền bằng chữ: </Text>
          <Text style={s.boldItalic}>{f(tf, "amountInWords")}./.</Text>).
        </Text>

        {/* ── Payment methods intro ── */}
        <Text style={s.body}>
          Hiện nay, FPT Telecom triển khai nhiều hình thức thanh toán trực tuyến
          đơn giản, tiện lợi cho Quý khách hàng chỉ bằng cách nhập thông tin số
          hợp đồng: <Text style={s.bold}>{contractNo}</Text> , trước ngày{" "}
          <Text style={s.bold}>{f(tf, "paymentDeadline")}</Text> qua các kênh
          sau :
        </Text>

        {/* ── Payment methods ── */}
        <View style={s.numRow}>
          <Text style={s.numLabel}>1.</Text>
          <Text style={s.numText}>
            Thanh toán trực tuyến tại website chính thức của FPT Telecom:{" "}
            <Text style={s.bold}>fpt.vn/pay, ứng dụng HiFPT</Text> ví điện tử{" "}
            <Text style={s.bold}>FPT Pay</Text> hoặc các ví điện tử khác.
          </Text>
        </View>
        <View style={s.numRow}>
          <Text style={s.numLabel}>2.</Text>
          <Text style={s.numText}>
            Thanh toán qua Internet Banking, Mobile Banking tại mục &quot;Thanh
            toán hóa đơn&quot; trên ứng dụng của các ngân hàng.
          </Text>
        </View>
        <View style={s.numRow}>
          <Text style={s.numLabel}>3.</Text>
          <Text style={s.numText}>
            Hoặc chuyển khoản đến tài khoản của FPT Telecom:
          </Text>
        </View>

        {/* ── Bank details ── */}
        <View style={s.bankRow}>
          <Text style={s.bankDash}>- </Text>
          <Text style={s.bankText}>Đơn vị thụ hưởng: {company.name}</Text>
        </View>
        <View style={s.bankRow}>
          <Text style={s.bankDash}>- </Text>
          <Text style={s.bankText}>
            Số tài khoản: {company.bankAccount ?? ""} tại{" "}
            {company.bankName ?? ""}
          </Text>
        </View>
        <View style={s.bankRow}>
          <Text style={s.bankDash}>- </Text>
          <Text style={s.bankText}>
            Nội dung (Ghi đúng cú pháp):{" "}
            <Text style={s.bold}>
              {f(tf, "paymentContent", `${contractNo} _ thanh toán cước`)}
            </Text>
          </Text>
        </View>

        {/* ── Support ── */}
        <Text style={[s.body, { marginTop: 4 }]}>
          Mọi yêu cầu cần hỗ trợ, Quý khách hàng vui lòng liên hệ với bộ phận
          tiếp nhận và hỗ trợ thông tin của dịch vụ khách hàng 24/7: ứng dụng
          HiFPT hoặc tổng đài 19006600.
        </Text>

        {/* ── Closing ── */}
        <Text style={s.closing}>Trân trọng cảm ơn!</Text>

        {/* ── Signatures ── */}
        <View style={s.sigRow}>
          <View style={s.sigLeft}>
            <Text style={s.sigLabel}>Nơi nhận:</Text>
            <Text style={s.sigItem}>- Quý KH;</Text>
            <Text style={s.sigItem}>- Lưu.</Text>
          </View>
          <View style={s.sigRight}>
            <Text style={s.sigCompany}>{company.name?.toUpperCase()}</Text>
            <Text style={s.sigPosition}>
              {(company.position ?? "GIÁM ĐỐC").toUpperCase()}
            </Text>
            <Text style={s.sigName}>{company.representative?.toUpperCase() ?? ""}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
