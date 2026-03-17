"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateCompanyAction } from "@/actions/company.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "sonner";
import type { CompanyRow } from "@/services/company.service";

interface Props {
  company: CompanyRow;
  section: "company" | "bank";
  onDirtyChange?: (dirty: boolean) => void;
}

export function SettingsForm({ company, section, onDirtyChange }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Warn on browser navigation (close tab, refresh)
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleChange = useCallback(() => {
    setIsDirty(true);
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    if (section === "company") {
      formData.set("bankName", company.bankName ?? "");
      formData.set("bankAccount", company.bankAccount ?? "");
      formData.set("email", formData.get("email") ?? company.email ?? "");
    } else {
      formData.set("name", company.name);
      formData.set("address", company.address ?? "");
      formData.set("phone", company.phone ?? "");
      formData.set("taxCode", company.taxCode ?? "");
      formData.set("email", company.email ?? "");
    }

    const result = await updateCompanyAction(formData);
    setIsPending(false);

    if (result.success) {
      setIsDirty(false);
      onDirtyChange?.(false);
      toast.success("Đã lưu thay đổi");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onChange={handleChange} className="flex flex-col gap-5">
      {/* Header with title + save button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {section === "company" ? "Thông tin công ty" : "Thông tin ngân hàng"}
          </h2>
          <p className="text-sm text-slate-500">
            {section === "company"
              ? "Hiển thị trên header báo giá và tài liệu."
              : "Hiển thị phần thanh toán trên tài liệu."}
          </p>
        </div>
        <Button type="submit" disabled={isPending || !isDirty} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>

      {/* Fields */}
      {section === "company" && (
        <div className="flex flex-col gap-4">
          <Field label="Tên công ty *" name="name" defaultValue={company.name} />
          <Field label="Địa chỉ" name="address" defaultValue={company.address ?? ""} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Số điện thoại" name="phone" defaultValue={company.phone ?? ""} />
            <Field label="Mã số thuế" name="taxCode" defaultValue={company.taxCode ?? ""} />
          </div>
          <Field label="Email" name="email" type="email" defaultValue={company.email ?? ""} />
        </div>
      )}

      {section === "bank" && (
        <div className="flex flex-col gap-4">
          <Field label="Tên ngân hàng" name="bankName" defaultValue={company.bankName ?? ""} />
          <Field label="Số tài khoản" name="bankAccount" defaultValue={company.bankAccount ?? ""} />
        </div>
      )}
    </form>
  );
}

function Field({
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
      <Label htmlFor={name} className="text-xs font-medium text-slate-600">
        {label}
      </Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} className="h-10" />
    </div>
  );
}
