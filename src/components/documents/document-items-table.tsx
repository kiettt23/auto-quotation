"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/document-helpers";
import type { DocumentItem } from "@/lib/validations/document.schema";

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  unitName?: string | null;
}

interface Props {
  items: DocumentItem[];
  products: Product[];
  onItemsChange: (items: DocumentItem[]) => void;
}

export function DocumentItemsTable({ items, products, onItemsChange }: Props) {
  function updateItem(index: number, patch: Partial<DocumentItem>) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const merged = { ...item, ...patch };
      merged.amount = merged.quantity * merged.unitPrice;
      return merged;
    });
    onItemsChange(updated);
  }

  function addItem() {
    onItemsChange([
      ...items,
      { productName: "", unit: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    onItemsChange(items.filter((_, i) => i !== index));
  }

  function handleProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateItem(index, {
      productId: product.id,
      productName: product.name,
      unit: product.unitName ?? "",
      unitPrice: product.unitPrice,
    });
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        Danh sách sản phẩm
      </h2>

      {/* Header */}
      <div className="mb-2 grid grid-cols-[40px_1fr_80px_80px_120px_120px_40px] gap-2 px-2">
        <span className="text-xs font-semibold text-slate-500">STT</span>
        <span className="text-xs font-semibold text-slate-500">Sản phẩm</span>
        <span className="text-xs font-semibold text-slate-500">ĐVT</span>
        <span className="text-xs font-semibold text-slate-500">SL</span>
        <span className="text-right text-xs font-semibold text-slate-500">
          Đơn giá
        </span>
        <span className="text-right text-xs font-semibold text-slate-500">
          Thành tiền
        </span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[40px_1fr_80px_80px_120px_120px_40px] items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5"
          >
            <span className="text-center text-sm text-slate-500">
              {index + 1}
            </span>

            <Select
              value={item.productId ?? ""}
              onValueChange={(v) => handleProductSelect(index, v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Chọn SP..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={item.unit ?? ""}
              onChange={(e) => updateItem(index, { unit: e.target.value })}
              className="h-9 text-sm"
              placeholder="ĐVT"
            />

            <Input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, { quantity: Number(e.target.value) || 1 })
              }
              className="h-9 text-sm"
            />

            <Input
              type="number"
              min={0}
              value={item.unitPrice}
              onChange={(e) =>
                updateItem(index, { unitPrice: Number(e.target.value) || 0 })
              }
              className="h-9 text-right text-sm"
            />

            <span className="text-right text-sm font-medium text-slate-900">
              {formatCurrency(item.quantity * item.unitPrice)}
            </span>

            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="rounded p-1 text-slate-400 hover:text-red-500 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add + Total */}
      <div className="mt-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addItem}
          className="text-blue-600 hover:text-blue-700"
        >
          <Plus className="mr-1 h-4 w-4" />
          Thêm sản phẩm
        </Button>

        <div className="flex items-center gap-4 pr-12">
          <span className="text-base font-semibold text-slate-900">
            Tổng cộng:
          </span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
