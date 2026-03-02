"use client";

import { useState } from "react";
import { ProductToolbar } from "./product-toolbar";
import { ProductDataTable } from "./product-data-table";
import { ProductDialog } from "./product-dialog";
import { ProductImportWizard } from "./product-import-wizard";
import type { Category, Unit } from "@/generated/prisma/client";

type ProductWithRelations = {
  id: string;
  code: string;
  name: string;
  description: string;
  notes: string;
  categoryId: string;
  unitId: string;
  basePrice: string;
  pricingType: "FIXED" | "TIERED";
  category: { id: string; name: string };
  unit: { id: string; name: string };
  pricingTiers: { id: string; minQuantity: number; maxQuantity: number | null; price: string }[];
  volumeDiscounts: { id: string; minQuantity: number; discountPercent: string }[];
};

type Props = {
  products: ProductWithRelations[];
  total: number;
  page: number;
  totalPages: number;
  categories: Category[];
  units: Unit[];
  currentCategoryId?: string;
  currentSearch?: string;
  currentSort: string;
  currentOrder: string;
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
  currentSort,
  currentOrder,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

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
        currentSort={currentSort}
        currentOrder={currentOrder}
        onEdit={handleEdit}
      />

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories}
        units={units}
      />

      <ProductImportWizard
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}

export type { ProductWithRelations };
