"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createDocumentAction,
  updateDocumentAction,
} from "@/actions/document.actions";
import { DocumentCustomerSection } from "./document-customer-section";
import { DocumentItemsTable } from "./document-items-table";
import type { DocumentItem } from "@/lib/validations/document.schema";
import type { DocumentData } from "@/lib/types/document-data";
import type { DocumentRow } from "@/services/document.service";
import type { CompanyRow } from "@/services/company.service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { autoCalculateWidths, type ColumnDef } from "@/lib/types/column-def";
import {
  getTemplateList,
  getTemplateEntry,
  getExtraFormFields,
  legacyTypeToTemplateId,
} from "@/lib/pdf/template-registry";
import { cn } from "@/lib/utils/cn";

interface ProductOption {
  id: string;
  name: string;
  unitPrice: number;
  specification?: string | null;
  unitName?: string | null;
  customData?: Record<string, string | number> | null;
}

interface CustomerOption {
  id: string;
  name: string;
  address: string | null;
  receiverName: string | null;
  receiverPhone: string | null;
  deliveryName: string | null;
  deliveryAddress: string | null;
  customData?: Record<string, string | number> | null;
}

interface Props {
  products: ProductOption[];
  customers: CustomerOption[];
  companies: CompanyRow[];
  /** If provided, form is in edit mode */
  document?: DocumentRow;
}

const templateList = getTemplateList();

