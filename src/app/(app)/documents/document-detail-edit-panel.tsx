"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Plus, Trash2, Save, Printer, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  updateDocumentAction,
  deleteDocumentAction,
  duplicateDocumentAction,
} from "@/actions/document.actions";
import { formatCurrency } from "@/lib/utils/document-helpers";
import { getExtraFormFields } from "@/lib/pdf/template-registry";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentData, DocumentDataItem } from "@/lib/types/document-data";
import type { ProductWithRelations } from "@/services/product.service";
import type { CustomerRow } from "@/services/customer.service";
import type { CompanyRow } from "@/services/company.service";
import type { DocumentTypeRow } from "@/services/document-type.service";

/** Compact labeled field — label always visible above input */
function LabeledField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-0.5 block text-[10px] font-medium text-slate-400">
        {label}
      </span>
      {children}
    </div>
  );
}

interface Props {
  doc: DocumentRow;
  products: ProductWithRelations[];
  customers: CustomerRow[];
  companies: CompanyRow[];
  documentTypes: DocumentTypeRow[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: (id: string) => void;
}

export function DocumentDetailEditPanel({
  doc,
  products,
  customers,
  companies,
  documentTypes,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const router = useRouter();
  const existingData = doc.data as DocumentData;

  // Resolve template for extra fields
  const selectedType = useMemo(
    () => documentTypes.find((t) => t.id === doc.typeId),
    [documentTypes, doc.typeId],
  );
  const templateId = (selectedType as Record<string, unknown> | undefined)
    ?.templateId as string | null | undefined;
  const templateExtraFields = useMemo(
    () => getExtraFormFields(templateId),
    [templateId],
  );

  const [isPending, setIsPending] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [companyId, setCompanyId] = useState(doc.companyId ?? "");
  const [customerId, setCustomerId] = useState(doc.customerId ?? "");
  const [customerName, setCustomerName] = useState(
    existingData?.customerName ?? "",
  );
  const [customerAddress, setCustomerAddress] = useState(
    existingData?.customerAddress ?? "",
  );
  const [receiverName, setReceiverName] = useState(
    existingData?.receiverName ?? "",
  );
  const [receiverPhone, setReceiverPhone] = useState(
    existingData?.receiverPhone ?? "",
  );
  const [documentDate, setDocumentDate] = useState(
    existingData?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [extraFields, setExtraFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (existingData?.deliveryName)
      init.deliveryName = existingData.deliveryName;
    if (existingData?.deliveryAddress)
      init.deliveryAddress = existingData.deliveryAddress;
    if (existingData?.driverName) init.driverName = existingData.driverName;
    if (existingData?.vehicleId) init.vehicleId = existingData.vehicleId;
    return init;
  });
  const [notes, setNotes] = useState(existingData?.notes ?? "");
  const [items, setItems] = useState<DocumentDataItem[]>(
    existingData?.items?.length
      ? existingData.items
      : [{ productName: "", quantity: 1, unitPrice: 0, amount: 0 }],
  );

  // Mark form as dirty on any change
  function markDirty() {
    if (!isDirty) setIsDirty(true);
  }

  const extraFieldKeys = useMemo(
    () => new Set(templateExtraFields.map((f) => f.key)),
    [templateExtraFields],
  );
  const hasExtraField = (key: string) => extraFieldKeys.has(key);
  const hasAnyDeliveryField =
    hasExtraField("deliveryName") || hasExtraField("deliveryAddress");

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === companyId) ?? null,
    [companies, companyId],
  );

  const total = useMemo(
    () =>
      items.reduce((s, it) => s + (it.quantity ?? 0) * (it.unitPrice ?? 0), 0),
    [items],
  );

  function handleCustomerSelect(id: string) {
    const c = customers.find((c) => c.id === id);
    if (!c) return;
    markDirty();
    setCustomerId(id);
    setCustomerName(c.name);
    setCustomerAddress(c.address ?? "");
    setReceiverName(c.receiverName ?? "");
    setReceiverPhone(c.receiverPhone ?? "");
    // Auto-fill delivery info from customer
    setExtraFields((prev) => ({
      ...prev,
      ...(c.deliveryName ? { deliveryName: c.deliveryName } : {}),
      ...(c.deliveryAddress ? { deliveryAddress: c.deliveryAddress } : {}),
    }));
  }

