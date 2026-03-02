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
  productSchema,
  type ProductFormData,
} from "@/lib/validations/product-schemas";
import { createProduct, updateProduct } from "@/app/(dashboard)/san-pham/actions";
import { ProductPricingFields } from "./product-pricing-fields";
import type { ProductWithRelations } from "./product-page-client";
import type { Category, Unit } from "@/generated/prisma/client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithRelations | null;
  categories: Category[];
  units: Unit[];
};

function getDefaults(product: ProductWithRelations | null): ProductFormData {
  if (!product) {
    return {
      code: "",
      name: "",
      categoryId: "",
      unitId: "",
      description: "",
      notes: "",
      pricingType: "FIXED",
      basePrice: 0,
      pricingTiers: [],
      volumeDiscounts: [],
    };
  }
  return {
    code: product.code,
    name: product.name,
    categoryId: product.categoryId,
    unitId: product.unitId,
    description: product.description,
    notes: product.notes,
    pricingType: product.pricingType,
    basePrice: parseFloat(product.basePrice),
    pricingTiers: product.pricingTiers.map((t) => ({
      minQuantity: t.minQuantity,
      maxQuantity: t.maxQuantity,
      price: parseFloat(t.price),
    })),
    volumeDiscounts: product.volumeDiscounts.map((d) => ({
      minQuantity: d.minQuantity,
      discountPercent: parseFloat(d.discountPercent),
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
    resolver: zodResolver(productSchema),
    defaultValues: getDefaults(product),
  });

  useEffect(() => {
    reset(getDefaults(product));
  }, [product, reset]);

  function onSubmit(data: ProductFormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product.id, data)
        : await createProduct(data);
      if (result.error) {
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
              <Input {...register("code")} />
              {errors.code && <FieldError>{errors.code.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Tên sản phẩm *</FieldLabel>
              <Input {...register("name")} />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Danh mục *</FieldLabel>
              <Select
                value={watch("categoryId")}
                onValueChange={(v) => setValue("categoryId", v)}
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
              {errors.categoryId && (
                <FieldError>{errors.categoryId.message}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel>Đơn vị tính *</FieldLabel>
              <Select
                value={watch("unitId")}
                onValueChange={(v) => setValue("unitId", v)}
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
              {errors.unitId && (
                <FieldError>{errors.unitId.message}</FieldError>
              )}
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
              Hủy
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
