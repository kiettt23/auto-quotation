/**
 * PDF layout for Phiếu Xuất Kho (Warehouse Export Note).
 * Matches the original company document format closely.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { registerFonts, FONT_FAMILY } from "@/lib/pdf/font-registration";

registerFonts();

// ─── Data types ──────────────────────────────────────────────────────────────

export type PxkTableRow = {
  itemName: string;
  unit: string;
  specification: string;
  totalWeight: string;
  note: string;
};

export type PxkWarehouseExportData = {
  companyName: string;
  companyAddress: string;
  docNumber: string;
  date: string;
  vehicleId: string;
  customerName: string;
  deliveryAddress: string;
  receiverName: string;
  receiverPhone: string;
  items: PxkTableRow[];
};

// ─── Constants ───────────────────────────────────────────────────────────────

const B = "#000";
const BORDER = 1;

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    padding: "50 60",
    color: B,
  },

  // ── Header: company left, title right ──
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  headerLeft: { maxWidth: "55%" },
  companyName: { fontSize: 13, fontWeight: "bold" },
  companyAddress: { fontSize: 10, marginTop: 2 },
  headerRight: { alignItems: "flex-start" },
  title: { fontSize: 16, fontWeight: "bold" },
  subTitle: { fontSize: 11, marginTop: 3 },

  // ── Info section ──
  infoSection: { marginBottom: 16 },
  infoLine: { fontSize: 11, marginBottom: 4, lineHeight: 1.4 },
  infoBold: { fontWeight: "bold" },

  // ── Table ──
  table: { borderWidth: BORDER, borderColor: B },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: BORDER,
    borderColor: B,
    minHeight: 24,
  },
  tRowNoBorder: {
    flexDirection: "row",
    minHeight: 24,
  },
  // Header row style (no background, just bold)
  thText: {
    fontWeight: "bold",
    fontSize: 11,
    padding: "5 4",
    textAlign: "center",
  },
  tdText: { fontSize: 10, padding: "4 5" },
  tdTextCenter: { fontSize: 10, padding: "4 5", textAlign: "center" },
  tdTextRight: { fontSize: 10, padding: "4 5", textAlign: "right" },

  // Column widths matching original proportions
  // STT | Tên Hàng | Dvt | quy cách | Tổng Cộng(kgs) | Ghi Chú
  cStt: { width: "7%", borderRightWidth: BORDER, borderColor: B },
  cItem: { width: "27%", borderRightWidth: BORDER, borderColor: B },
  cUnit: { width: "8%", borderRightWidth: BORDER, borderColor: B },
  cSpec: { width: "22%", borderRightWidth: BORDER, borderColor: B },
  cWeight: { width: "20%", borderRightWidth: BORDER, borderColor: B },
  cNote: { width: "16%" },

  // ── Total row ──
  totalRow: {
    flexDirection: "row",
    borderTopWidth: BORDER,
    borderColor: B,
    minHeight: 24,
  },
  // "Tổng:" spans STT+Item+Unit+Spec (64%) as one merged cell
  totalLabelMerged: {
    width: "64%",
    borderRightWidth: BORDER,
    borderColor: B,
    padding: "4 5",
    alignItems: "flex-end",
  },
  totalLabelText: {
    fontWeight: "bold",
    fontSize: 11,
  },
  totalValueCell: {
    width: "20%",
    borderRightWidth: BORDER,
    borderColor: B,
    padding: "4 5",
  },
  totalValueText: {
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "right",
  },
  totalNoteCell: { width: "16%" },

  // ── Warning ──
  warning: {
    fontSize: 10,
    fontWeight: "bold",
    fontStyle: "italic",
    marginTop: 10,
    marginBottom: 40,
  },

  // ── Signatures ──
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  signatureBlock: { alignItems: "center", width: 130 },
  signatureTitle: { fontWeight: "bold", fontSize: 11 },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `Ngày ${day} tháng ${month} năm ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

// ─── Document component ──────────────────────────────────────────────────────

function PxkDocument({ data }: { data: PxkWarehouseExportData }) {
  const displayItems = data.items.filter((r) => r.itemName);

  const totalWeight = displayItems.reduce((sum, row) => {
    const w = parseFloat(row.totalWeight);
    return sum + (isNaN(w) ? 0 : w);
  }, 0);

  const receiver = [data.receiverName, data.receiverPhone].filter(Boolean).join(" : ");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.companyName}>{data.companyName}</Text>
            <Text style={s.companyAddress}>{data.companyAddress}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.title}>PHIẾU XUẤT KHO</Text>
            <Text style={s.subTitle}>{formatDate(data.date)}</Text>
            {data.vehicleId ? (
              <Text style={s.subTitle}>Số xe: {data.vehicleId}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Customer info ── */}
        <View style={s.infoSection}>
          <Text style={s.infoLine}>
            Tên khách hàng: <Text style={s.infoBold}>{data.customerName}</Text>
          </Text>
          {data.deliveryAddress ? (
            <Text style={s.infoLine}>
              Nơi giao hàng:<Text style={s.infoBold}>{data.deliveryAddress}</Text>
            </Text>
          ) : null}
          {receiver ? (
            <Text style={s.infoLine}>
              Người nhận: <Text style={s.infoBold}>{receiver}</Text>
            </Text>
          ) : null}
        </View>

        {/* ── Table ── */}
        <View style={s.table}>
          {/* Header row */}
          <View style={s.tRow}>
            <View style={s.cStt}><Text style={s.thText}>STT</Text></View>
            <View style={s.cItem}><Text style={s.thText}>Tên Hàng</Text></View>
            <View style={s.cUnit}><Text style={s.thText}>Dvt</Text></View>
            <View style={s.cSpec}><Text style={s.thText}>quy cách</Text></View>
            <View style={s.cWeight}><Text style={s.thText}>Tổng Cộng( kgs)</Text></View>
            <View style={s.cNote}><Text style={s.thText}>Ghi Chú</Text></View>
          </View>

          {/* Data rows */}
          {displayItems.map((row, i) => {
            const isLast = i === displayItems.length - 1;
            return (
              <View key={i} style={isLast ? s.tRowNoBorder : s.tRow}>
                <View style={s.cStt}>
                  <Text style={s.tdTextCenter}>{row.itemName ? i + 1 : ""}</Text>
                </View>
                <View style={s.cItem}><Text style={s.tdText}>{row.itemName}</Text></View>
                <View style={s.cUnit}><Text style={s.tdTextCenter}>{row.unit}</Text></View>
                <View style={s.cSpec}><Text style={s.tdText}>{row.specification}</Text></View>
                <View style={s.cWeight}>
                  <Text style={s.tdTextRight}>
                    {row.totalWeight && parseFloat(row.totalWeight) ? parseFloat(row.totalWeight).toFixed(2) : ""}
                  </Text>
                </View>
                <View style={s.cNote}><Text style={s.tdText}>{row.note}</Text></View>
              </View>
            );
          })}

          {/* Total row — "Tổng:" merged across first 4 columns */}
          <View style={s.totalRow}>
            <View style={s.totalLabelMerged}>
              <Text style={s.totalLabelText}>Tổng:</Text>
            </View>
            <View style={s.totalValueCell}>
              <Text style={s.totalValueText}>
                {totalWeight > 0 ? totalWeight.toFixed(2) : ""}
              </Text>
            </View>
            <View style={s.totalNoteCell} />
          </View>
        </View>

        {/* ── Warning ── */}
        <Text style={s.warning}>
          ĐỀ NGHỊ KIỂM TRA ĐỐI CHIẾU TÊN HÀNG, SỐ LƯỢNG TRƯỚC KHI NHẬN HÀNG.
        </Text>

        {/* ── Signatures ── */}
        <View style={s.signatureRow}>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>Thủ kho</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>Tài xế</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>Người nhận hàng</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function generatePxkWarehouseExport(data: PxkWarehouseExportData): Promise<Buffer> {
  return renderToBuffer(<PxkDocument data={data} />) as unknown as Promise<Buffer>;
}
