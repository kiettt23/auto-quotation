"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

interface ListItem {
  id: string;
  name: string;
}

interface Props {
  items: ListItem[];
  onAdd: (name: string) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  placeholder?: string;
  emptyMessage?: string;
}

export function SimpleListManager({
  items,
  onAdd,
  onDelete,
  placeholder = "Nhập tên...",
  emptyMessage = "Chưa có mục nào.",
}: Props) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setLoading(true);
    const result = await onAdd(newName.trim());
    setLoading(false);
    if (result.success) {
      setNewName("");
      toast.success(`Đã thêm "${newName.trim()}"`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(item: ListItem) {
    const result = await onDelete(item.id);
    if (result.success) {
      toast.success(`Đã xóa "${item.name}"`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add row */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={placeholder}
          className="h-10 max-w-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button
          onClick={handleAdd}
          disabled={loading || !newName.trim()}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </Button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <div className="rounded-lg border border-slate-200">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-4 py-3 ${
                i !== items.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <span className="text-sm text-slate-700">{item.name}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc muốn xóa &quot;{item.name}&quot;?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={() => handleDelete(item)}>
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