  function handleCompanyChange(id: string) {
    markDirty();
    setCompanyId(id);
    const company = companies.find((c) => c.id === id);
    if (!company) return;
    setExtraFields((prev) => ({
      ...prev,
      ...(company.driverName ? { driverName: company.driverName } : {}),
      ...(company.vehicleId ? { vehicleId: company.vehicleId } : {}),
    }));
  }

  function handleProductSelect(index: number, productId: string) {
    const p = products.find((p) => p.id === productId);
    if (!p) return;
    updateItem(index, {
      productId: p.id,
      productName: p.name,
      specification: p.specification ?? undefined,
      unit: p.unitName ?? undefined,
      unitPrice: Number(p.unitPrice) || 0,
      quantity: items[index].quantity ?? 1,
      amount: (items[index].quantity ?? 1) * (Number(p.unitPrice) || 0),
    });
  }

  function updateItem(index: number, patch: Partial<DocumentDataItem>) {
    markDirty();
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const updated = { ...it, ...patch };
        updated.amount = (updated.quantity ?? 0) * (updated.unitPrice ?? 0);
        return updated;
      }),
    );
  }

  function addItem() {
    markDirty();
    setItems((prev) => [
      ...prev,
      { productName: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    markDirty();
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setIsPending(true);
    const payload = {
      companyId,
      typeId: doc.typeId,
      type: doc.type,
      date: documentDate || undefined,
      customerId: customerId || undefined,
      customerName,
      customerAddress,
      receiverName,
      receiverPhone,
      items: items.map((it) => ({
        ...it,
        amount: (it.quantity ?? 0) * (it.unitPrice ?? 0),
      })),
      notes,
      ...(extraFields.deliveryName
        ? { deliveryName: extraFields.deliveryName }
        : {}),
      ...(extraFields.deliveryAddress
        ? { deliveryAddress: extraFields.deliveryAddress }
        : {}),
      ...(extraFields.driverName ? { driverName: extraFields.driverName } : {}),
      ...(extraFields.vehicleId ? { vehicleId: extraFields.vehicleId } : {}),
    };

    const result = await updateDocumentAction(doc.id, payload);
    setIsPending(false);

    if (result.success) {
      toast.success("Đã lưu");
      setIsDirty(false);
      onSaved();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    const result = await deleteDocumentAction(doc.id);
    if (result.success) {
      toast.success("Đã xóa");
      onDeleted(doc.id);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDuplicate() {
    const result = await duplicateDocumentAction(doc.id);
    if (result.success) {
      toast.success("Đã nhân bản");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Header — all actions */}
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <Button
          onClick={handleSave}
          disabled={isPending || !isDirty}
          size="sm"
          variant={isDirty ? "default" : "outline"}
          className={cn(
            "h-7 min-w-0 flex-1 gap-1 rounded-lg text-xs transition-all",
            isDirty
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "text-slate-400",
          )}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {isPending ? "Lưu..." : isDirty ? "Lưu" : "Đã lưu"}
        </Button>
        <Button asChild size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs">
          <Link href={`/documents/${doc.id}`}>
            <Printer className="h-3 w-3" />
            In
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleDuplicate}
        >
          <Copy className="h-3 w-3" />
          Sao
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
          Xóa
        </Button>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3" onChangeCapture={markDirty}>
        {/* Group 1 — Công ty */}
        <fieldset className="mb-3">
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Công ty
          </legend>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <LabeledField label="Tên công ty" className="min-w-0 flex-1">
                <Select value={companyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LabeledField>
              <LabeledField label="Mã số thuế" className="w-32 shrink-0">
                <Input
                  value={selectedCompany?.taxCode ?? ""}
                  readOnly
                  className="h-8 bg-slate-50 text-xs text-slate-500"
                />
              </LabeledField>
            </div>
            <LabeledField label="Địa chỉ">
              <Input
                value={selectedCompany?.address ?? ""}
                readOnly
                className="h-8 bg-slate-50 text-xs text-slate-500"
              />
            </LabeledField>
          </div>
        </fieldset>

        <Separator className="my-3" />

        {/* Group 2 — Khách hàng */}
        <fieldset className="mb-3">
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Khách hàng
          </legend>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <LabeledField label="Tên khách hàng" className="min-w-0 flex-1">
                <Select value={customerId} onValueChange={handleCustomerSelect}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LabeledField>
              <LabeledField label="Ngày chứng từ" className="w-36 shrink-0">
                <DatePicker
                  value={documentDate}
                  onChange={setDocumentDate}
                  className="h-8 text-xs"
                />
              </LabeledField>
            </div>
            <LabeledField label="Địa chỉ">
              <Input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="h-8 text-xs"
              />
            </LabeledField>
            {(hasExtraField("driverName") || hasExtraField("vehicleId")) && (
              <div className="flex gap-2">
                {hasExtraField("driverName") && (
                  <LabeledField label="Tài xế" className="min-w-0 flex-1">
                    <Input
                      value={extraFields.driverName ?? ""}
                      onChange={(e) =>
                        setExtraFields((prev) => ({
                          ...prev,
                          driverName: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </LabeledField>
                )}
                {hasExtraField("vehicleId") && (
                  <LabeledField label="Số xe" className="w-28 shrink-0">
                    <Input
                      value={extraFields.vehicleId ?? ""}
                      onChange={(e) =>
                        setExtraFields((prev) => ({
                          ...prev,
                          vehicleId: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </LabeledField>
                )}
              </div>
            )}
          </div>
        </fieldset>

        {hasAnyDeliveryField && (
          <>
            <Separator className="my-3" />

            {/* Group 3 — Nơi giao (only for templates with delivery fields) */}
            <fieldset className="mb-3">
              <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Nơi giao
              </legend>
              <div className="space-y-1.5">
                {hasExtraField("deliveryName") && (
                  <LabeledField label="Tên nơi giao">
                    <Input
                      value={extraFields.deliveryName ?? ""}
                      onChange={(e) =>
                        setExtraFields((prev) => ({
                          ...prev,
                          deliveryName: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </LabeledField>
                )}
                {hasExtraField("deliveryAddress") && (
                  <LabeledField label="Địa chỉ">
                    <Input
                      value={extraFields.deliveryAddress ?? ""}
                      onChange={(e) =>
                        setExtraFields((prev) => ({
                          ...prev,
                          deliveryAddress: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </LabeledField>
                )}
                <div className="flex gap-2">
                  <LabeledField label="Người nhận" className="min-w-0 flex-1">
                    <Input
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </LabeledField>
                  <LabeledField label="SĐT" className="w-28 shrink-0">
                    <Input
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </LabeledField>
                </div>
              </div>
            </fieldset>
          </>
        )}

        <Separator className="my-3" />

        {/* Items */}
        <div>
          <div className="mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Sản phẩm ({items.length})
            </span>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <div className="min-w-0 flex-1">
                    <Select
                      value={item.productId ?? ""}
                      onValueChange={(v) => handleProductSelect(i, v)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Chọn sản phẩm..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="shrink-0 cursor-pointer text-slate-300 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {(item.specification || item.unit) && (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {[item.specification, item.unit]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <LabeledField label="SL" className="w-16">
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity ?? 0}
                      onChange={(e) =>
                        updateItem(i, { quantity: Number(e.target.value) || 0 })
                      }
                      className="h-7 text-xs"
                    />
                  </LabeledField>
                  <span className="mt-3.5 text-[10px] text-slate-300">×</span>
                  <LabeledField label="Đơn giá" className="flex-1">
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice ?? 0}
                      onChange={(e) =>
                        updateItem(i, {
                          unitPrice: Number(e.target.value) || 0,
                        })
                      }
                      className="h-7 text-xs"
                    />
                  </LabeledField>
                  <div className="mt-3.5 shrink-0 text-right">
                    <span className="text-xs font-semibold text-slate-700">
                      {formatCurrency(
                        (item.quantity ?? 0) * (item.unitPrice ?? 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {/* Add item — dashed card */}
            <button
              onClick={addItem}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 py-2.5 text-[11px] font-medium text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
            >
              <Plus className="h-3 w-3" />
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="mt-2 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2">
          <span className="text-[11px] font-medium text-indigo-600">
            Tổng cộng
          </span>
          <span className="text-[13px] font-bold text-indigo-700">
            {formatCurrency(total)}
          </span>
        </div>

        <Separator className="my-3" />

        {/* Notes */}
        <LabeledField label="Ghi chú">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </LabeledField>
      </div>

    </div>
  );
}
