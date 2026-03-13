"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  quoteTemplateSchema,
  type QuoteTemplateFormData,
} from "@/lib/validations/settings-schemas";
import { updateQuoteTemplate } from "@/app/(dashboard)/settings/actions";
import type { Tenant } from "@/db/schema";

type Props = { settings: Tenant };

export function QuoteTemplateForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, watch } = useForm<QuoteTemplateFormData>({
    resolver: zodResolver(quoteTemplateSchema),
    defaultValues: {
      primaryColor: settings.primaryColor,
      greetingText: settings.greetingText,
      defaultTerms: settings.defaultTerms,
      showAmountInWords: settings.showAmountInWords,
      showBankInfo: settings.showBankInfo,
      showSignatureBlocks: settings.showSignatureBlocks,
      showFooterNote: settings.showFooterNote,
      footerNote: settings.footerNote,
    },
  });

  function onSubmit(data: QuoteTemplateFormData) {
    startTransition(async () => {
      const result = await updateQuoteTemplate(data);
      if (!result.ok) toast.error(result.error);
      else toast.success("Đã lưu mẫu báo giá");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Giao diện</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Màu chính</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                className="h-10 w-14 cursor-pointer p-1"
                {...register("primaryColor")}
              />
              <Input className="w-32" {...register("primaryColor")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nội dung</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Lời chào</Label>
            <Textarea rows={3} {...register("greetingText")} />
          </div>
          <div className="space-y-1">
            <Label>Điều khoản mặc định</Label>
            <Textarea rows={5} {...register("defaultTerms")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hiển thị</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <CheckboxField
            label="Hiển thị số tiền bằng chữ"
            checked={watch("showAmountInWords")}
            onCheckedChange={(v) => setValue("showAmountInWords", v)}
          />
          <CheckboxField
            label="Hiển thị thông tin ngân hàng"
            checked={watch("showBankInfo")}
            onCheckedChange={(v) => setValue("showBankInfo", v)}
          />
          <CheckboxField
            label="Hiển thị ô chữ ký"
            checked={watch("showSignatureBlocks")}
            onCheckedChange={(v) => setValue("showSignatureBlocks", v)}
          />
          <CheckboxField
            label="Hiển thị ghi chú cuối trang"
            checked={watch("showFooterNote")}
            onCheckedChange={(v) => setValue("showFooterNote", v)}
          />
          {watch("showFooterNote") && (
            <div className="ml-7 space-y-1">
              <Label>Ghi chú cuối trang</Label>
              <Textarea rows={2} {...register("footerNote")} />
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Lưu mẫu báo giá
      </Button>
    </form>
  );
}

function CheckboxField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span className="text-sm">{label}</span>
    </label>
  );
}