export function DocumentForm({ products, customers, companies, document: doc }: Props) {
  const router = useRouter();
  const isEdit = !!doc;
  const existingData = doc?.data as DocumentData | undefined;

  const [isPending, setIsPending] = useState(false);
  const [companyId, setCompanyId] = useState(
    doc?.companyId ?? companies[0]?.id ?? "",
  );
  const [templateId, setTemplateId] = useState(
    doc?.templateId ?? legacyTypeToTemplateId(doc?.type ?? "") ?? templateList[0]?.id ?? "quotation",
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
    const init: Record<string, string> = { ...(existingData?.templateFields ?? {}) };
    if (!isEdit) {
      const defaultCompany = companies[0];
      if (defaultCompany?.driverName && !init.driverName) init.driverName = defaultCompany.driverName;
      if (defaultCompany?.vehicleId && !init.vehicleId) init.vehicleId = defaultCompany.vehicleId;
    }
    return init;
  });

  const [items, setItems] = useState<DocumentItem[]>(
    existingData?.items?.length
      ? existingData.items
      : [{ productName: "", quantity: 1, unitPrice: 0, amount: 0 }],
  );
  const [notes, setNotes] = useState(existingData?.notes ?? "");

  // Resolve columns from selected template
  const selectedTemplate = useMemo(
    () => getTemplateEntry(templateId),
    [templateId],
  );
  const defaultColumns = useMemo(
    () => selectedTemplate?.columns ?? [],
    [selectedTemplate],
  );
  const [columnOverride, setColumnOverride] = useState<ColumnDef[] | null>(
    existingData?.columns ?? null,
  );
  const columns = columnOverride ?? defaultColumns;
  const showTotal = selectedTemplate?.showTotal ?? true;
  const templateExtraFields = useMemo(() => getExtraFormFields(templateId), [templateId]);
  const [showColumnEditor, setShowColumnEditor] = useState(false);

  const handleTemplateChange = useCallback((newTemplateId: string) => {
    setTemplateId(newTemplateId);
    setColumnOverride(null);
  }, []);

  function handleCustomerSelect(id: string) {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    setCustomerId(id);
    setCustomerName(customer.name);
    setCustomerAddress(customer.address ?? "");
    setReceiverName(customer.receiverName ?? "");
    setReceiverPhone(customer.receiverPhone ?? "");
    setExtraFields((prev) => ({
      ...prev,
      ...(customer.deliveryName ? { deliveryName: customer.deliveryName } : {}),
      ...(customer.deliveryAddress ? { deliveryAddress: customer.deliveryAddress } : {}),
      // Merge customData into template fields
      ...(customer.customData ? Object.fromEntries(
        Object.entries(customer.customData).map(([k, v]) => [k, String(v)])
      ) : {}),
    }));
  }

  function handleCompanyChange(id: string) {
    setCompanyId(id);
    const company = companies.find((c) => c.id === id);
    if (!company) return;
    setExtraFields((prev) => ({
      ...prev,
      ...(company.driverName ? { driverName: company.driverName } : {}),
      ...(company.vehicleId ? { vehicleId: company.vehicleId } : {}),
      // Merge customData into template fields
      ...(company.customData ? Object.fromEntries(
        Object.entries(company.customData).map(([k, v]) => [k, String(v)])
      ) : {}),
    }));
  }

  function buildPayload() {
    return {
      companyId,
      templateId,
      date: documentDate || undefined,
      customerId: customerId || undefined,
      customerName,
      customerAddress,
      receiverName,
      receiverPhone,
      items: items.map((item) => ({
        ...item,
        amount: (item.quantity ?? 0) * (item.unitPrice ?? 0),
      })),
      notes,
      ...(columnOverride ? { columns: columnOverride } : {}),
      ...(Object.keys(extraFields).length > 0 ? { templateFields: extraFields } : {}),
    };
  }

  async function handleSave() {
    setIsPending(true);
    const payload = buildPayload();
    const result = isEdit
      ? await updateDocumentAction(doc.id, payload)
      : await createDocumentAction(payload);
    setIsPending(false);

    if (result.success) {
      toast.success(isEdit ? "Đã cập nhật tài liệu" : "Đã tạo tài liệu");
      router.push(`/documents/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Company selector */}
      {companies.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Vui lòng tạo công ty trước khi tạo tài liệu.{" "}
          <a href="/companies/new" className="font-medium underline">
            Tạo công ty
          </a>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="max-w-sm">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Công ty
            </label>
            <Select value={companyId} onValueChange={handleCompanyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn công ty..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Template selector — only on create */}
      {!isEdit && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <label className="mb-3 block text-sm font-medium text-slate-700">
            Loại tài liệu
          </label>
          <div className="flex flex-wrap gap-3">
            {templateList.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTemplateChange(t.id)}
                className={cn(
                  "flex flex-col items-start rounded-xl border-2 px-4 py-3 text-left transition-all",
                  templateId === t.id
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <span className={cn(
                  "mb-1 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                  t.color.badgeBg,
                  t.color.badgeText,
                )}>
                  {t.shortLabel}
                </span>
                <span className="text-sm font-semibold text-slate-900">{t.name}</span>
                <span className="text-xs text-slate-400">{t.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date input */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Ngày chứng từ
            </label>
            <input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <DocumentCustomerSection
        customers={customers}
        customerId={customerId}
        customerName={customerName}
        customerAddress={customerAddress}
        receiverName={receiverName}
        receiverPhone={receiverPhone}
        onCustomerSelect={handleCustomerSelect}
        onCustomerNameChange={setCustomerName}
        onCustomerAddressChange={setCustomerAddress}
        onReceiverNameChange={setReceiverName}
        onReceiverPhoneChange={setReceiverPhone}
      />

      {/* Template-specific extra fields */}
      {templateExtraFields.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Thông tin bổ sung</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {templateExtraFields.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {field.label}
                </label>
                <input
                  value={extraFields[field.key] ?? ""}
                  onChange={(e) => setExtraFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline column customization */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Bảng sản phẩm</h2>
        <button
          type="button"
          onClick={() => {
            if (!showColumnEditor && !columnOverride) {
              setColumnOverride([...defaultColumns]);
            }
            setShowColumnEditor(!showColumnEditor);
          }}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          {showColumnEditor ? "Ẩn tùy chỉnh cột" : "Tùy chỉnh cột"}
        </button>
      </div>

      {showColumnEditor && columnOverride && (
        <InlineColumnEditor
          columns={columnOverride}
          onChange={setColumnOverride}
          onReset={() => { setColumnOverride(null); setShowColumnEditor(false); }}
        />
      )}

      <DocumentItemsTable
        items={items}
        products={products}
        columns={columns}
        showTotal={showTotal}
        onItemsChange={setItems}
      />

      {/* Notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Ghi chú chung
        </label>
        <p className="mb-2 text-xs text-slate-400">
          Hiển thị cuối tài liệu PDF. VD: điều khoản, thời hạn báo giá...
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="VD: Giá đã bao gồm VAT. Báo giá có hiệu lực 30 ngày."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu & xem PDF"}
        </Button>
      </div>
    </div>
  );
}

// --- Inline column editor for per-document overrides ---

function InlineColumnEditor({
  columns,
  onChange,
  onReset,
}: {
  columns: ColumnDef[];
  onChange: (cols: ColumnDef[]) => void;
  onReset: () => void;
}) {
  function updateCol(i: number, patch: Partial<ColumnDef>) {
    onChange(columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function removeCol(i: number) {
    onChange(autoCalculateWidths(columns.filter((_, idx) => idx !== i)));
  }

  function addCol() {
    const newCol: ColumnDef = { key: `custom_${Date.now()}`, label: "Cột mới", type: "text", width: "10%" };
    const updated = [...columns, newCol];
    onChange(autoCalculateWidths(updated));
  }

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Cột hiển thị</span>
        <button onClick={onReset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
          <RotateCcw className="h-3 w-3" />
          Đặt lại mặc định
        </button>
      </div>

      <div className="space-y-2">
        {columns.map((col, i) => (
          <div key={col.key} className="flex items-center gap-2">
            <Input
              value={col.label}
              onChange={(e) => updateCol(i, { label: e.target.value })}
              disabled={col.system}
              className="h-8 flex-1 text-sm"
            />
            <Select
              value={col.type}
              onValueChange={(v) => updateCol(i, { type: v as ColumnDef["type"] })}
              disabled={col.system}
            >
              <SelectTrigger className="h-8 w-28 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Văn bản</SelectItem>
                <SelectItem value="number">Số</SelectItem>
                <SelectItem value="currency">Tiền tệ</SelectItem>
              </SelectContent>
            </Select>
            {col.system ? (
              <span className="w-8 text-center text-xs text-slate-300">🔒</span>
            ) : (
              <button onClick={() => removeCol(i)} className="w-8 text-center text-slate-400 hover:text-red-600">
                <Trash2 className="mx-auto h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={addCol} className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
        <Plus className="h-4 w-4" />
        Thêm cột
      </button>
    </div>
  );
}
