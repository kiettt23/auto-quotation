"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  companyInfoSchema,
  type CompanyInfoFormData,
} from "@/lib/validations/settings-schemas";
import { updateCompanyInfo, uploadLogo } from "@/app/(dashboard)/cai-dat/actions";
import type { Settings } from "@/generated/prisma/client";

type Props = { settings: Settings };

export function CompanyInfoForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: settings.companyName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      taxCode: settings.taxCode,
      website: settings.website,
      bankName: settings.bankName,
      bankAccount: settings.bankAccount,
      bankOwner: settings.bankOwner,
    },
  });

  function onSubmit(data: CompanyInfoFormData) {
    startTransition(async () => {
      const result = await updateCompanyInfo(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã lưu thông tin công ty");
      }
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("logo", file);
    const result = await uploadLogo(formData);
    setUploading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setLogoUrl(result.url ?? "");
      toast.success("Đã tải logo lên");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin công ty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-16 w-16 rounded-md border object-contain"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                {uploading ? "Đang tải..." : "Tải logo"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput label="Tên công ty *" error={errors.companyName?.message} {...register("companyName")} />
            <FieldInput label="Số điện thoại *" error={errors.phone?.message} {...register("phone")} />
            <FieldInput label="Địa chỉ *" error={errors.address?.message} {...register("address")} />
            <FieldInput label="Email" error={errors.email?.message} {...register("email")} />
            <FieldInput label="Mã số thuế" {...register("taxCode")} />
            <FieldInput label="Website" {...register("website")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin ngân hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput label="Tên ngân hàng" {...register("bankName")} />
            <FieldInput label="Số tài khoản" {...register("bankAccount")} />
            <FieldInput label="Chủ tài khoản" {...register("bankOwner")} />
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

// Reusable field wrapper
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
