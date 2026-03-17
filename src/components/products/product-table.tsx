"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
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
      <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
        <p className="text-sm text-slate-500">Chưa có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold">Tên sản phẩm</TableHead>
              <TableHead className="font-semibold">Danh mục</TableHead>
              <TableHead className="font-semibold">ĐVT</TableHead>
              <TableHead className="text-right font-semibold">Đơn giá</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-slate-500">
                  {p.categoryName ?? "—"}
                </TableCell>
                <TableCell className="text-slate-500">
                  {p.unitName ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(p.unitPrice)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditProduct(p)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
