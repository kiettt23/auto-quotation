"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  defaultsSchema,
  type DefaultsFormData,
} from "@/lib/validations/settings-schemas";
import { updateDefaults } from "@/app/(dashboard)/settings/actions";
import type { Tenant } from "@/db/schema";

type Props = { settings: Tenant };

export function DefaultsForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DefaultsFormData>({
    resolver: zodResolver(defaultsSchema),
    defaultValues: {
      quotePrefix: settings.quotePrefix,
      defaultVatPercent: Number(settings.defaultVatPercent),
      defaultValidityDays: settings.defaultValidityDays,
      defaultShipping: Number(settings.defaultShipping),
    },
  });

  function onSubmit(data: DefaultsFormData) {
    startTransition(async () => {
      const result = await updateDefaults(data);
      if (!result.ok) toast.error(result.error);
      else toast.success("Đã lưu giá trị mặc định");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Mã báo giá</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label>Tiền tố mã báo giá</Label>
            <Input {...register("quotePrefix")} />
            <p className="text-xs text-muted-foreground">
              Ví dụ: BG-&#123;YYYY&#125;- sẽ tạo mã BG-2026-001
            </p>
            {errors.quotePrefix && (
              <p className="text-xs text-destructive">{errors.quotePrefix.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Giá trị mặc định</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>VAT (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                {...register("defaultVatPercent", { valueAsNumber: true })}
              />
              {errors.defaultVatPercent && (
                <p className="text-xs text-destructive">{errors.defaultVatPercent.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Hiệu lực (ngày)</Label>
              <Input
                type="number"
                min={1}
                {...register("defaultValidityDays", { valueAsNumber: true })}
              />
              {errors.defaultValidityDays && (
                <p className="text-xs text-destructive">{errors.defaultValidityDays.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Phí vận chuyển (VNĐ)</Label>
              <Input
                type="number"
                min={0}
                step={1000}
                {...register("defaultShipping", { valueAsNumber: true })}
              />
              {errors.defaultShipping && (
                <p className="text-xs text-destructive">{errors.defaultShipping.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Lưu giá trị mặc định
      </Button>
    </form>
  );
}
