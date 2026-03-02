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
  customerSchema,
  type CustomerFormData,
} from "@/lib/validations/customer-schemas";
import {
  createCustomer,
  updateCustomer,
} from "@/app/(dashboard)/khach-hang/actions";
import type { CustomerWithCount } from "./customer-page-client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerWithCount | null;
};

function getDefaults(c: CustomerWithCount | null): CustomerFormData {
  if (!c) {
    return { name: "", company: "", phone: "", email: "", address: "", notes: "" };
  }
  return {
    name: c.name,
    company: c.company,
    phone: c.phone,
    email: c.email,
    address: c.address,
    notes: c.notes,
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
    resolver: zodResolver(customerSchema),
    defaultValues: getDefaults(customer),
  });

  useEffect(() => {
    reset(getDefaults(customer));
  }, [customer, reset]);

  function onSubmit(data: CustomerFormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateCustomer(customer.id, data)
        : await createCustomer(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEditing ? "Đã cập nhật khách hàng" : "Đã thêm khách hàng"
        );
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
