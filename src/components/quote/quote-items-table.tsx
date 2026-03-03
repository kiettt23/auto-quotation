"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";
import { calculateLineTotal } from "@/lib/pricing-engine";
import { QuoteProductSearch } from "./quote-product-search";
import type { UseFieldArrayReturn, UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { QuoteFormValues } from "@/lib/validations/quote-schemas";

type Props = {
  fieldArray: UseFieldArrayReturn<QuoteFormValues, "items">;
  register: UseFormRegister<QuoteFormValues>;
  watch: UseFormWatch<QuoteFormValues>;
  setValue: UseFormSetValue<QuoteFormValues>;
  errors: FieldErrors<QuoteFormValues>;
};

export function QuoteItemsTable({ fieldArray, register, watch, setValue, errors }: Props) {
  const { fields, append, remove, move } = fieldArray;
  const [searchOpen, setSearchOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  }

  function addProduct(product: { productId: string; name: string; unit: string; unitPrice: number }) {
    append({
      productId: product.productId,
      name: product.name,
      description: "",
      unit: product.unit,
      quantity: 1,
      unitPrice: product.unitPrice,
      discountPercent: 0,
      isCustomItem: false,
      sortOrder: fields.length,
    });
  }

  function addCustomItem() {
    append({
      productId: null,
      name: "",
      description: "",
      unit: "",
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      isCustomItem: true,
      sortOrder: fields.length,
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Sản phẩm / Dịch vụ</CardTitle>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSearchOpen(true)}>
              <Plus className="mr-1 size-3.5" /> Thêm SP
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={addCustomItem}>
              <Plus className="mr-1 size-3.5" /> Dòng tùy chỉnh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            Chưa có sản phẩm. Nhấn &quot;Thêm SP&quot; hoặc Ctrl+K để tìm.
          </p>
        ) : (
          <div className="space-y-1 overflow-x-auto">
            {/* Header */}
            <div className="grid grid-cols-[24px_1fr_60px_100px_100px_80px_100px_32px] gap-2 text-xs text-muted-foreground px-1 pb-1 min-w-[600px]">
              <div />
              <div>Tên</div>
              <div>ĐVT</div>
              <div className="text-right">SL / Kỳ hạn</div>
              <div className="text-right">Đơn giá</div>
              <div className="text-right">CK%</div>
              <div className="text-right">Thành tiền</div>
              <div />
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {fields.map((field, index) => (
                  <SortableItemRow
                    key={field.id}
                    id={field.id}
                    index={index}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    onRemove={() => remove(index)}
                    isCustom={watch(`items.${index}.isCustomItem`)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {errors.items && typeof errors.items.message === "string" && (
          <p className="text-xs text-destructive mt-2">{errors.items.message}</p>
        )}
      </CardContent>

      <QuoteProductSearch open={searchOpen} onOpenChange={setSearchOpen} onSelect={addProduct} />
    </Card>
  );
}

function SortableItemRow({
  id,
  index,
  register,
  watch,
  setValue,
  onRemove,
  isCustom,
}: {
  id: string;
  index: number;
  register: UseFormRegister<QuoteFormValues>;
  watch: UseFormWatch<QuoteFormValues>;
  setValue: UseFormSetValue<QuoteFormValues>;
  onRemove: () => void;
  isCustom: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const qty = watch(`items.${index}.quantity`) || 0;
  const unit = watch(`items.${index}.unit`) || "";
  const price = watch(`items.${index}.unitPrice`) || 0;
  const disc = watch(`items.${index}.discountPercent`) || 0;
  const lineTotal = calculateLineTotal(price, qty, disc);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[24px_1fr_60px_100px_100px_80px_100px_32px] gap-2 items-center rounded-md border px-1 py-1.5 bg-background min-w-[600px]"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-muted-foreground">
        <GripVertical className="size-4" />
      </button>
      {isCustom ? (
        <Input className="h-8 text-sm" {...register(`items.${index}.name`)} placeholder="Tên..." />
      ) : (
        <span className="text-sm truncate">{watch(`items.${index}.name`)}</span>
      )}
      {isCustom ? (
        <Input className="h-8 text-sm" {...register(`items.${index}.unit`)} placeholder="ĐVT" />
      ) : (
        <span className="text-xs text-muted-foreground">{watch(`items.${index}.unit`)}</span>
      )}
      <div className="space-y-0.5">
        <Input type="number" min={1} className="h-7 text-sm text-right" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
        <div className="flex gap-0.5 justify-end">
          {([1, 3, 6, 12] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setValue(`items.${index}.quantity`, m);
                setValue(`items.${index}.unit`, "Tháng");
              }}
              className={cn(
                "text-[9px] h-4 px-1 rounded border transition-colors leading-none",
                qty === m && unit === "Tháng"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {m}T
            </button>
          ))}
        </div>
      </div>
      <Input type="number" min={0} className="h-8 text-sm text-right" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} />
      <Input type="number" min={0} max={100} className="h-8 text-sm text-right" {...register(`items.${index}.discountPercent`, { valueAsNumber: true })} />
      <span className="text-sm text-right tabular-nums font-medium">{formatCurrency(lineTotal)}</span>
      <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive" onClick={onRemove}>
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
