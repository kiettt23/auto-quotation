"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createDocumentAction } from "@/actions/document.actions";
import { DocumentTypeSelector } from "@/components/documents/document-type-selector";
import { DocumentCustomerSection } from "@/components/documents/document-customer-section";
import { DocumentItemsTable } from "@/components/documents/document-items-table";
import type { DocumentType } from "@/db/schema/document";
import type { DocumentItem } from "@/lib/validations/document.schema";

interface Props {
  products: Array<{
    id: string;
    name: string;
    unitPrice: number;
    unitName?: string | null;
  }>;
  customers: Array<{
    id: string;
    name: string;
    address: string | null;
    receiverName: string | null;
    receiverPhone: string | null;
  }>;
}

export function DocumentFormClient({ products, customers }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [docType, setDocType] = useState<DocumentType>("QUOTATION");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [items, setItems] = useState<DocumentItem[]>([
    { productName: "", unit: "", quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [notes, setNotes] = useState("");

  function handleCustomerSelect(id: string) {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    setCustomerId(id);
    setCustomerName(customer.name);
    setCustomerAddress(customer.address ?? "");
    setReceiverName(customer.receiverName ?? "");
    setReceiverPhone(customer.receiverPhone ?? "");
  }

  async function handleSubmit(status: "DRAFT" | "FINAL") {
    setIsPending(true);
    const result = await createDocumentAction({
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
    });

    setIsPending(false);

    if (result.success) {
      toast.success("Đã tạo tài liệu");
      router.push(`/documents/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DocumentTypeSelector selected={docType} onSelect={setDocType} />

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
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Ghi chú
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ghi chú thêm cho tài liệu..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => handleSubmit("DRAFT")}
          disabled={isPending}
        >
          Lưu nháp
        </Button>
        <Button onClick={() => handleSubmit("FINAL")} disabled={isPending}>
          {isPending ? "Đang tạo..." : "Xem trước PDF"}
        </Button>
      </div>
    </div>
  );
}
