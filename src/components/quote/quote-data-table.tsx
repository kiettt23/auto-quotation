"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  FileSpreadsheet,
  Share2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/format-currency";
import { QuoteStatusBadge } from "./quote-status-badge";
import {
  deleteQuote,
  cloneQuote,
  generateShareLink,
} from "@/app/(dashboard)/bao-gia/actions";
import type { QuoteListItem } from "./quote-list-page-client";

type Props = {
  quotes: QuoteListItem[];
  total: number;
  page: number;
  totalPages: number;
  currentSort: string;
  currentOrder: string;
};

export function QuoteDataTable({
  quotes,
  total,
  page,
  totalPages,
  currentSort,
  currentOrder,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function toggleSort(field: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSort === field && currentOrder === "asc") params.set("order", "desc");
    else params.set("order", "asc");
    params.set("sort", field);
    router.push(`/bao-gia?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    router.push(`/bao-gia?${params.toString()}`);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteQuote(id);
      toast.success("Đã xóa báo giá");
    });
  }

  function handleClone(id: string) {
    startTransition(async () => {
      const result = await cloneQuote(id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Đã nhân bản báo giá");
        if (result.id) router.push(`/bao-gia/${result.id}`);
      }
    });
  }

  async function handleShare(id: string) {
    const result = await generateShareLink(id);
    const url = `${window.location.origin}/chia-se/${result.token}`;
    await navigator.clipboard.writeText(url);
    toast.success("Đã sao chép link chia sẻ");
  }

  function SortBtn({ field, children }: { field: string; children: React.ReactNode }) {
    return (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => toggleSort(field)}>
        {children}
        <ArrowUpDown className="ml-1 size-3.5" />
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[130px]"><SortBtn field="quoteNumber">Mã BG</SortBtn></TableHead>
              <TableHead><SortBtn field="customerName">Khách hàng</SortBtn></TableHead>
              <TableHead className="w-[140px] text-right"><SortBtn field="total">Tổng tiền</SortBtn></TableHead>
              <TableHead className="w-[100px]"><SortBtn field="createdAt">Ngày</SortBtn></TableHead>
              <TableHead className="w-[100px]">Trạng thái</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Chưa có báo giá nào
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-sm">{q.quoteNumber}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{q.customerName || "—"}</span>
                      {q.customerCompany && (
                        <p className="text-xs text-muted-foreground">{q.customerCompany}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatCurrency(q.total)}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    <div>{new Date(q.createdAt).toLocaleDateString("vi-VN")}</div>
                    <div className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={q.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/bao-gia/${q.id}`)}>
                          <Eye className="mr-2 size-4" /> Xem / Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClone(q.id)} disabled={isPending}>
                          <Copy className="mr-2 size-4" /> Nhân bản
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(q.id)}>
                          <Share2 className="mr-2 size-4" /> Chia sẻ link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/api/export/excel/${q.id}`} download>
                            <FileSpreadsheet className="mr-2 size-4" /> Xuất Excel
                          </a>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 size-4" /> Xóa
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc muốn xóa báo giá &quot;{q.quoteNumber}&quot;?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(q.id)} disabled={isPending}>
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{total} báo giá</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Trước</Button>
            <span className="text-sm tabular-nums">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>Sau</Button>
          </div>
        </div>
      )}
    </div>
  );
}
