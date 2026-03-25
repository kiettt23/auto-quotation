import { Document, Page, Text, View } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import type { PdfTemplateProps } from "../template-props";

/**
 * Jesang-style delivery order — pixel-perfect hardcoded layout
 * Only DATA changes: company, customer, items, totals
 * All labels, columns, signatures are fixed
 */

const B = 1; // border thickness
const BC = "#000000";

const s = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 52,
    color: BC,
  },

  /* Header */
  companyName: { fontSize: 13, fontWeight: "bold", marginBottom: 2 },
  companyDetail: { fontSize: 9, marginBottom: 1 },
  rule1: {
    borderBottomWidth: 1.5,
    borderBottomColor: BC,
    marginTop: 10,
    marginBottom: 12,
  },
  rule2: { borderBottomWidth: 0.5, borderBottomColor: BC, marginBottom: 14 },

  /* Title */
  titleWrap: { alignItems: "center", marginBottom: 14 },
  titleMain: { fontSize: 20, fontWeight: "bold", letterSpacing: 0.5 },
  titleSub: { fontSize: 10, marginTop: 2, letterSpacing: 0.3 },

  /* Date row */
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: { fontSize: 9 },
  docNumBox: {
    borderWidth: B,
    borderColor: BC,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: "bold",
  },

  /* Info grid */
  grid: { borderWidth: B, borderColor: BC, marginBottom: 20 },
  gridRow: {
    flexDirection: "row",
    minHeight: 50,
    borderBottomWidth: B,
    borderBottomColor: BC,
  },
  gridRowLast: { flexDirection: "row", minHeight: 28 },
  gridLabel: {
    width: "25%",
    padding: 6,
    fontSize: 7.5,
    borderRightWidth: B,
    borderRightColor: BC,
    justifyContent: "center",
  },
  gridValue: {
    width: "75%",
    padding: 6,
    fontSize: 9,
    fontWeight: "bold",
    justifyContent: "center",
  },
  gridHalfLabel: {
    width: "25%",
    padding: 6,
    fontSize: 7.5,
    borderRightWidth: B,
    borderRightColor: BC,
    justifyContent: "center",
  },
  gridHalfValue: {
    width: "25%",
    padding: 6,
    fontSize: 9,
    justifyContent: "center",
  },
  gridHalfValueBorder: {
    width: "25%",
    padding: 6,
    fontSize: 9,
    borderRightWidth: B,
    borderRightColor: BC,
    justifyContent: "center",
  },

  /* Table */
  table: { borderWidth: B, borderColor: BC, marginBottom: 4 },
  thRow: {
    flexDirection: "row",
    borderBottomWidth: B,
    borderBottomColor: BC,
    minHeight: 34,
  },
  th: {
    padding: 4,
    fontSize: 7.5,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: B,
    borderRightColor: BC,
  },
  thSub: { fontSize: 7, fontWeight: "normal" },
  tdRow: {
    flexDirection: "row",
    borderBottomWidth: B,
    borderBottomColor: BC,
    minHeight: 26,
  },
  td: {
    padding: 5,
    fontSize: 9,
    borderRightWidth: B,
    borderRightColor: BC,
    justifyContent: "center",
  },
  totalRow: { flexDirection: "row", minHeight: 26 },

  /* Signatures */
  sigWrap: { borderWidth: B, borderColor: BC, marginTop: 32 },
  sigTitleRow: {
    flexDirection: "row",
    borderBottomWidth: B,
    borderBottomColor: BC,
    minHeight: 28,
  },
  sigTitleCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderRightWidth: B,
    borderRightColor: BC,
  },
  sigTitleVn: { fontSize: 9, fontWeight: "bold" },
  sigTitleEn: { fontSize: 7.5 },
  sigSpaceRow: { flexDirection: "row", minHeight: 75 },
  sigSpaceCell: { flex: 1, borderRightWidth: B, borderRightColor: BC },

  /* Notes */
  notes: { fontSize: 9, marginTop: 8 },
});

/* Fixed column widths matching original document */
const COL = {
  stt: "7%",
  contract: "13%",
  item: "22%",
  lot: "12%",
  box: "12%",
  weight: "16%",
  invoice: "18%",
};

