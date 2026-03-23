"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setupCompanyAction } from "@/actions/company.actions";

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await setupCompanyAction(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[520px] rounded-2xl border bg-white p-10"
    >
      <div className="flex flex-col gap-7">
        <div className="inline-flex w-fit rounded-full bg-indigo-50 px-4 py-1.5">
          <span className="text-xs font-medium text-indigo-600">Bước 1 / 1</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Thiết lập công ty
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Thông tin này sẽ hiển thị trên báo giá và tài liệu của bạn.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Tên công ty *</Label>
          <Input
            id="name"
            name="name"
            placeholder="VD: Công ty TNHH ABC"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Địa chỉ</Label>
          <Input
            id="address"
            name="address"
            placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" name="phone" placeholder="028 1234 5678" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="taxCode">Mã số thuế</Label>
            <Input id="taxCode" name="taxCode" placeholder="0123456789" />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Đang thiết lập..." : "Bắt đầu sử dụng"}
        </Button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full text-center text-xs text-slate-400 transition-colors hover:text-slate-600"
        >
          Bỏ qua, thiết lập sau
        </button>
      </div>
    </form>
  );
}
