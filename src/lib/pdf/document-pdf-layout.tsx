import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import type { DocumentData } from "@/lib/types/document-data";

interface Props {
  title: string;
  documentNumber: string;
  date: string;
  company: {
    name: string;
    address?: string | null;
    phone?: string | null;
  };
  data: DocumentData;
}

function fmt(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

export function DocumentPdfLayout({
  title,
  documentNumber,
  date,
  company,
  data,
}: Props) {
  const items = data.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>{company.name}</Text>
            {company.address && (
              <Text style={s.companyDetail}>{company.address}</Text>
            )}
            {company.phone && (
              <Text style={s.companyDetail}>SĐT: {company.phone}</Text>
            )}
          </View>
          <View>
            <Text style={s.docTitle}>{title}</Text>
            <Text style={s.docNumber}>Số: {documentNumber}</Text>
            <Text style={s.docNumber}>Ngày: {date}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Customer */}
        {data.customerName && (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.sectionLabel}>
              Kính gửi: {data.customerName}
            </Text>
            {data.customerAddress && (
              <Text style={s.sectionText}>
                Địa chỉ: {data.customerAddress}
              </Text>
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
          <Text style={[s.tableHeaderText, s.colStt]}>STT</Text>
          <Text style={[s.tableHeaderText, s.colProduct]}>Sản phẩm</Text>
          <Text style={[s.tableHeaderText, s.colUnit]}>ĐVT</Text>
          <Text style={[s.tableHeaderText, s.colQty]}>SL</Text>
          <Text style={[s.tableHeaderText, s.colPrice]}>Đơn giá</Text>
          <Text style={[s.tableHeaderText, s.colAmount]}>Thành tiền</Text>
        </View>

        {/* Table rows */}
        {items.map((item, i) => (
          <View
            key={i}
            style={i % 2 === 1 ? s.tableRowAlt : s.tableRow}
          >
            <Text style={[s.tableCell, s.colStt]}>{i + 1}</Text>
            <Text style={[s.tableCell, s.colProduct]}>
              {item.productName}
            </Text>
            <Text style={[s.tableCell, s.colUnit]}>{item.unit}</Text>
            <Text style={[s.tableCell, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.tableCell, s.colPrice]}>
              {fmt(item.unitPrice)}
            </Text>
            <Text style={[s.tableCellBold, s.colAmount]}>
              {fmt(item.quantity * item.unitPrice)}
            </Text>
          </View>
        ))}

        {/* Total */}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Tổng cộng:</Text>
          <Text style={s.totalValue}>{fmt(total)}</Text>
        </View>

        {/* Notes */}
        {data.notes && (
          <Text style={s.notes}>Ghi chú: {data.notes}</Text>
        )}

        {/* Signatures */}
        <View style={s.signatureRow}>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>Bên mua</Text>
            <Text style={s.signatureHint}>(Ký, ghi rõ họ tên)</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={s.signatureTitle}>Bên bán</Text>
            <Text style={s.signatureHint}>(Ký, đóng dấu)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