export function JesangDeliveryTemplate({
  documentNumber,
  date,
  company,
  data,
}: PdfTemplateProps) {
  const items = data.items ?? [];

  /* Parse date */
  const dp = date.split("/");
  const day = dp[0] ?? "";
  const month = (dp[1] ?? "").padStart(2, "0");
  const year = dp[2] ?? "";

  /* Calculate totals from customFields */
  let totalBox = 0;
  let totalWeight = 0;
  for (const item of items) {
    totalBox += Number(item.customFields?.["boxQty"] ?? 0);
    totalWeight += Number(item.customFields?.["netWeight"] ?? 0);
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ═══ HEADER ═══ */}
        <View>
          <Text style={s.companyName}>{company.name}</Text>
          {company.address && (
            <Text style={s.companyDetail}>{company.address}</Text>
          )}
          {company.taxCode && (
            <Text style={s.companyDetail}>MST : {company.taxCode}</Text>
          )}
        </View>
        <View style={s.rule1} />

        {/* ═══ TITLE ═══ */}
        <View style={s.titleWrap}>
          <Text style={s.titleMain}>PHIẾU GIAO NHẬN</Text>
          <Text style={s.titleSub}>( GOODS DELIVERY ORDER )</Text>
        </View>

        {/* ═══ DATE + DOC NUMBER ═══ */}
        <View style={s.dateRow}>
          <Text style={s.dateText}>
            Ngày giao (Delivery date) : Ngày (Date) {day} Tháng (Month) {month}{" "}
            Năm (Year) {year}
          </Text>
          <Text style={s.docNumBox}>{documentNumber}</Text>
        </View>

        {/* ═══ CUSTOMER INFO GRID ═══ */}
        <View style={s.grid}>
          {/* Row 1: Buyer — name + address inline */}
          <View style={s.gridRow}>
            <View style={s.gridLabel}>
              <Text>Khách hàng (Buyer)</Text>
            </View>
            <View style={s.gridValue}>
              <Text>{data.customerName ?? ""}</Text>
              {data.customerAddress ? (
                <Text
                  style={{ fontWeight: "normal", fontSize: 8, marginTop: 1 }}
                >
                  Địa chỉ : {data.customerAddress}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Row 2: Delivery — name + address inline */}
          <View style={s.gridRow}>
            <View style={s.gridLabel}>
              <Text>
                Giao hàng đến địa điểm chỉ{"\n"}định của Jesang{"\n"}(Delivery
                to address that{"\n"}Jesang requests)
              </Text>
            </View>
            <View style={s.gridValue}>
              <Text>{data.templateFields?.deliveryName ?? ""}</Text>
              {data.templateFields?.deliveryAddress ? (
                <Text
                  style={{ fontWeight: "normal", fontSize: 8, marginTop: 1 }}
                >
                  Địa chỉ : {data.templateFields?.deliveryAddress}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Row 3: Driver + Receiver */}
          <View style={[s.gridRow, { minHeight: 28 }]}>
            <View style={s.gridHalfLabel}>
              <Text>Tên tài xế (Driver{"'"}s name)</Text>
            </View>
            <View style={s.gridHalfValueBorder}>
              <Text>{data.templateFields?.driverName ?? ""}</Text>
            </View>
            <View style={s.gridHalfLabel}>
              <Text>Người nhận (Receiver)</Text>
            </View>
            <View style={s.gridHalfValue}>
              <Text>{data.receiverName ?? ""}</Text>
            </View>
          </View>

          {/* Row 4: Vehicle + Phone */}
          <View style={s.gridRowLast}>
            <View style={s.gridHalfLabel}>
              <Text>Số xe (Vehicle Identification)</Text>
            </View>
            <View style={s.gridHalfValueBorder}>
              <Text>{data.templateFields?.vehicleId ?? ""}</Text>
            </View>
            <View style={s.gridHalfLabel}>
              <Text>Số điện thoại (Number phone)</Text>
            </View>
            <View style={s.gridHalfValue}>
              <Text>{data.receiverPhone ?? ""}</Text>
            </View>
          </View>
        </View>

        {/* ═══ ITEMS TABLE ═══ */}
        <View style={s.table}>
          {/* Header — bilingual, fixed columns */}
          <View style={s.thRow}>
            <View style={[s.th, { width: COL.stt }]}>
              <Text>STT</Text>
              <Text style={s.thSub}>No</Text>
            </View>
            <View style={[s.th, { width: COL.contract }]}>
              <Text>Hợp đồng</Text>
              <Text style={s.thSub}>Contract No</Text>
            </View>
            <View style={[s.th, { width: COL.item }]}>
              <Text>Tên hàng</Text>
              <Text style={s.thSub}>Item</Text>
            </View>
            <View style={[s.th, { width: COL.lot }]}>
              <Text>Số Lô</Text>
              <Text style={s.thSub}>Lot No</Text>
            </View>
            <View style={[s.th, { width: COL.box }]}>
              <Text>Số thùng /</Text>
              <Text>kiện</Text>
              <Text style={s.thSub}>Box Qty</Text>
            </View>
            <View style={[s.th, { width: COL.weight }]}>
              <Text>Cân nặng</Text>
              <Text style={s.thSub}>Net Weight (kg)</Text>
            </View>
            <View style={[s.th, { width: COL.invoice, borderRightWidth: 0 }]}>
              <Text>Hóa đơn</Text>
              <Text style={s.thSub}>Invoice VAT</Text>
            </View>
          </View>

          {/* Data rows */}
          {items.map((item, i) => (
            <View key={i} style={s.tdRow}>
              <View style={[s.td, { width: COL.stt, textAlign: "center" }]}>
                <Text>{i + 1}</Text>
              </View>
              <View style={[s.td, { width: COL.contract }]}>
                <Text>{String(item.customFields?.["contractNo"] ?? "")}</Text>
              </View>
              <View style={[s.td, { width: COL.item }]}>
                <Text>{item.productName}</Text>
              </View>
              <View style={[s.td, { width: COL.lot, textAlign: "center" }]}>
                <Text>{String(item.customFields?.["lotNo"] ?? "")}</Text>
              </View>
              <View style={[s.td, { width: COL.box, textAlign: "center" }]}>
                <Text>
                  {String(item.customFields?.["boxQty"] ?? "")}
                </Text>
              </View>
              <View style={[s.td, { width: COL.weight, textAlign: "center" }]}>
                <Text>
                  {String(
                    item.customFields?.["netWeight"] ?? "",
                  )}
                </Text>
              </View>
              <View style={[s.td, { width: COL.invoice, textAlign: "center", borderRightWidth: 0 }]}>
                <Text>{String(item.customFields?.["invoiceVat"] ?? "")}</Text>
              </View>
            </View>
          ))}

          {/* Total row — merge STT+Contract+Item+Lot into single "Tổng Cộng" cell */}
          <View style={s.totalRow}>
            <View
              style={[
                s.td,
                {
                  width: "54%",
                  borderBottomWidth: 0,
                  borderRightWidth: B,
                  borderRightColor: BC,
                },
              ]}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Tổng Cộng (Total)
              </Text>
            </View>
            <View
              style={[
                s.td,
                { width: COL.box, textAlign: "center", borderBottomWidth: 0 },
              ]}
            >
              <Text style={{ fontWeight: "bold" }}>
                {totalBox > 0 ? (Number.isInteger(totalBox) ? String(totalBox) : totalBox.toFixed(2)) : ""}
              </Text>
            </View>
            <View
              style={[
                s.td,
                { width: COL.weight, textAlign: "center", borderBottomWidth: 0 },
              ]}
            >
              <Text style={{ fontWeight: "bold" }}>
                {totalWeight > 0 ? `${Number.isInteger(totalWeight) ? String(totalWeight) : totalWeight.toFixed(2)} kg` : ""}
              </Text>
            </View>
            <View
              style={[
                s.td,
                {
                  width: COL.invoice,
                  borderRightWidth: 0,
                  borderBottomWidth: 0,
                },
              ]}
            >
              <Text />
            </View>
          </View>
        </View>

        {/* ═══ NOTES ═══ */}
        {data.notes && (
          <View style={s.notes}>
            {data.notes.split("\n").map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>
        )}

        {/* ═══ SIGNATURES — 3 rows: VN titles, EN titles, empty space ═══ */}
        {(() => {
          const sigs = [
            { vn: "Người mua", en: "Buyer" },
            { vn: "Người nhận", en: "Receiver" },
            { vn: "Thủ kho", en: "W/H Keeper" },
            { vn: "Kế toán", en: "Chief Accountant" },
            { vn: "Người lập phiếu", en: "Receipt by" },
          ];
          const last = sigs.length - 1;
          return (
            <View style={s.sigWrap}>
              {/* Row 1: VN + EN titles in same row */}
              <View style={s.sigTitleRow}>
                {sigs.map(({ vn, en }, i) => (
                  <View
                    key={i}
                    style={[
                      s.sigTitleCell,
                      i === last ? { borderRightWidth: 0 } : {},
                    ]}
                  >
                    <Text style={s.sigTitleVn}>{vn}</Text>
                    <Text style={s.sigTitleEn}>{en}</Text>
                  </View>
                ))}
              </View>
              {/* Row 3: Empty signing space */}
              <View style={s.sigSpaceRow}>
                {sigs.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      s.sigSpaceCell,
                      i === last ? { borderRightWidth: 0 } : {},
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })()}
      </Page>
    </Document>
  );
}
