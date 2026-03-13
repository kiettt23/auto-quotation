"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  productFormSchema,
  type ProductFormData,
} from "@/lib/validations/product-schemas";
import { saveProductAction } from "@/app/(dashboard)/products/actions";
import { ProductPricingFields } from "./product-pricing-fields";
import type { ProductWithRelations } from "@/services/product-service";
import type { Category, Unit } from "@/db/schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithRelations | null;
  categories: Category[];
  units: Unit[];
};

function buildDefaults(product: ProductWithRelations | null): ProductFormData {
  if (!product) {
    return {
      code: "",
      name: "",
      description: "",
      notes: "",
      categoryId: null,
      unitId: null,
      pricingType: "FIXED",
      basePrice: 0,
      pricingTiers: [],
      volumeDiscounts: [],
    };
  }
  return {
    code: product.code,
    name: product.name,
    description: product.description,
    notes: product.notes,
    categoryId: product.categoryId ?? null,
    unitId: product.unitId ?? null,
    pricingType: product.pricingType,
    basePrice: Number(product.basePrice),
    pricingTiers: product.pricingTiers.map((t) => ({
      minQuantity: t.minQuantity,
      maxQuantity: t.maxQuantity,
      price: t.price,
    })),
    volumeDiscounts: product.volumeDiscounts.map((d) => ({
      minQuantity: d.minQuantity,
      discountPercent: d.discountPercent,
    })),
  };
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  units,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: buildDefaults(product),
  });

  useEffect(() => {
    reset(buildDefaults(product));
  }, [product, reset]);

  function onSubmit(data: ProductFormData) {
    startTransition(async () => {
      const result = await saveProductAction(data, product?.id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Mã sản phẩm *</FieldLabel>
              <Input {...register("code")} placeholder="VD: SP-001" />
              {errors.code && <FieldError>{errors.code.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Tên sản phẩm *</FieldLabel>
              <Input {...register("name")} />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Danh mục</FieldLabel>
              <Select
                value={watch("categoryId") ?? ""}
                onValueChange={(v) =>
                  setValue("categoryId", v || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Đơn vị tính</FieldLabel>
              <Select
                value={watch("unitId") ?? ""}
                onValueChange={(v) => setValue("unitId", v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <Textarea rows={2} {...register("description")} />
          </Field>

          <ProductPricingFields
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />

          <Field>
            <FieldLabel>Ghi chú nội bộ</FieldLabel>
            <Textarea rows={2} {...register("notes")} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Cập nhật" : "Thêm sản phẩm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
