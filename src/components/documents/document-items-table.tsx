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
import type { ColumnDef } from "@/lib/types/column-def";

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  specification?: string | null;
  unitName?: string | null;
}

interface Props {
  items: DocumentItem[];
  products: Product[];
  columns: ColumnDef[];
  showTotal: boolean;
  onItemsChange: (items: DocumentItem[]) => void;
}

/** Well-known item keys that map directly to DocumentItem fields */
const KNOWN_KEYS = ["stt", "productName", "specification", "unit", "quantity", "unitPrice", "amount", "note"] as const;
type KnownKey = (typeof KNOWN_KEYS)[number];

function isKnownKey(key: string): key is KnownKey {
  return (KNOWN_KEYS as readonly string[]).includes(key);
}

/** Get value from item by column key */
function getItemValue(item: DocumentItem, key: string): string | number {
  if (isKnownKey(key)) {
    return (item[key as keyof DocumentItem] as string | number) ?? "";
  }
  return item.customFields?.[key] ?? "";
}

/** Set value on item by column key */
function setItemValue(item: DocumentItem, key: string, value: string | number): DocumentItem {
  if (isKnownKey(key)) {
    return { ...item, [key]: value };
  }
  return { ...item, customFields: { ...item.customFields, [key]: value } };
}

export function DocumentItemsTable({ items, products, columns, showTotal, onItemsChange }: Props) {
  const hasQuantity = columns.some((c) => c.key === "quantity");
  const hasUnitPrice = columns.some((c) => c.key === "unitPrice");
  const hasAmount = columns.some((c) => c.key === "amount");

  function updateItem(index: number, key: string, value: string | number) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const merged = setItemValue(item, key, value);
      // Auto-calculate amount if both quantity and unitPrice exist
      if (hasAmount && (key === "quantity" || key === "unitPrice")) {
        merged.amount = (merged.quantity ?? 0) * (merged.unitPrice ?? 0);
      }
      return merged;
    });
    onItemsChange(updated);
  }

  function handleProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const patched = {
        ...item,
        productId: product.id,
        productName: product.name,
        specification: product.specification ?? "",
        unit: product.unitName ?? "",
        unitPrice: product.unitPrice,
        amount: (item.quantity ?? 1) * product.unitPrice,
      };
      return patched;
    });
    onItemsChange(updated);
  }

  function addItem() {
    const empty: DocumentItem = { productName: "", quantity: 1, unitPrice: 0, amount: 0 };
    onItemsChange([...items, empty]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    onItemsChange(items.filter((_, i) => i !== index));
  }

  // Calculate total from currency columns
  const total = hasAmount
    ? items.reduce((sum, item) => sum + (item.amount ?? (item.quantity ?? 0) * (item.unitPrice ?? 0)), 0)
    : 0;

  // Dynamic columns excluding STT (rendered separately) and amount (rendered as computed)
  const renderCols = columns.filter((c) => c.key !== "stt");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        Danh sách sản phẩm
      </h2>

      {/* Header */}
      <div className="mb-2 flex items-center gap-2 px-2">
        <span className="w-10 text-xs font-semibold text-slate-500">STT</span>
        {renderCols.map((col) => (
          <span
            key={col.key}
            className={`text-xs font-semibold text-slate-500 ${col.align === "right" ? "text-right" : ""}`}
            style={{ flex: col.key === "productName" ? 2 : 1, minWidth: 60 }}
          >
            {col.label}
          </span>
        ))}
        <span className="w-10" />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
            {/* STT */}
            <span className="w-10 text-center text-sm text-slate-500">{index + 1}</span>

            {/* Dynamic columns */}
            {renderCols.map((col) => (
              <div key={col.key} style={{ flex: col.key === "productName" ? 2 : 1, minWidth: 60 }}>
                {col.key === "productName" ? (
                  <Select
                    value={item.productId ?? ""}
                    onValueChange={(v) => handleProductSelect(index, v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Chọn SP..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : col.key === "amount" ? (
                  <span className="block text-right text-sm font-medium text-slate-900">
                    {formatCurrency((item.quantity ?? 0) * (item.unitPrice ?? 0))}
                  </span>
                ) : col.type === "number" || col.type === "currency" ? (
                  <Input
                    type="number"
                    min={0}
                    value={getItemValue(item, col.key)}
                    onChange={(e) => updateItem(index, col.key, Number(e.target.value) || 0)}
                    className={`h-9 text-sm ${col.align === "right" ? "text-right" : ""}`}
                  />
                ) : (
                  <Input
                    value={String(getItemValue(item, col.key))}
                    onChange={(e) => updateItem(index, col.key, e.target.value)}
                    className="h-9 text-sm"
                    placeholder={col.label}
                  />
                )}
              </div>
            ))}

            {/* Delete button */}
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="w-10 cursor-pointer rounded p-1 text-slate-400 hover:text-red-500 disabled:opacity-30"
            >
              <Trash2 className="mx-auto h-4 w-4" />
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
          className="text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="mr-1 h-4 w-4" />
          Thêm sản phẩm
        </Button>

        {showTotal && (
          <div className="flex items-center gap-4 pr-12">
            <span className="text-base font-semibold text-slate-900">Tổng cộng:</span>
            <span className="text-xl font-bold text-indigo-600">{formatCurrency(total)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
