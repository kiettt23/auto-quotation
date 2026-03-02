"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@/app/(dashboard)/cai-dat/actions";
import type { Category, Unit } from "@/generated/prisma/client";

type Props = {
  categories: Category[];
  units: Unit[];
};

export function CategoriesUnitsManager({ categories, units }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <InlineList
        title="Danh mục sản phẩm"
        items={categories}
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
        placeholder="Tên danh mục mới"
      />
      <InlineList
        title="Đơn vị tính"
        items={units}
        onCreate={createUnit}
        onUpdate={updateUnit}
        onDelete={deleteUnit}
        placeholder="Tên đơn vị mới"
      />
    </div>
  );
}

type InlineListProps = {
  title: string;
  items: { id: string; name: string }[];
  onCreate: (name: string) => Promise<{ error?: string; success?: boolean }>;
  onUpdate: (id: string, name: string) => Promise<{ error?: string; success?: boolean }>;
  onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>;
  placeholder: string;
};

function InlineList({
  title,
  items,
  onCreate,
  onUpdate,
  onDelete,
  placeholder,
}: InlineListProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const result = await onCreate(newName.trim());
      if (result.error) {
        toast.error(result.error);
      } else {
        setNewName("");
        toast.success("Đã thêm");
      }
    });
  }

  function startEdit(item: { id: string; name: string }) {
    setEditingId(item.id);
    setEditName(item.name);
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) return;
    startTransition(async () => {
      const result = await onUpdate(id, editName.trim());
      if (result.error) {
        toast.error(result.error);
      } else {
        setEditingId(null);
        toast.success("Đã cập nhật");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await onDelete(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã xóa");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new */}
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreate())}
          />
          <Button
            type="button"
            size="sm"
            disabled={isPending || !newName.trim()}
            onClick={handleCreate}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </Button>
        </div>

        {/* List */}
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/50"
            >
              {editingId === item.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(item.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="h-8"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => handleUpdate(item.id)}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{item.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => startEdit(item)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc muốn xóa &quot;{item.name}&quot;? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Chưa có mục nào
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
