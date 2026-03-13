"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchProducts } from "@/app/(dashboard)/quotes/actions";
import { formatCurrency } from "@/lib/format-currency";
import { calculateUnitPrice, type PricingProduct } from "@/lib/pricing-engine";

type ProductResult = {
  id: string;
  code: string;
  name: string;
  basePrice: string;
  pricingType: "FIXED" | "TIERED";
  category: { id: string; name: string };
  unit: { id: string; name: string };
  pricingTiers: { minQuantity: number; maxQuantity: number | null; price: string }[];
  volumeDiscounts: { minQuantity: number; discountPercent: string }[];
};

type SelectedProduct = {
  productId: string;
  name: string;
  unit: string;
  unitPrice: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: SelectedProduct) => void;
};

export function QuoteProductSearch({ open, onOpenChange, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);

  const doSearch = useCallback(async (q: string) => {
    const result = await searchProducts(q);
    setResults(result.ok ? (result.value as unknown as ProductResult[]) : []);
  }, []);

  // Load default products when dialog opens
  useEffect(() => {
    if (open) doSearch("");
  }, [open, doSearch]);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  function handleSelect(product: ProductResult) {
    const pricingProduct: PricingProduct = {
      pricingType: product.pricingType,
      basePrice: Number(product.basePrice),
      pricingTiers: product.pricingTiers.map((t) => ({
        ...t,
        price: Number(t.price),
      })),
      volumeDiscounts: product.volumeDiscounts.map((d) => ({
        ...d,
        discountPercent: Number(d.discountPercent),
      })),
    };

    const unitPrice = calculateUnitPrice(pricingProduct, 1);

    onSelect({
      productId: product.id,
      name: product.name,
      unit: product.unit.name,
      unitPrice,
    });

    setQuery("");
    onOpenChange(false);
  }

  // Group results by category
  const grouped = results.reduce<Record<string, ProductResult[]>>((acc, p) => {
    const cat = p.category.name;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Tìm sản phẩm theo tên hoặc mã..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Không tìm thấy sản phẩm</CommandEmpty>
        {Object.entries(grouped).map(([category, products]) => (
          <CommandGroup key={category} heading={category}>
            {products.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.code} ${p.name}`}
                onSelect={() => handleSelect(p)}
              >
                <div className="flex w-full items-center justify-between">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.code}
                    </span>
                  </div>
                  <span className="text-sm tabular-nums">
                    {p.pricingType === "TIERED"
                      ? "Bậc thang"
                      : formatCurrency(p.basePrice)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
