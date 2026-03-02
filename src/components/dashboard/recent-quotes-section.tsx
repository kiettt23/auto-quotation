import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuoteStatusBadge } from "@/components/quote/quote-status-badge";
import { formatCurrency } from "@/lib/format-currency";

export type RecentQuote = {
  id: string;
  quoteNumber: string;
  customerName: string | null;
  customerCompany: string | null;
  total: number;
  createdAt: Date;
  status: string;
};

type Props = {
  quotes: RecentQuote[];
};

export function RecentQuotesSection({ quotes }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Báo giá gần đây</h2>
        <Button size="sm" asChild>
          <Link href="/bao-gia/tao-moi">
            <Plus className="mr-2 size-4" />
            Tạo báo giá
          </Link>
        </Button>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Chưa có báo giá nào.</p>
          <Button className="mt-4" asChild>
            <Link href="/bao-gia/tao-moi">Tạo báo giá đầu tiên</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã BG</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">
                    {q.quoteNumber}
                  </TableCell>
                  <TableCell>
                    {q.customerName || q.customerCompany || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(q.total)} ₫
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div>{q.createdAt.toLocaleDateString("vi-VN")}</div>
                    <div className="text-xs text-muted-foreground">{q.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={q.status} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/bao-gia/${q.id}`}>Xem</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
