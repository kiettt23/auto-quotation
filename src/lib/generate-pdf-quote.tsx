import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { calculateLineTotal, calculateQuoteTotals } from "./pricing-engine";
import { formatCurrency } from "./format-currency";
import { numberToVietnameseWords } from "./format-number-to-words";
import { registerFonts } from "./pdf/font-registration";

// Register fonts via shared module — safe to call multiple times
registerFonts();

type QuoteItem = {
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
};

export type PdfQuoteData = {
  quoteNumber: string;
  createdAt: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: QuoteItem[];
  globalDiscountPercent: number;
  vatPercent: number;
  shippingFee: number;
  otherFees: number;
  otherFeesLabel: string;
  terms: string;
  validUntil: string;
};

export type PdfCompanyData = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  showAmountInWords: boolean;
  showBankInfo: boolean;
  showSignatureBlocks: boolean;
  primaryColor: string;
};

function makeStyles(color: string) {
  return StyleSheet.create({
    page: { fontFamily: "Roboto", fontSize: 9, padding: 32, color: "#1a1a1a" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    logo: { width: 52, height: 52, objectFit: "contain" },
    companyName: { fontSize: 12, fontWeight: "bold", color, marginBottom: 2 },
    companyInfo: { fontSize: 8, color: "#555" },
    title: { textAlign: "center", marginBottom: 12 },
    titleText: { fontSize: 16, fontWeight: "bold", color },
    titleSub: { fontSize: 8, color: "#777", marginTop: 2 },
    customerBox: { border: "1px solid #e2e8f0", borderRadius: 4, padding: 8, marginBottom: 12 },
    customerRow: { flexDirection: "row", marginBottom: 2 },
    customerLabel: { fontWeight: "bold", width: 70 },
    tableHeader: { flexDirection: "row", backgroundColor: color, color: "white", fontWeight: "bold", padding: "4 6" },
    tableRow: { flexDirection: "row", padding: "3 6", borderBottom: "0.5px solid #e2e8f0" },
    tableRowAlt: { flexDirection: "row", padding: "3 6", borderBottom: "0.5px solid #e2e8f0", backgroundColor: "#f8fafc" },
    colStt: { width: 24, textAlign: "center" },
    colName: { flex: 1 },
    colUnit: { width: 40, textAlign: "center" },
    colQty: { width: 32, textAlign: "right" },
    colPrice: { width: 72, textAlign: "right" },
    colCk: { width: 32, textAlign: "right" },
    colTotal: { width: 80, textAlign: "right", fontWeight: "bold" },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    summaryLabel: { color: "#555" },
    summaryValue: { textAlign: "right" },
    totalRow: { flexDirection: "row", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: 4, marginTop: 4 },
    totalLabel: { fontWeight: "bold", fontSize: 11, color },
    totalValue: { fontWeight: "bold", fontSize: 11, color },
    words: { fontStyle: "italic", color: "#555", marginTop: 8, marginBottom: 8 },
    termsTitle: { fontWeight: "bold", marginBottom: 3 },
    termsText: { color: "#555", lineHeight: 1.5 },
    sigGrid: { flexDirection: "row", marginTop: 24 },
    sigBlock: { flex: 1, textAlign: "center" },
    sigLabel: { fontWeight: "bold" },
    sigSub: { color: "#888", marginTop: 28, fontSize: 8 },
    bankInfo: { borderTop: "1px solid #e2e8f0", paddingTop: 6, marginTop: 8, color: "#555" },
    bankLabel: { fontWeight: "bold", marginBottom: 2 },
  });
}

function QuotePdfDocument({ data, company }: { data: PdfQuoteData; company: PdfCompanyData }) {
  const color = company.primaryColor || "#0369A1";
  const s = makeStyles(color);
  const items = data.items.filter((i) => i.name);
  const lineTotals = items.map((i) => calculateLineTotal(i.unitPrice, i.quantity, i.discountPercent));
  const totals = calculateQuoteTotals(
    items.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity, discountPercent: i.discountPercent })),
    data.globalDiscountPercent,
    data.vatPercent,
    data.shippingFee,
    data.otherFees
  );
  const hasCk = items.some((i) => i.discountPercent > 0);
  const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
            {company.logoUrl ? <Image src={company.logoUrl} style={s.logo} /> : null}
            <View>
              <Text style={s.companyName}>{company.companyName}</Text>
              {company.address ? <Text style={s.companyInfo}>{company.address}</Text> : null}
              {company.phone ? <Text style={s.companyInfo}>ĐT: {company.phone} {company.email ? `| Email: ${company.email}` : ""}</Text> : null}
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={s.title}>
          <Text style={s.titleText}>BẢNG BÁO GIÁ</Text>
          <Text style={s.titleSub}>Số: {data.quoteNumber} — Ngày: {date}</Text>
        </View>

        {/* Customer */}
        {data.customerName ? (
          <View style={s.customerBox}>
            <View style={s.customerRow}><Text style={s.customerLabel}>Khách hàng:</Text><Text>{data.customerName}</Text></View>
            {data.customerCompany ? <View style={s.customerRow}><Text style={s.customerLabel}>Công ty:</Text><Text>{data.customerCompany}</Text></View> : null}
            {data.customerPhone ? <View style={s.customerRow}><Text style={s.customerLabel}>Điện thoại:</Text><Text>{data.customerPhone}</Text></View> : null}
            {data.customerEmail ? <View style={s.customerRow}><Text style={s.customerLabel}>Email:</Text><Text>{data.customerEmail}</Text></View> : null}
            {data.customerAddress ? <View style={s.customerRow}><Text style={s.customerLabel}>Địa chỉ:</Text><Text>{data.customerAddress}</Text></View> : null}
          </View>
        ) : null}

        {/* Items table */}
        {items.length > 0 ? (
          <View style={{ marginBottom: 12 }}>
            <View style={s.tableHeader}>
              <Text style={s.colStt}>STT</Text>
              <Text style={s.colName}>Sản phẩm</Text>
              <Text style={s.colUnit}>ĐVT</Text>
              <Text style={s.colQty}>SL</Text>
              <Text style={s.colPrice}>Đơn giá</Text>
              {hasCk ? <Text style={s.colCk}>CK%</Text> : null}
              <Text style={s.colTotal}>Thành tiền</Text>
            </View>
            {items.map((item, i) => (
              <View key={i} style={i % 2 === 1 ? s.tableRowAlt : s.tableRow}>
                <Text style={s.colStt}>{i + 1}</Text>
                <Text style={s.colName}>{item.name}</Text>
                <Text style={s.colUnit}>{item.unit}</Text>
                <Text style={s.colQty}>{item.quantity}</Text>
                <Text style={s.colPrice}>{formatCurrency(item.unitPrice)}</Text>
                {hasCk ? <Text style={s.colCk}>{item.discountPercent > 0 ? `${item.discountPercent}%` : ""}</Text> : null}
                <Text style={s.colTotal}>{formatCurrency(lineTotals[i])}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Summary */}
        <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
          <View style={{ width: 220 }}>
            <View style={s.summaryRow}><Text style={s.summaryLabel}>Tạm tính</Text><Text style={s.summaryValue}>{formatCurrency(totals.subtotal)}</Text></View>
            {data.globalDiscountPercent > 0 ? <View style={s.summaryRow}><Text style={s.summaryLabel}>Chiết khấu {data.globalDiscountPercent}%</Text><Text style={s.summaryValue}>-{formatCurrency(totals.discountAmount)}</Text></View> : null}
            {data.shippingFee > 0 ? <View style={s.summaryRow}><Text style={s.summaryLabel}>Phí vận chuyển</Text><Text style={s.summaryValue}>{formatCurrency(data.shippingFee)}</Text></View> : null}
            {data.otherFees > 0 ? <View style={s.summaryRow}><Text style={s.summaryLabel}>{data.otherFeesLabel || "Phí khác"}</Text><Text style={s.summaryValue}>{formatCurrency(data.otherFees)}</Text></View> : null}
            {data.vatPercent > 0 ? <View style={s.summaryRow}><Text style={s.summaryLabel}>VAT {data.vatPercent}%</Text><Text style={s.summaryValue}>{formatCurrency(totals.vatAmount)}</Text></View> : null}
            <View style={s.totalRow}><Text style={s.totalLabel}>TỔNG CỘNG</Text><Text style={s.totalValue}>{formatCurrency(totals.total)} VNĐ</Text></View>
          </View>
        </View>

        {/* Amount in words */}
        {company.showAmountInWords !== false && totals.total > 0 ? (
          <Text style={s.words}>Bằng chữ: {numberToVietnameseWords(totals.total)}</Text>
        ) : null}

        {/* Valid until */}
        {data.validUntil ? (
          <Text style={{ color: "#777", fontSize: 8, marginBottom: 8 }}>Hiệu lực đến: {new Date(data.validUntil).toLocaleDateString("vi-VN")}</Text>
        ) : null}

        {/* Terms */}
        {data.terms ? (
          <View style={{ marginBottom: 12 }}>
            <Text style={s.termsTitle}>Điều khoản:</Text>
            <Text style={s.termsText}>{data.terms}</Text>
          </View>
        ) : null}

        {/* Signature blocks */}
        {company.showSignatureBlocks !== false ? (
          <View style={s.sigGrid}>
            <View style={s.sigBlock}><Text style={s.sigLabel}>BÊN MUA</Text><Text style={s.sigSub}>(Ký, ghi rõ họ tên)</Text></View>
            <View style={s.sigBlock}><Text style={s.sigLabel}>BÊN BÁN</Text><Text style={s.sigSub}>(Ký, ghi rõ họ tên)</Text></View>
          </View>
        ) : null}

        {/* Bank info */}
        {company.showBankInfo && company.bankName ? (
          <View style={s.bankInfo}>
            <Text style={s.bankLabel}>Thông tin chuyển khoản:</Text>
            <Text>Ngân hàng: {company.bankName} | STK: {company.bankAccount} | CTK: {company.bankOwner}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function generatePdfQuote(data: PdfQuoteData, company: PdfCompanyData): Promise<Buffer> {
  const buffer = await renderToBuffer(<QuotePdfDocument data={data} company={company} />);
  return Buffer.from(buffer);
}
