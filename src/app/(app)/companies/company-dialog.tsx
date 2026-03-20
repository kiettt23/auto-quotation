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
import { createCompanyAction, updateCompanyAction } from "@/actions/company.actions";
import type { CompanyRow } from "@/services/company.service";

type CompanyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: CompanyRow | null;
};

export function CompanyDialog({ open, onOpenChange, company }: CompanyDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!company;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateCompanyAction(company!.id, formData)
      : await createCompanyAction(formData);

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Đã cập nhật công ty" : "Đã thêm công ty");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa công ty" : "Thêm công ty"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {/* Basic info */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Tên công ty <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" placeholder="VD: Công ty TNHH ABC" defaultValue={company?.name ?? ""} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" name="address" placeholder="123 Nguyễn Huệ, Q.1, TP.HCM" defaultValue={company?.address ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" placeholder="028 1234 5678" defaultValue={company?.phone ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="info@company.com" defaultValue={company?.email ?? ""} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="taxCode">Mã số thuế</Label>
            <Input id="taxCode" name="taxCode" placeholder="0123456789" defaultValue={company?.taxCode ?? ""} />
          </div>

          {/* Bank info */}
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-3 text-sm font-medium text-slate-700">Thông tin ngân hàng</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bankName">Ngân hàng</Label>
                <Input id="bankName" name="bankName" placeholder="Vietcombank" defaultValue={company?.bankName ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bankAccount">Số tài khoản</Label>
                <Input id="bankAccount" name="bankAccount" placeholder="0123456789" defaultValue={company?.bankAccount ?? ""} />
              </div>
            </div>
          </div>

          {/* Delivery defaults */}
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-3 text-sm font-medium text-slate-700">Thông tin vận chuyển mặc định</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="driverName">Tên tài xế</Label>
                <Input id="driverName" name="driverName" placeholder="Nguyễn Văn A" defaultValue={company?.driverName ?? ""} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vehicleId">Biển số xe</Label>
                <Input id="vehicleId" name="vehicleId" placeholder="51A-12345" defaultValue={company?.vehicleId ?? ""} />
              </div>
            </div>
          </div>

          {/* Logo URL */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="logoUrl">URL Logo</Label>
              <Input id="logoUrl" name="logoUrl" placeholder="https://..." defaultValue={company?.logoUrl ?? ""} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu công ty"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
