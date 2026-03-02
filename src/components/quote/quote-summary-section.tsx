"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format-currency";
import { calculateLineTotal, calculateQuoteTotals } from "@/lib/pricing-engine";
import type { UseFormRegister, UseFormWatch } from "react-hook-form";
import type { QuoteFormValues } from "@/lib/validations/quote-schemas";

type Props = {
  register: UseFormRegister<QuoteFormValues>;
  watch: UseFormWatch<QuoteFormValues>;
};

export function QuoteSummarySection({ register, watch }: Props) {
  const items = watch("items") ?? [];
  const globalDiscount = watch("globalDiscountPercent") || 0;
  const vat = watch("vatPercent") || 0;
  const shipping = watch("shippingFee") || 0;
  const other = watch("otherFees") || 0;

  const totals = useMemo(() => {
    const itemInputs = items.map((item) => ({
      unitPrice: item.unitPrice || 0,
      quantity: item.quantity || 0,
      discountPercent: item.discountPercent || 0,
    }));
    return calculateQuoteTotals(itemInputs, globalDiscount, vat, shipping, other);
  }, [items, globalDiscount, vat, shipping, other]);

  return (
    <>
      {/* Summary inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tổng hợp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field>
              <FieldLabel>Chiết khấu chung (%)</FieldLabel>
              <Input type="number" min={0} max={100} step={0.1} {...register("globalDiscountPercent", { valueAsNumber: true })} />
            </Field>
            <Field>
              <FieldLabel>VAT (%)</FieldLabel>
              <Input type="number" min={0} max={100} step={0.1} {...register("vatPercent", { valueAsNumber: true })} />
            </Field>
            <Field>
              <FieldLabel>Phí vận chuyển</FieldLabel>
              <Input type="number" min={0} {...register("shippingFee", { valueAsNumber: true })} />
            </Field>
            <Field>
              <FieldLabel>Phí khác</FieldLabel>
              <Input type="number" min={0} {...register("otherFees", { valueAsNumber: true })} />
              <Input className="mt-1" placeholder="Ghi chú phí khác..." {...register("otherFeesLabel")} />
            </Field>
          </div>

          <Separator className="my-4" />

          {/* Totals display */}
          <div className="space-y-2 max-w-xs ml-auto">
            <TotalRow label="Tạm tính" value={totals.subtotal} />
            {globalDiscount > 0 && (
              <TotalRow label={`Chiết khấu (${globalDiscount}%)`} value={-totals.discountAmount} />
            )}
            {vat > 0 && (
              <TotalRow label={`VAT (${vat}%)`} value={totals.vatAmount} />
            )}
            {shipping > 0 && <TotalRow label="Phí vận chuyển" value={shipping} />}
            {other > 0 && <TotalRow label={watch("otherFeesLabel") || "Phí khác"} value={other} />}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">TỔNG CỘNG</span>
              <span className="text-xl font-bold tabular-nums">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & notes */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Field>
            <FieldLabel>Điều khoản</FieldLabel>
            <Textarea rows={4} {...register("terms")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Ghi chú nội bộ</FieldLabel>
              <Textarea rows={2} {...register("notes")} />
            </Field>
            <Field>
              <FieldLabel>Hiệu lực đến</FieldLabel>
              <Input type="date" {...register("validUntil")} />
            </Field>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}
