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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  customerFormSchema,
  type CustomerFormData,
} from "@/lib/validations/customer-schemas";
import { saveCustomer } from "@/app/(dashboard)/customers/actions";
import type { CustomerWithDocCount } from "@/services/customer-service";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerWithDocCount | null;
};

function getDefaults(c: CustomerWithDocCount | null): CustomerFormData {
  if (!c) {
    return { name: "", company: "", phone: "", email: "", address: "", notes: "", defaultDeliveryAddress: "", defaultReceiverName: "", defaultReceiverPhone: "" };
  }
  return {
    name: c.name,
    company: c.company,
    phone: c.phone,
    email: c.email,
    address: c.address,
    notes: c.notes,
    defaultDeliveryAddress: c.defaultDeliveryAddress,
    defaultReceiverName: c.defaultReceiverName,
    defaultReceiverPhone: c.defaultReceiverPhone,
  };
}

export function CustomerDialog({ open, onOpenChange, customer }: Props) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: getDefaults(customer),
  });

  useEffect(() => {
    reset(getDefaults(customer));
  }, [customer, reset]);

  function onSubmit(data: CustomerFormData) {
    startTransition(async () => {
      const result = await saveCustomer(data, customer?.id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Đã cập nhật khách hàng" : "Đã thêm khách hàng");
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Sửa khách hàng" : "Thêm khách hàng"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Tên khách hàng *</FieldLabel>
            <Input {...register("name")} />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Công ty</FieldLabel>
              <Input {...register("company")} />
            </Field>
            <Field>
              <FieldLabel>Điện thoại</FieldLabel>
              <Input {...register("phone")} />
            </Field>
          </div>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" {...register("email")} />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Địa chỉ</FieldLabel>
            <Textarea rows={2} {...register("address")} />
          </Field>

          <Field>
            <FieldLabel>Ghi chú</FieldLabel>
            <Textarea rows={2} {...register("notes")} />
          </Field>

          {/* Delivery defaults */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3 text-muted-foreground">Thông tin giao hàng mặc định</p>
            <div className="space-y-4">
              <Field>
                <FieldLabel>Địa chỉ giao hàng</FieldLabel>
                <Input {...register("defaultDeliveryAddress")} placeholder="Để trống nếu giống địa chỉ chính" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Người nhận</FieldLabel>
                  <Input {...register("defaultReceiverName")} />
                </Field>
                <Field>
                  <FieldLabel>SĐT người nhận</FieldLabel>
                  <Input {...register("defaultReceiverPhone")} />
                </Field>
              </div>
            </div>
          </div>

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
              {isEditing ? "Cập nhật" : "Thêm khách hàng"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
