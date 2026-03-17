"use client";

import { useActionState } from "react";
import { updateCompanyAction } from "@/actions/company.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { CompanyRow } from "@/services/company.service";
import type { ActionResult } from "@/lib/utils/action-result";

export function SettingsForm({ company }: { company: CompanyRow }) {
  const [, formAction, isPending] = useActionState(
    async (_prev: ActionResult<{ companyId: string }> | null, formData: FormData) => {
      const result = await updateCompanyAction(formData);
      if (result.success) {
        toast.success("Đã lưu thông tin công ty");
      } else {
        toast.error(result.error);
      }
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Thông tin cơ bản
        </h2>
        <div className="flex flex-col gap-4">
          <FieldRow label="Tên công ty *" name="name" defaultValue={company.name} />
          <FieldRow label="Địa chỉ" name="address" defaultValue={company.address ?? ""} />
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Số điện thoại" name="phone" defaultValue={company.phone ?? ""} />
            <FieldRow label="Mã số thuế" name="taxCode" defaultValue={company.taxCode ?? ""} />
          </div>
          <FieldRow label="Email" name="email" type="email" defaultValue={company.email ?? ""} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Thông tin ngân hàng
        </h2>
        <div className="flex flex-col gap-4">
          <FieldRow label="Tên ngân hàng" name="bankName" defaultValue={company.bankName ?? ""} />
          <FieldRow label="Số tài khoản" name="bankAccount" defaultValue={company.bankAccount ?? ""} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
}

function FieldRow({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}
