"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProductAction } from "@/actions/product.actions";
import { ProductDialog } from "./product-dialog";
import { formatCurrency } from "@/lib/utils/document-helpers";
import type { ProductWithRelations } from "@/services/product.service";
import type { CategoryRow } from "@/services/category.service";
import type { UnitRow } from "@/services/unit.service";

type ProductTableProps = {
  products: ProductWithRelations[];
  categories: CategoryRow[];
  units: UnitRow[];
};

export function ProductTable({ products, categories, units }: ProductTableProps) {
  const [editProduct, setEditProduct] = useState<ProductWithRelations | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;
    const result = await deleteProductAction(id);
    if (result.success) {
      toast.success("Đã xóa sản phẩm");
    } else {
      toast.error(result.error);
    }
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-400">Chưa có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tên sản phẩm</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Danh mục</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">ĐVT</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Đơn giá</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} className="group">
              <TableCell className="text-[13px] font-medium">{p.name}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{p.categoryName ?? "—"}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{p.unitName ?? "—"}</TableCell>
              <TableCell className="text-right text-[13px]">{formatCurrency(p.unitPrice)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditProduct(p)} className="text-slate-500 hover:text-indigo-600">Sửa</button>
                  <button onClick={() => handleDelete(p.id, p.name)} className="text-red-400 hover:text-red-600">Xóa</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ProductDialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        product={editProduct}
        categories={categories}
        units={units}
      />
    </>
  );
}
