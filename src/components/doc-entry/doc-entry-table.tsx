"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Download, FileText, MoreHorizontal, Share2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { deleteDocEntry, shareDocEntry } from "@/app/(dashboard)/documents/actions";

export type EntryRow = {
  id: string;
  docNumber: string;
  createdAt: Date | string;
  template: { id: string; name: string };
};

type Props = { entries: EntryRow[] };

/** Table rows for doc entry list */
export function DocEntryTable({ entries }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleShare(id: string) {
    startTransition(async () => {
      try {
        const token = await shareDocEntry(id);
        const url = `${window.location.origin}/share/${token}`;
        await navigator.clipboard.writeText(url);
        toast.success("Đã sao chép link chia sẻ");
      } catch {
        toast.error("Tạo link chia sẻ thất bại");
      }
    });
  }

  function handleDelete(id: string, docNumber: string) {
    startTransition(async () => {
      try {
        await deleteDocEntry(id);
        toast.success(`Đã xóa tài liệu ${docNumber}`);
      } catch {
        toast.error("Xóa thất bại, vui lòng thử lại");
      }
    });
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Số tài liệu</TableHead>
            <TableHead>Mẫu</TableHead>
            <TableHead className="w-[160px]">Ngày tạo</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                Không có tài liệu nào
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono font-medium">{entry.docNumber}</TableCell>
                <TableCell className="text-muted-foreground">{entry.template.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(entry.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/documents/${entry.id}`}>
                          <Pencil className="mr-2 size-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(entry.id)}>
                        <Share2 className="mr-2 size-4" />
                        Chia sẻ
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/api/doc-export/excel/${entry.id}`} download>
                          <Download className="mr-2 size-4" />
                          Xuất Excel
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/api/doc-export/pdf/${entry.id}`} download>
                          <FileText className="mr-2 size-4" />
                          Xuất PDF
                        </a>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Xóa
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc muốn xóa tài liệu &quot;{entry.docNumber}&quot;?
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(entry.id, entry.docNumber)}
                              disabled={isPending}
                            >
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
  );
}
