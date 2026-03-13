"use client";

import { useState } from "react";
import { ProductToolbar } from "./product-toolbar";
import { ProductDataTable } from "./product-data-table";
import { ProductDialog } from "./product-dialog";
import { ProductImportWizard } from "./product-import-wizard";
import type { ProductWithRelations } from "@/services/product-service";
import type { Category, Unit } from "@/db/schema";

type Props = {
  products: ProductWithRelations[];
  total: number;
  page: number;
  totalPages: number;
  categories: Category[];
  units: Unit[];
  currentCategoryId?: string;
  currentSearch?: string;
};

export function ProductPageClient({
  products,
  total,
  page,
  totalPages,
  categories,
  units,
  currentCategoryId,
  currentSearch,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithRelations | null>(null);

  function handleAdd() {
    setEditingProduct(null);
    setDialogOpen(true);
  }

  function handleEdit(product: ProductWithRelations) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <ProductToolbar
        categories={categories}
        currentCategoryId={currentCategoryId}
        currentSearch={currentSearch}
        onAddProduct={handleAdd}
        onImport={() => setImportOpen(true)}
      />

      <ProductDataTable
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        onEdit={handleEdit}
      />

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories}
        units={units}
      />

      <ProductImportWizard open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
