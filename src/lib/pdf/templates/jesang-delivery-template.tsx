import { Document, Page, Text, View } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import type { PdfTemplateProps } from "../template-props";
import { getCellValue, calculateTotal } from "../pdf-helpers";
import { fmtCurrency } from "../template-props";

/**
 * Jesang-style delivery order template
 * Pixel-perfect layout matching PHIẾU GIAO NHẬN (GOODS DELIVERY ORDER)
 * Features: bordered customer info grid, bilingual labels, 5 signature blocks
 */

const border = { borderWidth: 1, borderColor: "#000000" };
const borderBottom = { borderBottomWidth: 1, borderBottomColor: "#000000" };
const borderRight = { borderRightWidth: 1, borderRightColor: "#000000" };

const js = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 40,
    color: "#000000",
  },
  /* ── Header ── */
  companyName: { fontSize: 13, fontWeight: "bold", marginBottom: 2 },
  companyDetail: { fontSize: 9, marginBottom: 1 },
  titleBlock: { alignItems: "center", marginTop: 16, marginBottom: 12 },
  titleMain: { fontSize: 20, fontWeight: "bold" },
  titleSub: { fontSize: 11, marginTop: 2 },
  /* ── Date + Doc number row ── */
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 9,
  },
  docNumBox: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: "bold",
  },
  /* ── Customer info grid ── */
  infoGrid: { ...border, marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    minHeight: 28,
    ...borderBottom,
  },
  infoLabel: {
    width: "25%",
    padding: 4,
    fontSize: 8,
    ...borderRight,
  },
  infoValue: {
    width: "75%",
    padding: 4,
    fontSize: 9,
    fontWeight: "bold",
  },
  infoHalfRow: {
    flexDirection: "row",
    minHeight: 24,
    ...borderBottom,
  },
  infoHalfLabel: {
    width: "25%",
    padding: 4,
    fontSize: 8,
    ...borderRight,
  },
  infoHalfValue: {
    width: "25%",
    padding: 4,
    fontSize: 9,
    ...borderRight,
  },
  /* ── Table ── */
  tableWrap: { ...border, marginBottom: 4 },
  tableHeader: {
    flexDirection: "row",
    ...borderBottom,
    backgroundColor: "#f5f5f5",
    minHeight: 32,
  },
  th: {
    padding: 4,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    ...borderRight,
  },
  tableRow: {
    flexDirection: "row",
    ...borderBottom,
    minHeight: 24,
  },
  td: {
    padding: 4,
    fontSize: 9,
    ...borderRight,
    justifyContent: "center",
  },
  totalRow: {
    flexDirection: "row",
    ...borderBottom,
    minHeight: 24,
  },
  /* ── Signatures ── */
  sigRow: {
    flexDirection: "row",
    marginTop: 24,
    ...border,
  },
  sigBlock: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 40,
    ...borderRight,
  },
  sigTitle: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  sigSub: { fontSize: 8, fontStyle: "italic" },
  /* ── Notes ── */
  notes: { fontSize: 9, marginTop: 8, color: "#374151" },
});

