import Image from "next/image";
import type { Quote, QuoteItem } from "@/db/schema";

/** Only the tenant fields needed for the public share view */
type ShareTenant = {
  companyName: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  phone: string;
};

type Props = {
  quote: Quote & { items: QuoteItem[] };
  tenant: ShareTenant;
};

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN");
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  SENT: "Đã gửi",
  ACCEPTED: "Đã chấp nhận",
  REJECTED: "Từ chối",
  EXPIRED: "Hết hạn",
};

export function ShareQuoteView({ quote, tenant }: Props) {
  const brandColor = tenant.primaryColor || "#0369A1";

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white shadow-sm">
        {/* Header with branding */}
        <div className="rounded-t-xl px-8 py-6" style={{ backgroundColor: brandColor }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {tenant.logoUrl ? (
                <Image
                  src={tenant.logoUrl}
                  alt={tenant.companyName || tenant.name}
                  width={48}
                  height={48}
                  className="rounded-lg object-contain bg-white p-1"
                />
              ) : null}
              <div>
                <h1 className="text-xl font-bold text-white">{tenant.companyName || tenant.name}</h1>
                {tenant.phone && <p className="text-sm text-white/80">{tenant.phone}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white/80">Báo giá</p>
              <p className="text-xl font-bold text-white">{quote.quoteNumber}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-8 py-6">
          {/* Meta info */}
          <div className="flex flex-wrap justify-between gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">Khách hàng</p>
              <p className="font-semibold">{quote.customerName || "—"}</p>
              {quote.customerCompany && <p className="text-gray-600">{quote.customerCompany}</p>}
              {quote.customerPhone && <p className="text-gray-600">{quote.customerPhone}</p>}
            </div>
            <div className="text-right">
              <p className="text-gray-500">Ngày tạo: {formatDate(quote.createdAt)}</p>
              {quote.validUntil && (
                <p className="text-gray-500">Hiệu lực đến: {formatDate(quote.validUntil)}</p>
              )}
              <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                {STATUS_LABELS[quote.status] ?? quote.status}
              </span>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Sản phẩm / dịch vụ</th>
                  <th className="px-4 py-3 text-right">SL</th>
                  <th className="px-4 py-3 text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="ml-auto w-64 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tạm tính</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {Number(quote.globalDiscountPercent) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Giảm giá ({quote.globalDiscountPercent}%)</span>
                <span>-{formatCurrency(quote.discountAmount)}</span>
              </div>
            )}
            {Number(quote.shippingFee) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span>{formatCurrency(quote.shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">VAT ({quote.vatPercent}%)</span>
              <span>{formatCurrency(quote.vatAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Tổng cộng</span>
              <span style={{ color: brandColor }}>{formatCurrency(quote.total)}</span>
            </div>
          </div>

          {/* Notes / Terms */}
          {quote.notes && (
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">Ghi chú</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
          {quote.terms && (
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">Điều khoản</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.terms}</p>
            </div>
          )}

          {/* Footer branding */}
          <div className="border-t pt-4 text-center text-xs text-gray-400">
            Báo giá được tạo bởi <span className="font-medium">Auto Quotation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
