"use client";

import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormWatch,
  type UseFormSetValue,
  type FieldErrors,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { ProductFormData } from "@/lib/validations/product-schemas";

type Props = {
  control: Control<ProductFormData>;
  register: UseFormRegister<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
};

export function ProductPricingFields({
  control,
  register,
  watch,
  setValue,
  errors,
}: Props) {
  const pricingType = watch("pricingType");

  const {
    fields: tierFields,
    append: appendTier,
    remove: removeTier,
  } = useFieldArray({ control, name: "pricingTiers" });

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({ control, name: "volumeDiscounts" });

  return (
    <div className="space-y-4">
      {/* Pricing type selector */}
      <Field>
        <FieldLabel>Hình thức giá *</FieldLabel>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={pricingType === "FIXED" ? "default" : "outline"}
            onClick={() => setValue("pricingType", "FIXED")}
          >
            Giá cố định
          </Button>
          <Button
            type="button"
            size="sm"
            variant={pricingType === "TIERED" ? "default" : "outline"}
            onClick={() => setValue("pricingType", "TIERED")}
          >
            Giá bậc thang
          </Button>
        </div>
      </Field>

      {/* Fixed base price */}
      {pricingType === "FIXED" && (
        <Field>
          <FieldLabel>Giá bán (VNĐ) *</FieldLabel>
          <Input
            type="number"
            min={0}
            {...register("basePrice", { valueAsNumber: true })}
          />
          {errors.basePrice && (
            <FieldError>{errors.basePrice.message}</FieldError>
          )}
        </Field>
      )}

      {/* Tiered pricing rows */}
      {pricingType === "TIERED" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel>Bảng giá bậc thang</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendTier({ minQuantity: 1, maxQuantity: null, price: 0 })
              }
            >
              <Plus className="mr-1 size-3.5" />
              Thêm bậc
            </Button>
          </div>
          {tierFields.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có bậc giá nào</p>
          )}
          {tierFields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Từ SL</label>
                <Input
                  type="number"
                  min={1}
                  {...register(`pricingTiers.${index}.minQuantity`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Đến SL</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="∞"
                  {...register(`pricingTiers.${index}.maxQuantity`, {
                    setValueAs: (v: string) =>
                      v === "" || v === undefined ? null : Number(v),
                  })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Đơn giá</label>
                <Input
                  type="number"
                  min={0}
                  {...register(`pricingTiers.${index}.price`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 text-destructive"
                onClick={() => removeTier(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Volume discount rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldLabel>Chiết khấu theo số lượng</FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendDiscount({ minQuantity: 1, discountPercent: 0 })
            }
          >
            <Plus className="mr-1 size-3.5" />
            Thêm mức CK
          </Button>
        </div>
        {discountFields.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có chiết khấu nào</p>
        )}
        {discountFields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Từ SL</label>
              <Input
                type="number"
                min={1}
                {...register(`volumeDiscounts.${index}.minQuantity`, {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Chiết khấu %</label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                {...register(`volumeDiscounts.${index}.discountPercent`, {
                  valueAsNumber: true,
                })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 text-destructive"
              onClick={() => removeDiscount(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
