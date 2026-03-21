"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
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
    <div className="flex flex-col gap-7 p-6 lg:p-10">
      <PageHeader
        title="Sản phẩm"
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm sản phẩm..."
        />
        <ProductTable products={filtered} categories={categories} units={units} />
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        units={units}
      />
    </div>
  );
}
