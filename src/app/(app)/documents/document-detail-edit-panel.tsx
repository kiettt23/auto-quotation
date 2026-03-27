"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Plus, Trash2, Save, Eye, Loader2, FilePlus2 } from "lucide-react";
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
  const [deliveryCustomerId, setDeliveryCustomerId] = useState(
    (existingData?.templateFields?.deliveryCustomerId as string) ?? "",
  );
  const [notes, setNotes] = useState(existingData?.notes ?? "");
  const [docNumberSuffix, setDocNumberSuffix] = useState("");
  const isManualNumber = template?.numberMode === "manual";
  const [items, setItems] = useState<DocumentDataItem[]>(() => {
    if (existingData?.items?.length) return existingData.items;
    const entry = getTemplateEntry(templateId);
    if (entry?.hasItems === false) return [];
    if (entry?.defaultItems?.length) return structuredClone(entry.defaultItems);
    return [{ productName: "", quantity: 1, unitPrice: 0, amount: 0 }];
  });

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
  const showProductSelector = template?.showProductSelector !== false;
  const hasItems = template?.hasItems !== false;
  /* Hide productName input when template has a 'label' column (avoids duplication) */
  const hasLabelColumn = (template?.columns ?? []).some((c) => c.key === "label");
  // Extra fields not handled by dedicated sections (delivery, driver, vehicle)
  /* Keys that belong to customer section instead of "Thông tin chứng từ" */
  const CUSTOMER_EXTRA_KEYS = new Set([
    "representative", "position", "phone", "email", "taxCode",
    "installAddress", "invoiceAddress", "fax",
  ]);
  const genericExtraFields = useMemo(() => {
    const dedicated = new Set(["deliveryName", "deliveryAddress", "driverName", "vehicleId"]);
    const autoSynced = new Set(hasExtraField("servicePrice") && hasItems ? ["servicePrice"] : []);
    return templateExtraFields.filter(
      (f) => !dedicated.has(f.key) && !autoSynced.has(f.key) && !CUSTOMER_EXTRA_KEYS.has(f.key)
    );
  }, [templateExtraFields]); // eslint-disable-line react-hooks/exhaustive-deps
  const customerExtraFields = useMemo(() => {
    return templateExtraFields.filter((f) => CUSTOMER_EXTRA_KEYS.has(f.key));
  }, [templateExtraFields]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === companyId) ?? null,
    [companies, companyId],
  );

  // Columns that need editable inputs in item cards
  // Only skip quantity/unitPrice/amount when template has unitPrice (e.g. quotation)
  const hasUnitPrice = useMemo(
    () => (template?.columns ?? []).some((c) => c.key === "unitPrice"),
    [template],
  );

  const total = useMemo(
    () =>
      items.reduce((s, it) => {
        if (hasUnitPrice) return s + (it.quantity ?? 0) * (it.unitPrice ?? 0);
        const cfAmt = it.customFields?.amount ? Number(it.customFields.amount) : 0;
        return s + (cfAmt || it.amount || 0);
      }, 0),
    [items, hasUnitPrice],
  );

  /* Auto-sync servicePrice extraField from items total (PLHD template) */
  useEffect(() => {
    if (!hasExtraField("servicePrice") || total === 0) return;
    const formatted = new Intl.NumberFormat("vi-VN").format(total);
    setExtraFields((prev) => {
      if (prev.servicePrice === formatted) return prev;
      return { ...prev, servicePrice: formatted };
    });
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps
  const skipItemKeys = useMemo(() => {
    const keys = new Set(["stt", "productName"]);
    if (hasUnitPrice) {
      keys.add("quantity");
      keys.add("unitPrice");
      keys.add("amount");
    }
    return keys;
  }, [hasUnitPrice]);
  const editableColumns = useMemo(
    () => (template?.columns ?? []).filter((c) => !skipItemKeys.has(c.key)),
    [template, skipItemKeys],
  );

  // Standard fields that map directly to DocumentDataItem properties
  const STANDARD_ITEM_KEYS = new Set(["specification", "unit", "quantity", "unitPrice", "note"]);

  function getItemColumnValue(
    item: DocumentDataItem,
    key: string,
  ): string | number {
    if (key === "specification") return item.specification ?? "";
    if (key === "unit") return item.unit ?? "";
    if (key === "quantity") return item.quantity ?? 0;
    if (key === "unitPrice") return item.unitPrice ?? 0;
    if (key === "note") return item.note ?? "";
    return item.customFields?.[key] ?? "";
  }

  function updateItemColumn(index: number, key: string, value: string) {
    if (STANDARD_ITEM_KEYS.has(key)) {
      const parsed = (key === "quantity" || key === "unitPrice") ? Number(value) || 0 : value;
      updateItem(index, { [key]: parsed });
    } else {
      const item = items[index];
      const patch: Partial<DocumentDataItem> = {
        customFields: { ...item.customFields, [key]: value },
      };
      /* Sync label → productName so PDF template can use either */
      if (key === "label") patch.productName = value;
      updateItem(index, patch);
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
      // Spread built-in customer fields for template autofill
      ...(c.phone ? { phone: c.phone } : {}),
      ...(c.email ? { email: c.email } : {}),
      ...(c.taxCode ? { taxCode: c.taxCode } : {}),
      ...(c.installAddress ? { installAddress: c.installAddress } : {}),
      ...(c.invoiceAddress ? { invoiceAddress: c.invoiceAddress } : {}),
      ...(c.customData
        ? Object.fromEntries(
            Object.entries(c.customData).map(([k, v]) => [k, String(v)]),
          )
        : {}),
    }));
  }

  function handleDeliveryCustomerSelect(id: string) {
    const c = customers.find((c) => c.id === id);
    if (!c) return;
    markDirty();
    setDeliveryCustomerId(id);
    setExtraFields((prev) => ({
      ...prev,
      deliveryName: c.name,
      deliveryAddress: c.address ?? "",
      deliveryCustomerId: id,
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
      showProductSelector
        ? { productName: "", quantity: 1, unitPrice: 0, amount: 0 }
        : { productName: "" },
    ]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    markDirty();
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  /** Create a DNTT document pre-filled from the current PLHD templateFields */
  async function handleCreateDntt() {
    setIsPending(true);
    const result = await createDocumentAction({
      companyId,
      templateId: "payment-request",
      date: documentDate || undefined,
      customerId: customerId || undefined,
      customerName,
      customerAddress,
      templateFields: extraFields,
      items: [],
    });
    setIsPending(false);
    if (result.success) {
      toast.success("Đã tạo DNTT từ PLHD");
      onSaved();
    } else {
      toast.error(result.error);
    }
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
      ...(isManualNumber && docNumberSuffix ? { documentNumberSuffix: docNumberSuffix } : {}),
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
                driverName: selectedCompany?.driverName,
                vehicleId: selectedCompany?.vehicleId,
                representative: selectedCompany?.representative,
                position: selectedCompany?.position,
                bankAccount: selectedCompany?.bankAccount,
                bankName: selectedCompany?.bankName,
                customData: selectedCompany?.customData as Record<string, string | number> | null,
              }}
              columns={template?.columns ?? []}
              showTotal={template?.showTotal ?? false}
              title={template?.name ?? "Tài liệu"}
              signatureLabels={template?.signatureLabels ?? []}
              templateId={templateId}
              size="panel"
            />
            {templateId === "contract-appendix" && (
              <Button
                onClick={handleCreateDntt}
                disabled={isPending}
                size="sm"
                variant="outline"
                className="h-7 gap-1 px-2 text-xs"
                title="Tạo Đề nghị thanh toán từ phụ lục này"
              >
                <FilePlus2 className="h-3 w-3" />
                Tạo DNTT
              </Button>
            )}
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
            <legend className="mb-2 text-[13px] font-semibold text-slate-700">
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
          <legend className="mb-2 text-[13px] font-semibold text-slate-700">
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
            {!template?.hideCompanyDetails && (
              <div className="flex gap-2">
                <LabeledField label="Điện thoại" className="min-w-0 flex-1">
                  <Input
                    value={selectedCompany?.phone ?? ""}
                    readOnly
                    className="h-8 bg-slate-50 text-xs text-slate-500"
                  />
                </LabeledField>
                <LabeledField label="Email" className="min-w-0 flex-1">
                  <Input
                    value={selectedCompany?.email ?? ""}
                    readOnly
                    className="h-8 bg-slate-50 text-xs text-slate-500"
                  />
                </LabeledField>
              </div>
            )}
            {!template?.hideBankFields && (
              <div className="flex gap-2">
                <LabeledField label="Số tài khoản" className="min-w-0 flex-1">
                  <Input
                    value={selectedCompany?.bankAccount ?? ""}
                    readOnly
                    className="h-8 bg-slate-50 text-xs text-slate-500"
                  />
                </LabeledField>
                <LabeledField label="Ngân hàng" className="min-w-0 flex-1">
                  <Input
                    value={selectedCompany?.bankName ?? ""}
                    readOnly
                    className="h-8 bg-slate-50 text-xs text-slate-500"
                  />
                </LabeledField>
              </div>
            )}
            {!template?.hideRepresentativeFields && (
              <div className="flex gap-2">
                <LabeledField label="Người đại diện" className="min-w-0 flex-1">
                  <Input
                    value={selectedCompany?.representative ?? ""}
                    readOnly
                    className="h-8 bg-slate-50 text-xs text-slate-500"
                  />
                </LabeledField>
                <LabeledField label="Chức vụ" className="min-w-0 flex-1">
                  <Input
                    value={selectedCompany?.position ?? ""}
                    readOnly
                    className="h-8 bg-slate-50 text-xs text-slate-500"
                  />
                </LabeledField>
              </div>
            )}
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
                  <LabeledField label="Số xe" className="w-28">
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

        <Separator className="my-3" />

        {/* Group 2 — Khách hàng */}
        <fieldset className="mb-3">
          <legend className="mb-2 text-[13px] font-semibold text-slate-700">
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
            {/* Manual document number suffix — only for create + manual mode */}
            {isCreate && isManualNumber && (
              <LabeledField
                label={`Số chứng từ (${template?.numberPrefix ?? ""}-${documentDate.split("-").reverse().map((p, i) => i === 2 ? p.slice(2) : p).join("")}-...)`}
              >
                <Input
                  value={docNumberSuffix}
                  onChange={(e) => { setDocNumberSuffix(e.target.value); markDirty(); }}
                  placeholder="Nhập mã số..."
                  className="h-8 text-xs"
                />
              </LabeledField>
            )}
            {/* Hide generic address when template has installAddress/invoiceAddress */}
            {!hasExtraField("installAddress") && (
              <LabeledField label="Địa chỉ">
                <Input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="h-8 text-xs"
                />
              </LabeledField>
            )}
            {/* Receiver info — belongs to customer (Bên B) */}
            {!template?.hideReceiverFields && (
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
            )}
            {/* Customer-related extra fields (PLHD: representative, phone, address etc.) */}
            {customerExtraFields.length > 0 && (
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {customerExtraFields.map((f) => (
                  <LabeledField key={f.key} label={f.label}>
                    <Input
                      value={extraFields[f.key] ?? ""}
                      onChange={(e) =>
                        setExtraFields((prev) => ({
                          ...prev,
                          [f.key]: e.target.value,
                        }))
                      }
                      onBlur={markDirty}
                      placeholder={f.placeholder}
                      className="h-8 text-xs"
                    />
                  </LabeledField>
                ))}
              </div>
            )}
          </div>
        </fieldset>

        {hasAnyDeliveryField && (
          <>
            <Separator className="my-3" />

            {/* Group 3 — Nơi giao (chọn từ danh sách khách hàng) */}
            <fieldset className="mb-3">
              <legend className="mb-2 text-[13px] font-semibold text-slate-700">
                Nơi giao
              </legend>
              <div className="space-y-1.5">
                <LabeledField label="Nơi giao">
                  <Select value={deliveryCustomerId} onValueChange={handleDeliveryCustomerSelect}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Chọn nơi giao..." />
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
                {deliveryCustomerId && (
                  <LabeledField label="Địa chỉ">
                    <Input
                      value={extraFields.deliveryAddress ?? ""}
                      readOnly
                      className="h-8 bg-slate-50 text-xs text-slate-500"
                    />
                  </LabeledField>
                )}
              </div>
            </fieldset>
          </>
        )}

        {/* Generic extra fields (PLHD, DNTT etc.) */}
        {genericExtraFields.length > 0 && (
          <>
            <Separator className="my-3" />
            <fieldset className="mb-3">
              <legend className="mb-2 text-[13px] font-semibold text-slate-700">
                Thông tin chứng từ
              </legend>
              <div className="grid grid-cols-2 gap-1.5">
                {genericExtraFields.map((f) => (
                  <LabeledField key={f.key} label={f.label}>
                    <Input
                      value={extraFields[f.key] ?? ""}
                      onChange={(e) =>
                        setExtraFields((prev) => ({
                          ...prev,
                          [f.key]: e.target.value,
                        }))
                      }
                      placeholder={f.placeholder}
                      className="h-7 text-xs"
                    />
                  </LabeledField>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {hasItems && <Separator className="my-3" />}

        {/* Items — hidden for letter-type templates (hasItems=false) */}
        {hasItems && <div>
          <div className="mb-2">
            <span className="text-[13px] font-semibold text-slate-700">
              Sản phẩm ({items.length})
            </span>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5"
              >
                {!hasLabelColumn && (
                <div className="flex items-center gap-1.5">
                  <div className="min-w-0 flex-1">
                    {showProductSelector ? (
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
                    ) : (
                    <Input
                      value={item.productName}
                      onChange={(e) => updateItem(i, { productName: e.target.value })}
                      placeholder="Nhập tên dòng..."
                      className="h-7 text-xs"
                    />
                    )}
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
                )}

                {/* Template-driven editable fields (all columns shown in PDF) */}
                {editableColumns.length > 0 && (
                  <div className={`${hasLabelColumn ? "" : "mt-1.5 "}flex items-end gap-1.5`}>
                  <div className={`flex-1 grid gap-1.5 ${editableColumns.length <= 2 ? "grid-cols-2" : "grid-cols-3"}`}>
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
                            step={
                              col.type === "number" || col.type === "currency"
                                ? "any"
                                : undefined
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
                  {hasLabelColumn && items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="mb-0.5 h-7 shrink-0 cursor-pointer text-slate-300 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  </div>
                )}
                {/* Số lượng × Đơn giá — only for templates with unitPrice (e.g. quotation) */}
                {hasUnitPrice && (
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
                )}
              </div>
            ))}
            {/* Add item — dashed card */}
            <button
              onClick={addItem}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 py-2.5 text-[11px] font-medium text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
            >
              <Plus className="h-3 w-3" />
              Thêm dòng
            </button>
          </div>
        </div>}

        {/* Total */}
        {(hasUnitPrice || template?.showTotal) && (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2">
          <span className="text-[11px] font-medium text-indigo-600">
            Tổng cộng
          </span>
          <span className="text-[13px] font-bold text-indigo-700">
            {formatCurrency(total)}
          </span>
        </div>
        )}

        <Separator className="my-3" />

        {/* Notes */}
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-slate-700">Ghi chú</legend>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="text-xs"
          />
        </fieldset>
      </div>
    </div>
  );
}
