"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/validations/quote-schemas";
import { saveQuote } from "@/app/(dashboard)/quotes/actions";
import { QuoteCustomerSection } from "./quote-customer-section";
import { QuoteItemsTable } from "./quote-items-table";
import { QuoteSummarySection } from "./quote-summary-section";
import { QuotePreview, type CompanyInfo } from "./quote-preview";

type Defaults = {
  vatPercent: number;
  shippingFee: number;
  terms: string;
  validUntil: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExistingQuote = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomerData = any;

type Props = {
  defaults: Defaults;
  existingQuote?: ExistingQuote;
  customer?: CustomerData | null;
  company?: CompanyInfo | null;
};

function buildDefaults(defaults: Defaults, quote?: ExistingQuote, customer?: CustomerData | null): QuoteFormValues {
  if (quote) {
    return {
      customerId: quote.customerId ?? null,
      customerName: quote.customerName ?? "",
      customerCompany: quote.customerCompany ?? "",
      customerPhone: quote.customerPhone ?? "",
      customerEmail: quote.customerEmail ?? "",
      customerAddress: quote.customerAddress ?? "",
      items: (quote.items ?? []).map((item: ExistingQuote, i: number) => ({
        productId: item.productId ?? null,
        name: item.name ?? "",
        description: item.description ?? "",
        unit: item.unit ?? "",
        quantity: item.quantity ?? 1,
        unitPrice: Number(item.unitPrice) || 0,
        discountPercent: Number(item.discountPercent) || 0,
        isCustomItem: item.isCustomItem ?? false,
        sortOrder: item.sortOrder ?? i,
      })),
      globalDiscountPercent: Number(quote.globalDiscountPercent) || 0,
      vatPercent: Number(quote.vatPercent) || defaults.vatPercent,
      shippingFee: Number(quote.shippingFee) || 0,
      otherFees: Number(quote.otherFees) || 0,
      otherFeesLabel: quote.otherFeesLabel ?? "",
      notes: quote.notes ?? "",
      terms: quote.terms ?? defaults.terms,
      validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split("T")[0] : defaults.validUntil,
    };
  }

  return {
    customerId: customer?.id ?? null,
    customerName: customer?.name ?? "",
    customerCompany: customer?.company ?? "",
    customerPhone: customer?.phone ?? "",
    customerEmail: customer?.email ?? "",
    customerAddress: customer?.address ?? "",
    items: [],
    globalDiscountPercent: 0,
    vatPercent: defaults.vatPercent,
    shippingFee: defaults.shippingFee,
    otherFees: 0,
    otherFeesLabel: "",
    notes: "",
    terms: defaults.terms,
    validUntil: defaults.validUntil,
  };
}

export function QuoteBuilderPage({ defaults, existingQuote, customer, company }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const quoteId = existingQuote?.id;

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: buildDefaults(defaults, existingQuote, customer),
  });

  const { control, register, watch, setValue, handleSubmit, formState: { errors } } = form;
  const fieldArray = useFieldArray({ control, name: "items" });

  function onSubmit(data: QuoteFormValues) {
    startTransition(async () => {
      const result = await saveQuote(data, quoteId);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success(quoteId ? "Đã cập nhật báo giá" : "Đã tạo báo giá");
        if (!quoteId && result.value?.id) {
          router.push(`/quotes/${result.value.id}`);
        }
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {quoteId ? `Sửa báo giá #${existingQuote?.quoteNumber}` : "Tạo báo giá mới"}
        </h1>
        {/* Mobile tab toggle */}
        <div className="flex gap-1 md:hidden">
          <Button size="sm" variant={mobileTab === "form" ? "default" : "outline"} onClick={() => setMobileTab("form")}>
            Nhập liệu
          </Button>
          <Button size="sm" variant={mobileTab === "preview" ? "default" : "outline"} onClick={() => setMobileTab("preview")}>
            Xem trước
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={mobileTab === "preview" ? "hidden md:block" : ""}>
          <div className="space-y-6">
            <QuoteCustomerSection register={register} watch={watch} setValue={setValue} errors={errors} />

            <QuoteItemsTable fieldArray={fieldArray} register={register} watch={watch} setValue={setValue} errors={errors} />

            <QuoteSummarySection register={register} watch={watch} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/quotes")}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                {quoteId ? "Cập nhật" : "Lưu nháp"}
              </Button>
            </div>
          </div>
        </div>

        {mobileTab === "preview" && (
          <div className="md:hidden overflow-x-auto">
            <QuotePreview
              data={{
                quoteNumber: existingQuote?.quoteNumber,
                createdAt: existingQuote?.createdAt,
                customerName: watch("customerName"),
                customerCompany: watch("customerCompany"),
                customerPhone: watch("customerPhone"),
                customerEmail: watch("customerEmail"),
                customerAddress: watch("customerAddress"),
                items: watch("items"),
                globalDiscountPercent: watch("globalDiscountPercent"),
                vatPercent: watch("vatPercent"),
                shippingFee: watch("shippingFee"),
                otherFees: watch("otherFees"),
                otherFeesLabel: watch("otherFeesLabel"),
                terms: watch("terms"),
                validUntil: watch("validUntil") ?? "",
              }}
              company={company}
            />
          </div>
        )}
      </form>
    </div>
  );
}
