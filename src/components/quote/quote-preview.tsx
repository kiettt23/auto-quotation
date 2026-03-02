"use client";

import { formatCurrency } from "@/lib/format-currency";
import { numberToVietnameseWords } from "@/lib/format-number-to-words";
import { calculateLineTotal, calculateQuoteTotals } from "@/lib/pricing-engine";

export type QuotePreviewData = {
  quoteNumber?: string;
  createdAt?: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: {
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
  }[];
  globalDiscountPercent: number;
  vatPercent: number;
  shippingFee: number;
  otherFees: number;
  otherFeesLabel: string;
  terms: string;
  validUntil: string;
};

export type CompanyInfo = {
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

type Props = {
  data: QuotePreviewData;
  company?: CompanyInfo | null;
};

export function QuotePreview({ data, company }: Props) {
  const items = data.items.filter((i) => i.name);
  const lineTotals = items.map((i) => calculateLineTotal(i.unitPrice, i.quantity, i.discountPercent));
  const totals = calculateQuoteTotals(
    items.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity, discountPercent: i.discountPercent })),
    data.globalDiscountPercent,
    data.vatPercent,
    data.shippingFee,
    data.otherFees
  );

  const primaryColor = company?.primaryColor || "#0369A1";
  const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN");

  return (
    <div className="bg-white text-black p-6 text-sm space-y-4 rounded border" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {company?.logoUrl && <img src={company.logoUrl} alt="" className="h-12 w-12 object-contain" />}
          <div>
            <p className="font-bold text-base" style={{ color: primaryColor }}>{company?.companyName || "Công ty"}</p>
            <p className="text-xs text-gray-600">{company?.address}</p>
            <p className="text-xs text-gray-600">{company?.phone} | {company?.email}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center py-2">
        <h2 className="text-xl font-bold" style={{ color: primaryColor }}>BẢNG BÁO GIÁ</h2>
        {data.quoteNumber && <p className="text-xs text-gray-500">Số: {data.quoteNumber} — Ngày: {date}</p>}
      </div>

      {/* Customer info */}
      {data.customerName && (
        <div className="border rounded p-3 text-xs space-y-0.5">
          <p><strong>Khách hàng:</strong> {data.customerName}</p>
          {data.customerCompany && <p><strong>Công ty:</strong> {data.customerCompany}</p>}
          {data.customerPhone && <p><strong>ĐT:</strong> {data.customerPhone}</p>}
          {data.customerEmail && <p><strong>Email:</strong> {data.customerEmail}</p>}
          {data.customerAddress && <p><strong>Địa chỉ:</strong> {data.customerAddress}</p>}
        </div>
      )}

      {/* Items table */}
      {items.length > 0 && (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: primaryColor, color: "white" }}>
              <th className="border p-1.5 text-center w-8">STT</th>
              <th className="border p-1.5 text-left">Sản phẩm</th>
              <th className="border p-1.5 text-center w-12">ĐVT</th>
              <th className="border p-1.5 text-right w-12">SL</th>
              <th className="border p-1.5 text-right w-20">Đơn giá</th>
              {items.some((i) => i.discountPercent > 0) && <th className="border p-1.5 text-right w-12">CK%</th>}
              <th className="border p-1.5 text-right w-24">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                <td className="border p-1.5 text-center">{i + 1}</td>
                <td className="border p-1.5">{item.name}</td>
                <td className="border p-1.5 text-center">{item.unit}</td>
                <td className="border p-1.5 text-right">{item.quantity}</td>
                <td className="border p-1.5 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                {items.some((it) => it.discountPercent > 0) && (
                  <td className="border p-1.5 text-right">{item.discountPercent > 0 ? `${item.discountPercent}%` : ""}</td>
                )}
                <td className="border p-1.5 text-right tabular-nums font-medium">{formatCurrency(lineTotals[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-64 text-xs space-y-1">
          <Row label="Tạm tính" value={totals.subtotal} />
          {data.globalDiscountPercent > 0 && <Row label={`Chiết khấu ${data.globalDiscountPercent}%`} value={-totals.discountAmount} />}
          {data.shippingFee > 0 && <Row label="Phí vận chuyển" value={data.shippingFee} />}
          {data.otherFees > 0 && <Row label={data.otherFeesLabel || "Phí khác"} value={data.otherFees} />}
          {data.vatPercent > 0 && <Row label={`VAT ${data.vatPercent}%`} value={totals.vatAmount} />}
          <div className="flex justify-between font-bold text-sm border-t pt-1" style={{ color: primaryColor }}>
            <span>TỔNG CỘNG</span>
            <span className="tabular-nums">{formatCurrency(totals.total)} VNĐ</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      {company?.showAmountInWords !== false && totals.total > 0 && (
        <p className="text-xs italic">Bằng chữ: {numberToVietnameseWords(totals.total)}</p>
      )}

      {/* Terms */}
      {data.terms && (
        <div className="text-xs">
          <p className="font-bold mb-1">Điều khoản:</p>
          <p className="whitespace-pre-line text-gray-700">{data.terms}</p>
        </div>
      )}

      {data.validUntil && (
        <p className="text-xs text-gray-500">Hiệu lực đến: {new Date(data.validUntil).toLocaleDateString("vi-VN")}</p>
      )}

      {/* Signature blocks */}
      {company?.showSignatureBlocks !== false && (
        <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
          <div>
            <p className="font-bold">BÊN MUA</p>
            <p className="text-gray-500 mt-8">(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-bold">BÊN BÁN</p>
            <p className="text-gray-500 mt-8">(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      )}

      {/* Bank info */}
      {company?.showBankInfo && company.bankName && (
        <div className="text-xs border-t pt-2 text-gray-600">
          <p className="font-medium">Thông tin chuyển khoản:</p>
          <p>Ngân hàng: {company.bankName} | STK: {company.bankAccount} | CTK: {company.bankOwner}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}
