import {
  Document,
  Page,
  Text,
  View,
  Font,
  StyleSheet,
  renderToBuffer,
  type Styles,
} from "@react-pdf/renderer";
import fs from "fs";
import path from "path";

// ─── Font registration ───────────────────────────────────────────────────────

function fontDataUrl(filename: string): string {
  const filePath = path.join(process.cwd(), "public", "fonts", filename);
  const buf = fs.readFileSync(filePath);
  return `data:font/truetype;base64,${buf.toString("base64")}`;
}

Font.register({
  family: "Roboto",
  fonts: [
    { src: fontDataUrl("Roboto-Regular.ttf"), fontWeight: "normal" },
    { src: fontDataUrl("Roboto-Bold.ttf"), fontWeight: "bold" },
  ],
});

// ─── Data types ──────────────────────────────────────────────────────────────

export type PghTableRow = {
  contractNo: string;
  itemName: string;
  lotNo: string;
  boxQty: string;
  netWeight: string;
  invoiceVat: string;
};

export type PghDeliveryOrderData = {
  companyName: string;
  companyAddress: string;
  companyTaxCode: string;
  docNumber: string;
  date: string;
  deliveryDate: string;
  buyerName: string;
  buyerAddress: string;
  deliveryTo: string;
  deliveryAddress: string;
  vehicleId: string;
  driverName: string;
  receiverName: string;
  receiverPhone: string;
  items: PghTableRow[];
};

// ─── Constants ───────────────────────────────────────────────────────────────

