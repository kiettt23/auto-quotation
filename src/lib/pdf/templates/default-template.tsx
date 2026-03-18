import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { pdfStyles as s } from "../pdf-styles";
import { fmtCurrency, type PdfTemplateProps } from "../template-props";
import { getCellValue } from "../pdf-helpers";

/** Default PDF template — clean modern layout with dynamic columns */
export function DefaultTemplate({
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
  const total = hasAmount
    ? items.reduce((sum, item) => sum + (item.amount ?? (item.quantity ?? 0) * (item.unitPrice ?? 0)), 0)
    : 0;

  const layout = company.headerLayout ?? "left";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        {layout === "center" ? (
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            {company.logoUrl && (
              <Image src={company.logoUrl} style={{ width: 50, height: 50, objectFit: "contain", marginBottom: 4 }} />
            )}
            <Text style={s.companyName}>{company.name}</Text>
            {company.address && <Text style={s.companyDetail}>{company.address}</Text>}
            {company.phone && <Text style={s.companyDetail}>SĐT: {company.phone}</Text>}
            <Text style={[s.docTitle, { marginTop: 12 }]}>{title}</Text>
            <Text style={s.docNumber}>Số: {documentNumber}</Text>
            <Text style={s.docNumber}>Ngày: {date}</Text>
          </View>
        ) : (
          <View style={s.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {company.logoUrl && (
                <Image src={company.logoUrl} style={{ width: 50, height: 50, objectFit: "contain" }} />
              )}
              <View>
                <Text style={s.companyName}>{company.name}</Text>
                {company.address && <Text style={s.companyDetail}>{company.address}</Text>}
                {company.phone && <Text style={s.companyDetail}>SĐT: {company.phone}</Text>}
              </View>
            </View>
            <View>
              <Text style={s.docTitle}>{title}</Text>
              <Text style={s.docNumber}>Số: {documentNumber}</Text>
              <Text style={s.docNumber}>Ngày: {date}</Text>
            </View>
          </View>
        )}

        <View style={s.divider} />

        {/* Customer */}
        {data.customerName && (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.sectionLabel}>Kính gửi: {data.customerName}</Text>
            {data.customerAddress && (
              <Text style={s.sectionText}>Địa chỉ: {data.customerAddress}</Text>
            )}
            {data.receiverName && (
              <Text style={s.sectionText}>
                Người nhận: {data.receiverName}
                {data.receiverPhone ? ` — ${data.receiverPhone}` : ""}
              </Text>
            )}
          </View>
        )}

        {/* Table header */}
        <View style={s.tableHeader}>
          {columns.map((col) => (
            <Text
              key={col.key}
              style={[
                s.tableHeaderText,
                { width: col.width, textAlign: (col.align ?? "left") as "left" | "right" | "center", paddingRight: 4 },
              ]}
            >
              {col.label}
            </Text>
          ))}
        </View>

        {/* Table rows */}
        {items.map((item, i) => (
          <View key={i} style={i % 2 === 1 ? s.tableRowAlt : s.tableRow}>
            {columns.map((col) => (
              <Text
                key={col.key}
                style={[
                  col.key === "amount" ? s.tableCellBold : s.tableCell,
                  { width: col.width, textAlign: (col.align ?? "left") as "left" | "right" | "center", paddingRight: 4 },
                ]}
              >
                {getCellValue(item, col, i)}
              </Text>
            ))}
          </View>
        ))}

        {/* Total */}
        {showTotal && hasAmount && (
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Tổng cộng:</Text>
            <Text style={s.totalValue}>{fmtCurrency(total)}</Text>
          </View>
        )}

        {/* Notes */}
        {data.notes && (
          <View style={s.notes}>
            <Text style={{ fontWeight: 700, marginBottom: 2 }}>Ghi chú:</Text>
            {data.notes.split("\n").map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>
        )}

        {/* Signatures */}
        <View style={s.signatureRow}>
          {signatureLabels.map((label, i) => (
            <View key={i} style={s.signatureBlock}>
              <Text style={s.signatureTitle}>{label}</Text>
              <Text style={s.signatureHint}>(Ký, ghi rõ họ tên)</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
