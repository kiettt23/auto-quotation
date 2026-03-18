"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateCompanyAction } from "@/actions/company.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
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
      // Preserve layout/color if not in form
      if (!formData.get("headerLayout")) formData.set("headerLayout", company.headerLayout ?? "left");
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
          <Field label="Tên công ty" name="name" defaultValue={company.name} required />
          <Field label="Địa chỉ" name="address" defaultValue={company.address ?? ""} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Số điện thoại" name="phone" defaultValue={company.phone ?? ""} />
            <Field label="Mã số thuế" name="taxCode" defaultValue={company.taxCode ?? ""} />
          </div>
          <Field label="Email" name="email" type="email" defaultValue={company.email ?? ""} />
          <LogoUpload currentLogoUrl={company.logoUrl ?? null} />

          {/* PDF appearance */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Giao diện PDF</h3>
            <HeaderLayoutPicker defaultValue={company.headerLayout ?? "left"} onChange={handleChange} />
          </div>
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

function LogoUpload({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setLogoUrl(data.url);
        toast.success("Đã tải logo lên");
      } else {
        toast.error(data.error || "Upload thất bại");
      }
    } catch {
      toast.error("Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    try {
      const res = await fetch("/api/upload-logo", {
        method: "POST",
        body: (() => { const fd = new FormData(); return fd; })(),
      });
      if (res.ok) {
        setLogoUrl(null);
        toast.success("Đã xóa logo");
      }
    } catch {
      toast.error("Không thể xóa logo");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium text-slate-600">Logo công ty</Label>
      <p className="text-xs text-slate-400">Hiển thị trên header tài liệu PDF. Tối đa 2MB.</p>
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <div className="relative">
            <Image
              src={logoUrl}
              alt="Logo"
              width={80}
              height={80}
              className="rounded border border-slate-200 object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded border-2 border-dashed border-slate-200 text-xs text-slate-400">
            Logo
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-1 h-4 w-4" />
            {uploading ? "Đang tải..." : "Tải logo lên"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} className="h-10" required={required} />
    </div>
  );
}

function HeaderLayoutPicker({ defaultValue, onChange }: { defaultValue: string; onChange: () => void }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-slate-600">Bố cục header</Label>
      <input type="hidden" name="headerLayout" value={value} />
      <Select value={value} onValueChange={(v) => { setValue(v); onChange(); }}>
        <SelectTrigger className="h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Logo trái — thông tin phải</SelectItem>
          <SelectItem value="center">Căn giữa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

