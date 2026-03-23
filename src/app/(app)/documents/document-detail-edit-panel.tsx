"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Plus, Trash2, Save, Eye, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
  createDocumentAction,
  updateDocumentAction,
} from "@/actions/document.actions";
import {
  formatCurrency,
  mapCustomDataToColumnKeys,
} from "@/lib/utils/document-helpers";
import {
  getExtraFormFields,
  getTemplateEntry,
  getTemplateList,
} from "@/lib/pdf/template-registry";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentData, DocumentDataItem } from "@/lib/types/document-data";
import type { ProductWithRelations } from "@/services/product.service";
import type { CustomerRow } from "@/services/customer.service";
import type { CompanyRow } from "@/services/company.service";
import { LabeledField } from "@/components/shared/labeled-field";
import { DocumentPdfDownloadButton } from "@/components/documents/document-pdf-download-button";

const templateList = getTemplateList();

interface Props {
  doc?: DocumentRow;
  products: ProductWithRelations[];
  customers: CustomerRow[];
  companies: CompanyRow[];
  onClose: () => void;
  onSaved: () => void;
}

export function DocumentDetailEditPanel({
  doc,
  products,
  customers,
  companies,
  onClose,
  onSaved,
}: Props) {
  const router = useRouter();
  const isCreate = !doc;
  const existingData = doc?.data as DocumentData | undefined;

  // Template state — editable on create, fixed on edit
  const [templateId, setTemplateId] = useState(
    doc?.templateId ?? templateList[0]?.id ?? "quotation",
  );
  const template = useMemo(() => getTemplateEntry(templateId), [templateId]);
  const templateExtraFields = useMemo(
    () => getExtraFormFields(templateId),
    [templateId],
  );

  const [isPending, setIsPending] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [companyId, setCompanyId] = useState(
    doc?.companyId ?? companies[0]?.id ?? "",
  );
  const [customerId, setCustomerId] = useState(doc?.customerId ?? "");
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
    const init: Record<string, string> = {
      ...(existingData?.templateFields ?? {}),
    };
    if (isCreate) {
      const defaultCompany = companies[0];
      if (defaultCompany?.driverName && !init.driverName)
        init.driverName = defaultCompany.driverName;
      if (defaultCompany?.vehicleId && !init.vehicleId)
        init.vehicleId = defaultCompany.vehicleId;
    }
    return init;
  });
  const [notes, setNotes] = useState(existingData?.notes ?? "");
  const [items, setItems] = useState<DocumentDataItem[]>(
    existingData?.items?.length
      ? existingData.items
      : [{ productName: "", quantity: 1, unitPrice: 0, amount: 0 }],
  );

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

  // Columns that need editable inputs in item cards
  // Skip: stt (auto), productName (selector), quantity/unitPrice (dedicated), amount (computed)
  const SKIP_ITEM_KEYS = new Set([
    "stt",
    "productName",
    "quantity",
    "unitPrice",
    "amount",
  ]);
  const editableColumns = useMemo(
    () => (template?.columns ?? []).filter((c) => !SKIP_ITEM_KEYS.has(c.key)),
    [template],
  );

  // Standard fields that map directly to DocumentDataItem properties
  const STANDARD_ITEM_KEYS = new Set(["specification", "unit", "note"]);

  function getItemColumnValue(
    item: DocumentDataItem,
    key: string,
  ): string | number {
    if (key === "specification") return item.specification ?? "";
    if (key === "unit") return item.unit ?? "";
    if (key === "note") return item.note ?? "";
    return item.customFields?.[key] ?? "";
  }

  function updateItemColumn(index: number, key: string, value: string) {
    if (STANDARD_ITEM_KEYS.has(key)) {
      updateItem(index, { [key]: value });
    } else {
      const item = items[index];
      updateItem(index, {
        customFields: { ...item.customFields, [key]: value },
      });
    }
  }

  function handleCustomerSelect(id: string) {
    const c = customers.find((c) => c.id === id);
    if (!c) return;
    markDirty();
    setCustomerId(id);
    setCustomerName(c.name);
    setCustomerAddress(c.address ?? "");
    setReceiverName(c.receiverName ?? "");
    setReceiverPhone(c.receiverPhone ?? "");
    setExtraFields((prev) => ({
      ...prev,
      ...(c.deliveryName ? { deliveryName: c.deliveryName } : {}),
      ...(c.deliveryAddress ? { deliveryAddress: c.deliveryAddress } : {}),
      ...(c.customData
        ? Object.fromEntries(
            Object.entries(c.customData).map(([k, v]) => [k, String(v)]),
          )
        : {}),
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
      ...(company.customData
        ? Object.fromEntries(
            Object.entries(company.customData).map(([k, v]) => [k, String(v)]),
          )
        : {}),
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
      ...(p.customData
        ? {
            customFields: {
              ...items[index].customFields,
              ...mapCustomDataToColumnKeys(
                p.customData,
                template?.columns ?? [],
              ),
            },
          }
        : {}),
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
      templateId,
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
      ...(Object.keys(extraFields).length > 0
        ? { templateFields: extraFields }
        : {}),
    };

    const result = isCreate
      ? await createDocumentAction(payload)
      : await updateDocumentAction(doc.id, payload);
    setIsPending(false);

    if (result.success) {
      toast.success(isCreate ? "Đã tạo" : "Đã lưu");
      setIsDirty(false);
      onSaved();
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
          disabled={isPending || (!isCreate && !isDirty)}
          size="sm"
          variant={isCreate || isDirty ? "default" : "outline"}
          className={cn(
            "h-7 min-w-0 flex-1 gap-1 rounded-lg text-xs transition-all",
            isCreate || isDirty
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "text-slate-400",
          )}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {isPending ? "Lưu..." : isCreate ? "Tạo" : isDirty ? "Lưu" : "Đã lưu"}
        </Button>
        {!isCreate && (
          <>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs"
              title="Mở trang xem trước PDF"
            >
              <Link href={`/documents/${doc.id}`} target="_blank">
                <Eye className="h-3 w-3" />
                Xem trước
              </Link>
            </Button>
            <DocumentPdfDownloadButton
              document={doc}
              company={{
                name: selectedCompany?.name ?? "",
                address: selectedCompany?.address,
                phone: selectedCompany?.phone,
                taxCode: selectedCompany?.taxCode,
                logoUrl: selectedCompany?.logoUrl,
                headerLayout: selectedCompany?.headerLayout,
              }}
              columns={template?.columns ?? []}
              showTotal={template?.showTotal ?? false}
              title={template?.name ?? "Tài liệu"}
              signatureLabels={template?.signatureLabels ?? []}
              templateId={templateId}
              size="panel"
            />
          </>
        )}
        <button
          onClick={onClose}
          className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title="Đóng"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editable content */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        onChangeCapture={markDirty}
      >
        {/* Template selector — only on create */}
        {isCreate && (
          <fieldset className="mb-3">
            <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Loại tài liệu
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {templateList.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTemplateId(t.id);
                    markDirty();
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                    templateId === t.id
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block rounded px-1 py-0.5 text-[10px] font-bold",
                      t.color.badgeBg,
                      t.color.badgeText,
                    )}
                  >
                    {t.shortLabel}
                  </span>
                  {t.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {isCreate && <Separator className="my-3" />}

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
              <LabeledField label="Mã số thuế" className="w-28">
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
              <LabeledField label="Ngày chứng từ" className="w-32">
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
                  <LabeledField label="Số xe" className="w-24">
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

            {/* Group 3 — Nơi giao */}
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
                  <LabeledField label="SĐT" className="w-24">
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

                {/* Template-driven editable fields (all columns shown in PDF) */}
                {editableColumns.length > 0 && (
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {editableColumns.map((col) => {
                      const val = getItemColumnValue(item, col.key);
                      return (
                        <LabeledField key={col.key} label={col.label}>
                          <Input
                            type={
                              col.type === "number" || col.type === "currency"
                                ? "number"
                                : "text"
                            }
                            value={val ?? ""}
                            onChange={(e) =>
                              updateItemColumn(i, col.key, e.target.value)
                            }
                            className="h-7 text-xs"
                          />
                        </LabeledField>
                      );
                    })}
                  </div>
                )}
                {/* Số lượng × Đơn giá */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <LabeledField label="Số lượng" className="w-14">
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
                  <span className="mt-3.5 text-[11px] text-slate-300">×</span>
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
                  <div className="mt-3.5 shrink-0 rounded-md bg-indigo-50/80 px-2 py-0.5 text-right">
                    <span className="text-xs font-bold text-indigo-600">
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
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="text-xs"
          />
        </LabeledField>
      </div>
    </div>
  );
}
