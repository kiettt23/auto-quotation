"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomerAction, updateCustomerAction } from "@/actions/customer.actions";
import type { CustomerRow } from "@/services/customer.service";

type CustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerRow | null;
};

export function CustomerDialog({ open, onOpenChange, customer }: CustomerDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!customer;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateCustomerAction(customer!.id, formData)
      : await createCustomerAction(formData);

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Đã cập nhật khách hàng" : "Đã thêm khách hàng");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa khách hàng" : "Thêm khách hàng"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Tên khách hàng <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              name="name"
              placeholder="VD: Công ty TNHH ABC"
              defaultValue={customer?.name ?? ""}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              name="address"
              placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
              defaultValue={customer?.address ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="028 1234 5678"
                defaultValue={customer?.phone ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="info@company.com"
                defaultValue={customer?.email ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="taxCode">Mã số thuế</Label>
            <Input
              id="taxCode"
              name="taxCode"
              placeholder="0123456789"
              defaultValue={customer?.taxCode ?? ""}
            />
          </div>

          {/* Delivery defaults */}
          <div className="border-t border-slate-100 pt-4">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Thông tin giao hàng mặc định
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deliveryName">Tên nơi giao</Label>
                <Input
                  id="deliveryName"
                  name="deliveryName"
                  placeholder="VD: Công Ty TNHH Kyong Gi Vina"
                  defaultValue={customer?.deliveryName ?? ""}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deliveryAddress">Địa chỉ giao hàng</Label>
                <Input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  placeholder="Địa chỉ nhận hàng"
                  defaultValue={customer?.deliveryAddress ?? ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="receiverName">Người nhận</Label>
                  <Input
                    id="receiverName"
                    name="receiverName"
                    placeholder="Nguyễn Văn A"
                    defaultValue={customer?.receiverName ?? ""}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="receiverPhone">SĐT người nhận</Label>
                  <Input
                    id="receiverPhone"
                    name="receiverPhone"
                    placeholder="0901 234 567"
                    defaultValue={customer?.receiverPhone ?? ""}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu khách hàng"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
