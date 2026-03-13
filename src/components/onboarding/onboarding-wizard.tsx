"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Building2, Package, Rocket } from "lucide-react";
import { saveCompanyStep, saveFirstProduct, completeOnboarding } from "@/app/(dashboard)/onboarding/actions";

const STEPS = [
  { id: 1, title: "Thông tin công ty", icon: Building2 },
  { id: 2, title: "Thêm sản phẩm", icon: Package },
  { id: 3, title: "Hoàn tất", icon: Rocket },
];

export function OnboardingWizard({ defaultName, defaultSlug }: { defaultName: string; defaultSlug: string }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 state
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug);

  // Step 2 state
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");

  async function handleCompanyStep() {
    setLoading(true);
    setError("");
    const result = await saveCompanyStep({ name, slug });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setStep(2);
  }

  async function handleProductStep(skip: boolean) {
    setLoading(true);
    setError("");
    if (!skip && productName) {
      const result = await saveFirstProduct({ name: productName, price: productPrice || "0" });
      if (!result.ok) { setError(result.error); setLoading(false); return; }
    }
    setLoading(false);
    setStep(3);
  }

  async function handleComplete() {
    setLoading(true);
    await completeOnboarding();
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-12">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <div className={`flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
              step > s.id ? "bg-green-500 text-white" :
              step === s.id ? "bg-primary text-primary-foreground" :
              "bg-muted text-muted-foreground"
            }`}>
              {step > s.id ? <CheckCircle2 className="size-4" /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-12 transition-colors ${step > s.id ? "bg-green-500" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Company info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" /> Thông tin công ty
            </CardTitle>
            <CardDescription>Đặt tên và địa chỉ URL cho không gian làm việc của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tên công ty</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Công ty TNHH ABC" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="cong-ty-abc"
              />
              <p className="text-xs text-muted-foreground">Chỉ dùng chữ thường, số và dấu gạch ngang</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleCompanyStep} disabled={loading || !name || !slug} className="w-full">
              {loading ? "Đang lưu…" : "Tiếp theo"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: First product */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" /> Thêm sản phẩm đầu tiên
            </CardTitle>
            <CardDescription>Thêm một sản phẩm hoặc dịch vụ để bắt đầu tạo báo giá nhanh hơn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tên sản phẩm / dịch vụ</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Tư vấn thiết kế" />
            </div>
            <div className="space-y-1.5">
              <Label>Đơn giá (VND)</Label>
              <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="500000" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleProductStep(true)} disabled={loading} className="flex-1">
                Bỏ qua
              </Button>
              <Button onClick={() => handleProductStep(false)} disabled={loading || !productName} className="flex-1">
                {loading ? "Đang lưu…" : "Thêm sản phẩm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="size-5" /> Sẵn sàng rồi!
            </CardTitle>
            <CardDescription>Không gian làm việc của bạn đã được thiết lập xong. Hãy tạo báo giá đầu tiên nào!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleComplete} disabled={loading} className="w-full">
              {loading ? "Đang chuyển hướng…" : "Bắt đầu ngay"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
