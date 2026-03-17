"use client";

import { useState } from "react";
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
import type { DocumentType } from "@/db/schema/document";
import type { DocumentItem } from "@/lib/validations/document.schema";
import type { DocumentData } from "@/lib/types/document-data";
import type { DocumentRow } from "@/services/document.service";

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
  /** If provided, form is in edit mode */
  document?: DocumentRow;
}

export function DocumentForm({ products, customers, document: doc }: Props) {
  const router = useRouter();
  const isEdit = !!doc;
  const existingData = doc?.data as DocumentData | undefined;

  const [isPending, setIsPending] = useState(false);
  const [docType, setDocType] = useState<DocumentType>(
    (doc?.type as DocumentType) ?? "QUOTATION",
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
  const [items, setItems] = useState<DocumentItem[]>(
    existingData?.items?.length
      ? existingData.items
      : [{ productName: "", unit: "", quantity: 1, unitPrice: 0, amount: 0 }],
  );
  const [notes, setNotes] = useState(existingData?.notes ?? "");

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
      type: docType,
      customerId: customerId || undefined,
      customerName,
      customerAddress,
      receiverName,
      receiverPhone,
      items: items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      })),
      notes,
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
        <DocumentTypeSelector selected={docType} onSelect={setDocType} />
      )}

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

      <DocumentItemsTable
        items={items}
        products={products}
        onItemsChange={setItems}
      />

      {/* Notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Ghi chú chung
        </label>
        <p className="mb-2 text-xs text-slate-400">
          Hiển thị cuối trái tài liệu PDF. VD: điều khoản, thời hạn báo giá...
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
