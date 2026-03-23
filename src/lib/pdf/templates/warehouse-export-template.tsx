import { Document, Page, Text, View } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import type { PdfTemplateProps } from "../template-props";

/**
 * Phiếu Xuất Kho — Warehouse Export Note
 * Simple bordered table layout with quantity total in kgs
 */

const B = 1;
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  companyName: { fontSize: 13, fontWeight: "bold", marginBottom: 2 },
  companyDetail: { fontSize: 9, marginBottom: 1 },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 18, fontWeight: "bold" },
  dateText: { fontSize: 9, marginTop: 4 },

  /* Customer info */
  infoBlock: { marginBottom: 16 },
  infoRow: { flexDirection: "row", marginBottom: 3 },
  infoLabel: { fontSize: 10 },
  infoValue: { fontSize: 10, fontWeight: "bold" },

  /* Table */
  table: { borderWidth: B, borderColor: BC, marginBottom: 4 },
  thRow: {
    flexDirection: "row",
    borderBottomWidth: B,
    borderBottomColor: BC,
    minHeight: 28,
  },
  th: {
    padding: 4,
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: B,
    borderRightColor: BC,
  },
  tdRow: {
    flexDirection: "row",
    borderBottomWidth: B,
    borderBottomColor: BC,
    minHeight: 24,
  },
  td: {
    padding: 5,
    fontSize: 9,
    borderRightWidth: B,
    borderRightColor: BC,
    justifyContent: "center",
  },
  totalRow: { flexDirection: "row", minHeight: 24 },

  /* Warning */
  warning: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },

  /* Signatures */
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  sigBlock: { alignItems: "center", gap: 4 },
  sigTitle: { fontSize: 10, fontWeight: "bold" },
  sigHint: { fontSize: 8, color: "#64748b" },
});

/* Column widths */
const COL = {
  stt: "8%",
  productName: "28%",
  unit: "10%",
  specification: "16%",
  quantity: "20%",
  note: "18%",
};

export function WarehouseExportTemplate({
  date,
  company,
  data,
}: PdfTemplateProps) {
  const items = data.items ?? [];

  /* Parse date for Vietnamese format */
  const dp = date.split("/");
  const day = dp[0] ?? "";
  const month = dp[1] ?? "";
  const year = dp[2] ?? "";

  /* Calculate total quantity */
  let totalQty = 0;
  for (const item of items) {
    totalQty += Number(item.quantity ?? 0);
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ═══ HEADER ═══ */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>{company.name}</Text>
            {company.address && <Text style={s.companyDetail}>{company.address}</Text>}
          </View>
          <View style={s.titleBlock}>
            <Text style={s.title}>PHIẾU XUẤT KHO</Text>
            <Text style={s.dateText}>
              Ngày {day} tháng {month} năm {year}
            </Text>
            {(data.templateFields?.vehicleId || company.vehicleId) && (
              <Text style={s.dateText}>Số xe: {data.templateFields?.vehicleId ?? company.vehicleId}</Text>
            )}
          </View>
        </View>

        {/* ═══ CUSTOMER INFO ═══ */}
        <View style={s.infoBlock}>
          {data.customerName && (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Tên khách hàng: </Text>
              <Text style={s.infoValue}>{data.customerName}</Text>
            </View>
          )}
          {data.customerAddress && (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Nơi giao hàng:</Text>
              <Text style={s.infoValue}>{data.customerAddress}</Text>
            </View>
          )}
          {data.receiverName && (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Người nhận: </Text>
              <Text style={s.infoValue}>
                {data.receiverName}
                {data.receiverPhone ? ` : ${data.receiverPhone}` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* ═══ TABLE ═══ */}
        <View style={s.table}>
          {/* Header */}
          <View style={s.thRow}>
            <View style={[s.th, { width: COL.stt }]}><Text>STT</Text></View>
            <View style={[s.th, { width: COL.productName }]}><Text>Tên Hàng</Text></View>
            <View style={[s.th, { width: COL.unit }]}><Text>ĐVT</Text></View>
            <View style={[s.th, { width: COL.specification }]}><Text>Quy cách</Text></View>
            <View style={[s.th, { width: COL.quantity }]}><Text>Tổng cộng (kg)</Text></View>
            <View style={[s.th, { width: COL.note, borderRightWidth: 0 }]}><Text>Ghi Chú</Text></View>
          </View>

          {/* Data rows */}
          {items.map((item, i) => (
            <View key={i} style={s.tdRow}>
              <View style={[s.td, { width: COL.stt, textAlign: "center" }]}>
                <Text>{i + 1}</Text>
              </View>
              <View style={[s.td, { width: COL.productName }]}>
                <Text>{item.productName}</Text>
              </View>
              <View style={[s.td, { width: COL.unit, textAlign: "center" }]}>
                <Text>{item.unit ?? ""}</Text>
              </View>
              <View style={[s.td, { width: COL.specification }]}>
                <Text>{item.specification ?? ""}</Text>
              </View>
              <View style={[s.td, { width: COL.quantity, textAlign: "right" }]}>
                <Text>
                  {item.quantity != null
                    ? (Number.isInteger(item.quantity) ? String(item.quantity) : item.quantity.toFixed(2))
                    : ""}
                </Text>
              </View>
              <View style={[s.td, { width: COL.note, borderRightWidth: 0 }]}>
                <Text>{item.note ?? ""}</Text>
              </View>
            </View>
          ))}

          {/* Total row */}
          <View style={s.totalRow}>
            <View style={[s.td, { width: "62%", borderBottomWidth: 0 }]}>
              <Text style={{ fontWeight: "bold", textAlign: "right" }}>Tổng:</Text>
            </View>
            <View style={[s.td, { width: "20%", textAlign: "right", borderBottomWidth: 0 }]}>
              <Text style={{ fontWeight: "bold" }}>
                {totalQty > 0
                  ? (Number.isInteger(totalQty) ? String(totalQty) : totalQty.toFixed(2))
                  : ""}
              </Text>
            </View>
            <View style={[s.td, { width: "18%", borderRightWidth: 0, borderBottomWidth: 0 }]}>
              <Text />
            </View>
          </View>
        </View>

        {/* ═══ WARNING ═══ */}
        <Text style={s.warning}>
          ĐỀ NGHỊ KIỂM TRA ĐỐI CHIẾU TÊN HÀNG, SỐ LƯỢNG TRƯỚC KHI NHẬN HÀNG.
        </Text>

        {/* ═══ SIGNATURES ═══ */}
        <View style={s.sigRow}>
          {["Thủ kho", "Tài xế", "Người nhận hàng"].map((label, i) => (
            <View key={i} style={s.sigBlock}>
              <Text style={s.sigTitle}>{label}</Text>
              <Text style={s.sigHint}>(Ký, ghi rõ họ tên)</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
