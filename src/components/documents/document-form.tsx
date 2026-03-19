"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createDocumentAction,
  updateDocumentAction,
} from "@/actions/document.actions";
import { DocumentTypeSelector } from "./document-type-selector";
import { DocumentCustomerSection } from "./document-customer-section";
import { DocumentItemsTable } from "./document-items-table";
import type { DocumentItem } from "@/lib/validations/document.schema";
import type { DocumentData } from "@/lib/types/document-data";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentTypeRow } from "@/services/document-type.service";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { autoCalculateWidths, type ColumnDef } from "@/lib/types/column-def";
import { getExtraFormFields, getTemplateItemColumns } from "@/lib/pdf/template-registry";

interface ProductOption {
  id: string;
  name: string;
  unitPrice: number;
  specification?: string | null;
  unitName?: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
  address: string | null;
  receiverName: string | null;
  receiverPhone: string | null;
}

interface Props {
  products: ProductOption[];
  customers: CustomerOption[];
  documentTypes: DocumentTypeRow[];
  /** If provided, form is in edit mode */
  document?: DocumentRow;
}

export function DocumentForm({ products, customers, documentTypes, document: doc }: Props) {
  const router = useRouter();
  const isEdit = !!doc;
  const existingData = doc?.data as DocumentData | undefined;

  const [isPending, setIsPending] = useState(false);
  const [typeId, setTypeId] = useState(
    doc?.typeId ?? documentTypes[0]?.id ?? "",
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
  // Extra template fields (e.g. deliveryAddress, driverName, vehicleId)
  const [extraFields, setExtraFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (existingData?.deliveryName) init.deliveryName = existingData.deliveryName;
    if (existingData?.deliveryAddress) init.deliveryAddress = existingData.deliveryAddress;
    if (existingData?.driverName) init.driverName = existingData.driverName;
    if (existingData?.vehicleId) init.vehicleId = existingData.vehicleId;
    return init;
  });

  const [items, setItems] = useState<DocumentItem[]>(
    existingData?.items?.length
      ? existingData.items
      : [{ productName: "", quantity: 1, unitPrice: 0, amount: 0 }],
  );
  const [notes, setNotes] = useState(existingData?.notes ?? "");

  // Resolve columns from selected document type
  const selectedType = useMemo(
    () => documentTypes.find((t) => t.id === typeId),
    [documentTypes, typeId],
  );
  const defaultColumns = useMemo(
    () => (selectedType?.columns ?? []) as ColumnDef[],
    [selectedType?.columns],
  );
  // Per-document column override — starts from type defaults or existing override
  const [columnOverride, setColumnOverride] = useState<ColumnDef[] | null>(
    existingData?.columns ?? null,
  );
  const templateId = (selectedType as Record<string, unknown> | undefined)?.templateId as string | null | undefined;
  const templateItemColumns = useMemo(() => getTemplateItemColumns(templateId), [templateId]);
  const columns = templateItemColumns ?? columnOverride ?? defaultColumns;
  const showTotal = templateItemColumns ? false : (selectedType?.showTotal ?? true);
  const templateExtraFields = useMemo(() => getExtraFormFields(templateId), [templateId]);
  const [showColumnEditor, setShowColumnEditor] = useState(false);

  // When type changes, reset column override
  const handleTypeChange = useCallback((newTypeId: string) => {
    setTypeId(newTypeId);
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
  }

  function buildPayload() {
    return {
      typeId,
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
      ...(extraFields.deliveryName ? { deliveryName: extraFields.deliveryName } : {}),
      ...(extraFields.deliveryAddress ? { deliveryAddress: extraFields.deliveryAddress } : {}),
      ...(extraFields.driverName ? { driverName: extraFields.driverName } : {}),
      ...(extraFields.vehicleId ? { vehicleId: extraFields.vehicleId } : {}),
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
      {!isEdit && (
        <DocumentTypeSelector
          types={documentTypes}
          selectedId={typeId}
          onSelect={handleTypeChange}
        />
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="text-sm text-blue-600 hover:text-blue-700"
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
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
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
            <input
              value={col.label}
              onChange={(e) => updateCol(i, { label: e.target.value })}
              disabled={col.system}
              className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400"
            />
            <select
              value={col.type}
              onChange={(e) => updateCol(i, { type: e.target.value as ColumnDef["type"] })}
              disabled={col.system}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-sm disabled:bg-slate-50"
            >
              <option value="text">Văn bản</option>
              <option value="number">Số</option>
              <option value="currency">Tiền tệ</option>
            </select>
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

      <button onClick={addCol} className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
        <Plus className="h-4 w-4" />
        Thêm cột
      </button>
    </div>
  );
}
