"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductTable } from "@/components/products/product-table";
import { ProductDialog } from "@/components/products/product-dialog";
import type { ProductWithRelations } from "@/services/product.service";
import type { CategoryRow } from "@/services/category.service";
import type { UnitRow } from "@/services/unit.service";

type Props = {
  products: ProductWithRelations[];
  categories: CategoryRow[];
  units: UnitRow[];
};

export function ProductPageClient({ products, categories, units }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <Input
        placeholder="Tìm sản phẩm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <ProductTable
        products={filtered}
        categories={categories}
        units={units}
      />

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        units={units}
      />
    </div>
  );
}
