"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction, updateProductAction } from "@/actions/product.actions";
import type { ProductWithRelations } from "@/services/product.service";

type ProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductWithRelations | null;
};

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateProductAction(product!.id, formData)
      : await createProductAction(formData);

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              name="name"
              placeholder="VD: Ống thép DN50"
              defaultValue={product?.name ?? ""}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoryId">Danh mục</Label>
              <Input
                id="categoryId"
                name="categoryId"
                placeholder="Nhập danh mục"
                defaultValue={product?.categoryId ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unitId">Đơn vị tính</Label>
              <Input
                id="unitId"
                name="unitId"
                placeholder="Nhập ĐVT"
                defaultValue={product?.unitId ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="unitPrice">Đơn giá (VNĐ) *</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              type="number"
              min={0}
              placeholder="0"
              defaultValue={product?.unitPrice ?? 0}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="specification">Quy cách</Label>
            <Input
              id="specification"
              name="specification"
              placeholder="VD: Ø60.3mm, dày 3.0mm"
              defaultValue={product?.specification ?? ""}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu sản phẩm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