const B = "#000000";
const F = 8;
const F_SM = 7;
const F_TITLE = 16;
const PAD = 4;

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: F, padding: "50 50", color: "#000" },

  // Company header
  companyName: { fontSize: 10, fontWeight: "bold" },
  companyDetail: { fontSize: F, marginTop: 1 },

  // Title
  titleLine: {
    borderBottomWidth: 1,
    borderColor: B,
    marginTop: 12,
    marginBottom: 0,
  },
  titleBlock: { alignItems: "center", marginTop: 8, marginBottom: 8 },
  titleText: { fontSize: F_TITLE, fontWeight: "bold", textAlign: "center" },
  titleSub: { fontSize: F_TITLE - 2, fontWeight: "normal" },

  // Delivery date + doc number
  dateDocRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  docNumberBox: {
    borderWidth: 1,
    borderColor: B,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontWeight: "bold",
    fontSize: F,
  },

  // ── Info table (bordered key-value rows) ──
  infoTable: { borderWidth: 1, borderColor: B, marginBottom: 6 },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: B,
    alignItems: "stretch",
    minHeight: 18,
  },
  infoRowLast: { flexDirection: "row", alignItems: "stretch", minHeight: 18 },
  infoLabel: {
    width: 140,
    borderRightWidth: 1,
    borderColor: B,
    paddingVertical: 2,
    paddingHorizontal: PAD,
    justifyContent: "center" as const,
  },
  infoLabelItalic: { fontSize: F_SM, fontStyle: "italic" as const },
  infoValue: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: PAD,
    justifyContent: "center" as const,
  },

  // ── Quad cells (4-column rows for driver/vehicle) ──
  quadLabel: {
    width: 140,
    borderRightWidth: 1,
    borderColor: B,
    paddingVertical: 2,
    paddingHorizontal: PAD,
    justifyContent: "center" as const,
  },
  quadValue: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: B,
    paddingVertical: 2,
    paddingHorizontal: PAD,
    justifyContent: "center" as const,
  },
  quadValueLast: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: PAD,
    justifyContent: "center" as const,
  },

  // ── Items table ──
  table: { borderWidth: 1, borderColor: B, marginTop: 7 },
  tHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: B,
    minHeight: 32,
    alignItems: "stretch",
  },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: B,
    minHeight: 20,
    alignItems: "stretch",
  },
  tRowLast: { flexDirection: "row", minHeight: 20, alignItems: "stretch" },
  tFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: B,
    minHeight: 20,
    alignItems: "stretch",
  },

  // Cells
  cellStt: {
    width: 30,
    borderRightWidth: 1,
    borderColor: B,
    justifyContent: "center" as const,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  cellContract: {
    width: 65,
    borderRightWidth: 1,
    borderColor: B,
    justifyContent: "center" as const,
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  cellItem: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: B,
    justifyContent: "center" as const,
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  cellLot: {
    width: 70,
    borderRightWidth: 1,
    borderColor: B,
    justifyContent: "center" as const,
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  cellBox: {
    width: 55,
    borderRightWidth: 1,
    borderColor: B,
    justifyContent: "center" as const,
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  cellWeight: {
    width: 70,
    borderRightWidth: 1,
    borderColor: B,
    justifyContent: "center" as const,
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  cellInvoice: {
    width: 60,
    justifyContent: "center" as const,
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  cellTotalLabel: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: B,
    justifyContent: "center" as const,
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  ct: { textAlign: "center" as const, fontSize: F },
  cl: { fontSize: F, paddingLeft: 4 },
  cb: { textAlign: "center" as const, fontSize: F, fontWeight: "bold" },
  headerLabel: { fontWeight: "bold", fontSize: F, textAlign: "center" },
  headerLabelSub: {
    fontSize: F_SM,
    textAlign: "center",
    fontStyle: "italic" as const,
  },

  // ── Signature table ──
  sigTable: { borderWidth: 1, borderColor: B, marginTop: 20 },
  sigHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: B,
    alignItems: "stretch",
  },
  sigBodyRow: { flexDirection: "row", alignItems: "stretch", minHeight: 60 },
  sigCell: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: B,
    alignItems: "center",
    justifyContent: "flex-start" as const,
    paddingTop: 3,
  },
  sigCellLast: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start" as const,
    paddingTop: 3,
  },
  sigTitle: { fontWeight: "bold", fontSize: F },
  sigSub: { fontSize: F_SM, fontStyle: "italic" as const },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDateParts(dateStr: string): {
  day: string;
  month: string;
  year: string;
} {
  const d = new Date(
    dateStr.includes("/") ? dateStr.split("/").reverse().join("-") : dateStr,
  );
  if (isNaN(d.getTime())) return { day: "--", month: "--", year: "----" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    year: String(d.getFullYear()),
  };
}

function sumColumn(items: PghTableRow[], key: "boxQty" | "netWeight"): string {
  // Use integer arithmetic (×100) to avoid floating-point precision errors
  const totalCents = items.reduce((sum, row) => {
    const val = parseFloat(row[key]);
    if (isNaN(val)) return sum;
    return sum + Math.round(val * 100);
  }, 0);
  return (totalCents / 100).toFixed(2);
}

function TH({
  label,
  sub,
  style,
}: {
  label: string;
  sub: string;
  style: Styles[string];
}) {
  return (
    <View style={style}>
      <Text style={s.headerLabel}>{label}</Text>
      <Text style={s.headerLabelSub}>{sub}</Text>
    </View>
  );
}

// ─── Document component ──────────────────────────────────────────────────────

function PghDocument({ data }: { data: PghDeliveryOrderData }) {
  const dlv = parseDateParts(data.deliveryDate);

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* ── Company header ── */}
        <View>
          <Text style={s.companyName}>{data.companyName}</Text>
          <Text style={s.companyDetail}>{data.companyAddress}</Text>
          <Text style={s.companyDetail}>MST : {data.companyTaxCode}</Text>
        </View>

        {/* ── Line + Title ── */}
        <View style={s.titleLine} />
        <View style={s.titleBlock}>
          <Text style={s.titleText}>PHIẾU GIAO NHẬN</Text>
          <Text style={s.titleSub}>( GOODS DELIVERY ORDER )</Text>
        </View>

        {/* ── Delivery date + Doc number ── */}
        <View style={s.dateDocRow}>
          <Text>
            Ngày giao{" "}
            <Text style={{ fontStyle: "italic" }}>(Delivery date)</Text> : Ngày{" "}
            <Text style={{ fontStyle: "italic" }}>(Date)</Text> {dlv.day} Tháng{" "}
            <Text style={{ fontStyle: "italic" }}>(Month)</Text> {dlv.month} Năm{" "}
            <Text style={{ fontStyle: "italic" }}>(Year)</Text> {dlv.year}
          </Text>
          <View style={s.docNumberBox}>
            <Text>{data.docNumber}</Text>
          </View>
        </View>

        {/* ── Buyer + Delivery + Driver (single bordered table) ── */}
        <View style={s.infoTable}>
          {/* Row 1: Buyer */}
          <View style={s.infoRow}>
            <View style={s.infoLabel}>
              <Text style={{ fontWeight: "bold", fontSize: F }}>
                Khách hàng (Buyer)
              </Text>
            </View>
            <View style={s.infoValue}>
              <Text style={{ fontWeight: "bold" }}>{data.buyerName}</Text>
              <Text>Địa chỉ : {data.buyerAddress}</Text>
            </View>
          </View>

          {/* Row 2: Delivery destination */}
          <View style={s.infoRow}>
            <View style={s.infoLabel}>
              <Text style={{ fontSize: F_SM }}>
                Giao hàng đến địa điểm chỉ{"\n"}định của Jesang
              </Text>
              <Text style={s.infoLabelItalic}>
                (Delivery to address that{"\n"}Jesang requests)
              </Text>
            </View>
            <View style={s.infoValue}>
              <Text style={{ fontWeight: "bold" }}>{data.deliveryTo}</Text>
              <Text>Địa chỉ : {data.deliveryAddress}</Text>
            </View>
          </View>

          {/* Row 3: Driver + Receiver */}
          <View style={s.infoRow}>
            <View style={s.quadLabel}>
              <Text>Tên tài xế (Driver&apos;s name)</Text>
            </View>
            <View style={s.quadValue}>
              <Text>{data.driverName}</Text>
            </View>
            <View style={s.quadLabel}>
              <Text>Người nhận (Receiver)</Text>
            </View>
            <View style={s.quadValueLast}>
              <Text>{data.receiverName}</Text>
            </View>
          </View>

          {/* Row 4: Vehicle + Phone */}
          <View style={s.infoRowLast}>
            <View style={s.quadLabel}>
              <Text>Số xe (Vehicle Identification)</Text>
            </View>
            <View style={s.quadValue}>
              <Text>{data.vehicleId}</Text>
            </View>
            <View style={s.quadLabel}>
              <Text>Số điện thoại (Number phone)</Text>
            </View>
            <View style={s.quadValueLast}>
              <Text>{data.receiverPhone}</Text>
            </View>
          </View>
        </View>

        {/* ── Items table ── */}
        <View style={s.table}>
          <View style={s.tHead}>
            <TH label="STT" sub="No" style={s.cellStt} />
            <TH label="Hợp đồng" sub="Contract No" style={s.cellContract} />
            <TH label="Tên hàng" sub="Item" style={s.cellItem} />
            <TH label="Số Lô" sub="Lot No" style={s.cellLot} />
            <TH label={"Số thùng /\nkiện"} sub="Box Qty" style={s.cellBox} />
            <TH label="Cân nặng" sub="Net Weight (kg)" style={s.cellWeight} />
            <TH label="Hóa đơn" sub="Invoice VAT" style={s.cellInvoice} />
          </View>

          {data.items.map((item, idx) => {
            const isLast = idx === data.items.length - 1;
            return (
              <View key={idx} style={isLast ? s.tRowLast : s.tRow}>
                <View style={s.cellStt}>
                  <Text style={s.ct}>{idx + 1}</Text>
                </View>
                <View style={s.cellContract}>
                  <Text style={s.ct}>{item.contractNo}</Text>
                </View>
                <View style={s.cellItem}>
                  <Text style={s.cl}>{item.itemName}</Text>
                </View>
                <View style={s.cellLot}>
                  <Text style={s.ct}>{item.lotNo}</Text>
                </View>
                <View style={s.cellBox}>
                  <Text style={s.ct}>{item.boxQty}</Text>
                </View>
                <View style={s.cellWeight}>
                  <Text style={s.ct}>{item.netWeight}</Text>
                </View>
                <View style={s.cellInvoice}>
                  <Text style={s.ct}>{item.invoiceVat}</Text>
                </View>
              </View>
            );
          })}

          <View style={s.tFooter}>
            <View style={s.cellTotalLabel}>
              <Text style={s.cb}>Tổng Cộng (Total)</Text>
            </View>
            <View style={s.cellBox}>
              <Text style={s.cb}>{sumColumn(data.items, "boxQty")}</Text>
            </View>
            <View style={s.cellWeight}>
              <Text style={s.cb}>{sumColumn(data.items, "netWeight")} kg</Text>
            </View>
            <View style={s.cellInvoice}>
              <Text style={s.ct}></Text>
            </View>
          </View>
        </View>

        {/* ── Signature table ── */}
        <View style={s.sigTable}>
          {/* Row 1: Vietnamese titles */}
          <View style={s.sigHeaderRow}>
            {[
              "Người mua",
              "Người nhận",
              "Thủ kho",
              "Kế toán",
              "Người lập phiếu",
            ].map((title, idx) => (
              <View key={idx} style={idx < 4 ? s.sigCell : s.sigCellLast}>
                <Text style={s.sigTitle}>{title}</Text>
              </View>
            ))}
          </View>
          {/* Row 2: English subtitles */}
          <View style={s.sigHeaderRow}>
            {[
              "Buyer",
              "Receiver",
              "W/H Keeper",
              "Chief Accountant",
              "Receipt by",
            ].map((sub, idx) => (
              <View key={idx} style={idx < 4 ? s.sigCell : s.sigCellLast}>
                <Text style={s.sigSub}>{sub}</Text>
              </View>
            ))}
          </View>
          {/* Empty body row for signatures */}
          <View style={s.sigBodyRow}>
            {[0, 1, 2, 3, 4].map((idx) => (
              <View key={idx} style={idx < 4 ? s.sigCell : s.sigCellLast} />
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─── Export function ─────────────────────────────────────────────────────────

export async function generatePghDeliveryOrder(
  data: PghDeliveryOrderData,
): Promise<Buffer> {
  const buffer = await renderToBuffer(<PghDocument data={data} />);
  return Buffer.from(buffer);
}
