"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Download, FileText, MoreHorizontal, Share2, Loader2, Copy } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteDocEntry, shareDocEntry, duplicateDocEntry } from "@/app/(dashboard)/documents/actions";

export type EntryRow = {
  id: string;
  docNumber: string;
  createdAt: Date | string;
  template: { id: string; name: string };
};

type Props = { entries: EntryRow[] };

/** Table rows for doc entry list */
export function DocEntryTable({ entries }: Props) {
  /* Per-row pending states */
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [, startDuplicateTransition] = useTransition();

  /* AlertDialog state — extracted outside dropdown for keyboard focus */
  const [deleteTarget, setDeleteTarget] = useState<EntryRow | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  /* Share confirmation dialog state */
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isSharing, startShareTransition] = useTransition();

  function handleShare(entry: EntryRow) {
    setSharingId(entry.id);
    startShareTransition(async () => {
      try {
        const token = await shareDocEntry(entry.id);
        const url = `${window.location.origin}/share/${token}`;
        setShareUrl(url);
        setShareDialogOpen(true);
      } catch {
        toast.error("Tạo link chia sẻ thất bại");
      } finally {
        setSharingId(null);
      }
    });
  }

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Đã sao chép link chia sẻ");
  }

  function handleDuplicate(entry: EntryRow) {
    setDuplicatingId(entry.id);
    startDuplicateTransition(async () => {
      try {
        const newDoc = await duplicateDocEntry(entry.id);
        toast.success(`Đã tạo bản sao: ${newDoc.docNumber}`);
      } catch {
        toast.error("Tạo bản sao thất bại");
      } finally {
        setDuplicatingId(null);
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const { id, docNumber } = deleteTarget;
    setDeletingId(id);
    startDeleteTransition(async () => {
      try {
        await deleteDocEntry(id);
        toast.success(`Đã xóa tài liệu ${docNumber}`);
        setDeleteTarget(null);
      } catch {
        toast.error("Xóa thất bại, vui lòng thử lại");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <>
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
                        <Button variant="ghost" size="icon" className="size-8" aria-label="Tùy chọn">
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
                        <DropdownMenuItem
                          onClick={() => handleShare(entry)}
                          disabled={sharingId === entry.id}
                        >
                          {sharingId === entry.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Share2 className="mr-2 size-4" />
                          )}
                          Chia sẻ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(entry)}
                          disabled={duplicatingId === entry.id}
                        >
                          {duplicatingId === entry.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Copy className="mr-2 size-4" />
                          )}
                          Tạo bản sao
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(entry)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation — outside dropdown for proper keyboard focus */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa tài liệu &quot;{deleteTarget?.docNumber}&quot;?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share confirmation dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ tài liệu</DialogTitle>
            <DialogDescription>
              Bất kỳ ai có link này đều có thể xem tài liệu. Link có hiệu lực trong 30 ngày.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-xs" />
            <Button type="button" size="icon" variant="outline" onClick={copyShareUrl} aria-label="Sao chép link">
              <Copy className="size-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
