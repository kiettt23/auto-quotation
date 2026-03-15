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
      defaultVatPercent: Number(settings.defaultVatPercent),
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
        <CardHeader><CardTitle>Giá trị mặc định</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="defaultVatPercent">VAT mặc định (%)</Label>
              <Input
                id="defaultVatPercent"
                type="number"
                min={0}
                max={100}
                step={0.5}
                {...register("defaultVatPercent", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Áp dụng cho tất cả tài liệu mới
              </p>
              {errors.defaultVatPercent && (
                <p className="text-xs text-destructive">{errors.defaultVatPercent.message}</p>
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