export function JesangDeliveryTemplate({
  title,
  documentNumber,
  date,
  company,
  data,
  columns,
  showTotal,
  signatureLabels,
}: PdfTemplateProps) {
  const items = data.items ?? [];
  const hasAmount = columns.some((c) => c.key === "amount");
  const total = hasAmount ? calculateTotal(items) : 0;

  /* Parse date "19/3/2026" → parts */
  const dateParts = date.split("/");
  const day = dateParts[0] ?? "";
  const month = dateParts[1] ?? "";
  const year = dateParts[2] ?? "";

  return (
    <Document>
      <Page size="A4" style={js.page}>
        {/* ── Company header ── */}
        <View>
          <Text style={js.companyName}>{company.name}</Text>
          {company.address && <Text style={js.companyDetail}>{company.address}</Text>}
          {company.taxCode && <Text style={js.companyDetail}>MST : {company.taxCode}</Text>}
        </View>

        {/* ── Title ── */}
        <View style={js.titleBlock}>
          <Text style={js.titleMain}>{title}</Text>
          {/* Subtitle from document type label — rendered if contains parentheses */}
          {title.includes("(") ? null : (
            <Text style={js.titleSub}>( GOODS DELIVERY ORDER )</Text>
          )}
        </View>

        {/* ── Date + Document number ── */}
        <View style={js.dateRow}>
          <Text>
            Ngày giao (Delivery date) : Ngày (Date) {day} Tháng (Month) {month} Năm (Year) {year}
          </Text>
          <Text style={js.docNumBox}>{documentNumber}</Text>
        </View>

        {/* ── Customer info grid ── */}
        <View style={js.infoGrid}>
          {/* Buyer */}
          <View style={js.infoRow}>
            <View style={js.infoLabel}>
              <Text>Khách hàng (Buyer)</Text>
            </View>
            <View style={js.infoValue}>
              <Text>{data.customerName ?? ""}</Text>
              {data.customerAddress && (
                <Text style={{ fontWeight: "normal", fontSize: 8 }}>
                  Địa chỉ : {data.customerAddress}
                </Text>
              )}
            </View>
          </View>

          {/* Delivery address */}
          {data.deliveryAddress && (
            <View style={js.infoRow}>
              <View style={js.infoLabel}>
                <Text>Giao hàng đến địa điểm chỉ{"\n"}định của Jesang{"\n"}(Delivery to address that{"\n"}Jesang requests)</Text>
              </View>
              <View style={js.infoValue}>
                <Text>{data.deliveryAddress}</Text>
              </View>
            </View>
          )}

          {/* Driver + Receiver */}
          <View style={js.infoHalfRow}>
            <View style={js.infoHalfLabel}>
              <Text>Tên tài xế (Driver&apos;s name)</Text>
            </View>
            <View style={js.infoHalfValue}>
              <Text>{data.driverName ?? ""}</Text>
            </View>
            <View style={js.infoHalfLabel}>
              <Text>Người nhận (Receiver)</Text>
            </View>
            <View style={{ width: "25%", padding: 4, fontSize: 9 }}>
              <Text>{data.receiverName ?? ""}</Text>
            </View>
          </View>

          {/* Vehicle + Phone */}
          <View style={{ ...js.infoHalfRow, borderBottomWidth: 0 }}>
            <View style={js.infoHalfLabel}>
              <Text>Số xe (Vehicle Identification)</Text>
            </View>
            <View style={js.infoHalfValue}>
              <Text>{data.vehicleId ?? ""}</Text>
            </View>
            <View style={js.infoHalfLabel}>
              <Text>Số điện thoại (Number phone)</Text>
            </View>
            <View style={{ width: "25%", padding: 4, fontSize: 9 }}>
              <Text>{data.receiverPhone ?? ""}</Text>
            </View>
          </View>
        </View>

        {/* ── Items table ── */}
        <View style={js.tableWrap}>
          {/* Table header */}
          <View style={js.tableHeader}>
            {columns.map((col, i) => (
              <View
                key={col.key}
                style={[
                  js.th,
                  { width: col.width },
                  i === columns.length - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                <Text>{col.label}</Text>
              </View>
            ))}
          </View>

          {/* Table rows */}
          {items.map((item, i) => (
            <View key={i} style={js.tableRow}>
              {columns.map((col, ci) => (
                <View
                  key={col.key}
                  style={[
                    js.td,
                    { width: col.width, textAlign: (col.align ?? "left") as "left" | "right" | "center" },
                    ci === columns.length - 1 ? { borderRightWidth: 0 } : {},
                  ]}
                >
                  <Text>{getCellValue(item, col, i)}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Total row */}
          {showTotal && (
            <View style={{ ...js.totalRow, borderBottomWidth: 0 }}>
              {columns.map((col, ci) => {
                const isBeforeAmount = ci < columns.length - 2;
                const isTotalLabel = ci === 1;
                const isAmountCol = col.key === "amount" || ci === columns.length - 2;
                return (
                  <View
                    key={col.key}
                    style={[
                      js.td,
                      { width: col.width },
                      ci === columns.length - 1 ? { borderRightWidth: 0 } : {},
                    ]}
                  >
                    {isTotalLabel && (
                      <Text style={{ fontWeight: "bold", textAlign: "center" }}>Tổng Cộng (Total)</Text>
                    )}
                    {isAmountCol && hasAmount && (
                      <Text style={{ fontWeight: "bold", textAlign: "right" }}>{fmtCurrency(total)}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Notes ── */}
        {data.notes && (
          <View style={js.notes}>
            <Text style={{ fontWeight: 700, marginBottom: 2 }}>Ghi chú:</Text>
            {data.notes.split("\n").map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>
        )}

        {/* ── Signatures ── */}
        <View style={js.sigRow}>
          {signatureLabels.map((label, i) => {
            const parts = label.split("\n");
            const vn = parts[0] ?? label;
            const en = parts[1] ?? "";
            return (
              <View
                key={i}
                style={[
                  js.sigBlock,
                  i === signatureLabels.length - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                <Text style={js.sigTitle}>{vn}</Text>
                {en && <Text style={js.sigSub}>{en}</Text>}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
