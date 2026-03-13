"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  companyInfoSchema,
  bankingSchema,
  type CompanyInfoFormData,
  type BankingFormData,
} from "@/lib/validations/settings-schemas";
import { updateCompanyInfo, updateBanking, uploadLogo } from "@/app/(dashboard)/settings/actions";
import type { Tenant } from "@/db/schema";

type Props = { settings: Tenant; bankingOnly?: boolean };

export function CompanyInfoForm({ settings, bankingOnly = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const companyForm = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: settings.companyName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      taxCode: settings.taxCode,
      website: settings.website,
    },
  });

  const bankingForm = useForm<BankingFormData>({
    resolver: zodResolver(bankingSchema),
    defaultValues: {
      bankName: settings.bankName,
      bankAccount: settings.bankAccount,
      bankOwner: settings.bankOwner,
    },
  });

  function onSubmitCompany(data: CompanyInfoFormData) {
    startTransition(async () => {
      const result = await updateCompanyInfo(data);
      if (!result.ok) toast.error(result.error);
      else toast.success("Đã lưu thông tin công ty");
    });
  }

  function onSubmitBanking(data: BankingFormData) {
    startTransition(async () => {
      const result = await updateBanking(data);
      if (!result.ok) toast.error(result.error);
      else toast.success("Đã lưu thông tin ngân hàng");
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadLogo(formData);
    setUploading(false);
    if (!result.ok) toast.error(result.error);
    else {
      setLogoUrl(result.value.url);
      toast.success("Đã tải logo lên");
    }
  }

  if (bankingOnly) {
    return (
      <form onSubmit={bankingForm.handleSubmit(onSubmitBanking)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Thông tin ngân hàng</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Tên ngân hàng"
                error={bankingForm.formState.errors.bankName?.message}
                {...bankingForm.register("bankName")}
              />
              <FieldInput
                label="Số tài khoản"
                error={bankingForm.formState.errors.bankAccount?.message}
                {...bankingForm.register("bankAccount")}
              />
              <FieldInput
                label="Chủ tài khoản"
                error={bankingForm.formState.errors.bankOwner?.message}
                {...bankingForm.register("bankOwner")}
              />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Lưu thông tin ngân hàng
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Thông tin công ty</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Logo upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-md border object-contain" />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                {uploading ? "Đang tải..." : "Tải logo"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput
              label="Tên công ty *"
              error={companyForm.formState.errors.companyName?.message}
              {...companyForm.register("companyName")}
            />
            <FieldInput
              label="Số điện thoại"
              error={companyForm.formState.errors.phone?.message}
              {...companyForm.register("phone")}
            />
            <FieldInput
              label="Địa chỉ"
              error={companyForm.formState.errors.address?.message}
              {...companyForm.register("address")}
            />
            <FieldInput
              label="Email"
              error={companyForm.formState.errors.email?.message}
              {...companyForm.register("email")}
            />
            <FieldInput label="Mã số thuế" {...companyForm.register("taxCode")} />
            <FieldInput label="Website" {...companyForm.register("website")} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Lưu thông tin
      </Button>
    </form>
  );
}

function FieldInput({
  label,
  error,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
