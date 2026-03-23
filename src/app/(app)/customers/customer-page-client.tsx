"use client";
import { LabeledField } from "@/components/shared/labeled-field";
import { KeyValueEditor, type KeyValueEditorRef } from "@/components/shared/key-value-editor";

import { useState, useRef } from "react";
import { Plus, Users, X, Save, Loader2, ChevronRight, Copy, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  duplicateCustomerAction,
} from "@/actions/customer.actions";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import type { CustomerRow } from "@/services/customer.service";


type Props = { customers: CustomerRow[] };

export function CustomerPageClient({ customers }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedCustomer = selectedId
    ? customers.find((c) => c.id === selectedId) ?? null
    : null;

  const detailOpen = isCreating || !!selectedCustomer;

  function handleSelect(id: string) {
    setIsCreating(false);
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleAdd() {
    setSelectedId(null);
    setIsCreating(true);
  }

  function handleClose() {
    setSelectedId(null);
    setIsCreating(false);
  }

  async function handleRowDuplicate(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const result = await duplicateCustomerAction(id);
    if (result.success) { toast.success("Đã sao chép"); router.refresh(); }
    else toast.error(result.error);
  }

  async function handleRowDelete(id: string) {
    const result = await deleteCustomerAction(id);
    if (result.success) {
      toast.success("Đã xóa");
      if (selectedId === id) setSelectedId(null);
      router.refresh();
    } else toast.error(result.error);
  }

  function handleSaved() { router.refresh(); }
  function handleDeleted() { setSelectedId(null); router.refresh(); }

  return (
    <div className="flex h-[calc(100vh-48px)] gap-0 px-10 py-6">
      {/* Master */}
      <div
        className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          detailOpen ? "flex-3" : "flex-1"
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative flex items-center gap-1 rounded-xl bg-slate-100/80 p-1">
            <div className="pointer-events-none absolute inset-1 rounded-lg bg-white shadow-sm" />
            <span className="relative z-10 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900">
              Tất cả
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {customers.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <Users className="h-7 w-7 text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">Chưa có khách hàng nào</p>
                <p className="mt-1 text-sm text-slate-400">Thêm khách hàng để bắt đầu tạo tài liệu</p>
              </div>
              <Button onClick={handleAdd} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm khách hàng
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {customers.map((c) => (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(c.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect(c.id); }}
                  className={`group relative flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-all ${
                    selectedId === c.id
                      ? "bg-indigo-50 ring-1 ring-indigo-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">
                    {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.address ?? c.phone ?? "—"}</p>
                  </div>
                  <div className="relative shrink-0">
                    <div className="w-0 transition-opacity group-hover:opacity-0" />
                    <div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => handleRowDuplicate(e, c.id)}
                        className="flex cursor-pointer items-center gap-1 rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-slate-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                        title="Sao chép khách hàng này"
                      >
                        <Copy className="h-3 w-3" />
                        {!detailOpen && <span>Sao chép</span>}
                      </button>
                      <DeleteConfirmDialog
                        name={c.name}
                        onConfirm={() => handleRowDelete(c.id)}
                        trigger={
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-red-200 hover:bg-white hover:text-red-500 hover:shadow-sm"
                            title="Xóa khách hàng này"
                          >
                            <Trash2 className="h-3 w-3" />
                            {!detailOpen && <span>Xóa</span>}
                          </button>
                        }
                      />
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    selectedId === c.id ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400"
                  }`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          detailOpen ? "ml-6 flex-2 opacity-100" : "w-0 flex-none opacity-0"
        }`}
      >
        {detailOpen && (
          <CustomerDetailPanel
            key={isCreating ? "new" : (selectedCustomer?.id ?? "new")}
            customer={isCreating ? null : selectedCustomer}
            onClose={handleClose}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        )}
      </div>
    </div>
  );
}

/* ── Detail Panel ── */
function CustomerDetailPanel({
  customer,
  onClose,
  onSaved,
  onDeleted,
}: {
  customer: CustomerRow | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isNew = !customer;
  const [isPending, setIsPending] = useState(false);

  const [name, setName] = useState(customer?.name ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [taxCode, setTaxCode] = useState(customer?.taxCode ?? "");
  const [deliveryName, setDeliveryName] = useState(customer?.deliveryName ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState(customer?.deliveryAddress ?? "");
  const [receiverName, setReceiverName] = useState(customer?.receiverName ?? "");
  const [receiverPhone, setReceiverPhone] = useState(customer?.receiverPhone ?? "");
  const customDataRef = useRef<KeyValueEditorRef>(null);
  const [customDataDirty, setCustomDataDirty] = useState(false);

  const isDirty =
    isNew ||
    name !== (customer?.name ?? "") ||
    address !== (customer?.address ?? "") ||
    phone !== (customer?.phone ?? "") ||
    email !== (customer?.email ?? "") ||
    taxCode !== (customer?.taxCode ?? "") ||
    deliveryName !== (customer?.deliveryName ?? "") ||
    deliveryAddress !== (customer?.deliveryAddress ?? "") ||
    receiverName !== (customer?.receiverName ?? "") ||
    receiverPhone !== (customer?.receiverPhone ?? "") ||
    customDataDirty;

  async function handleSave() {
    if (!name.trim()) { toast.error("Tên không được để trống"); return; }
    setIsPending(true);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("address", address);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("taxCode", taxCode);
    formData.set("deliveryName", deliveryName);
    formData.set("deliveryAddress", deliveryAddress);
    formData.set("receiverName", receiverName);
    formData.set("receiverPhone", receiverPhone);
    const customData = customDataRef.current?.getData() ?? {};
    if (Object.keys(customData).length > 0) {
      formData.set("customData", JSON.stringify(customData));
    }

    const result = isNew
      ? await createCustomerAction(formData)
      : await updateCustomerAction(customer!.id, formData);
    setIsPending(false);
    if (result.success) { toast.success(isNew ? "Đã thêm" : "Đã lưu"); onSaved(); }
    else toast.error(result.error);
  }

  async function handleDelete() {
    if (!customer) return;
    const result = await deleteCustomerAction(customer.id);
    if (result.success) { toast.success("Đã xóa"); onDeleted(); }
    else toast.error(result.error);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <Button
          onClick={handleSave}
          disabled={isPending || !isDirty}
          size="sm"
          variant={isDirty ? "default" : "outline"}
          className={`h-7 min-w-0 flex-1 gap-1 rounded-lg text-xs transition-all ${
            isDirty ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-slate-400"
          }`}
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          {isPending ? "Lưu..." : isDirty ? (isNew ? "Tạo" : "Lưu") : "Đã lưu"}
        </Button>
        {!isNew && (
          <DeleteConfirmDialog name={customer!.name} onConfirm={handleDelete} />
        )}
        <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <Separator className="mx-4" />

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Thông tin */}
        <fieldset className="mb-3">
          <legend className="mb-2 text-[13px] font-semibold text-slate-700">Thông tin</legend>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <LabeledField label={<>Tên khách hàng <span className="text-red-500">*</span></>} className="min-w-0 flex-1">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs" />
              </LabeledField>
              <LabeledField label="Mã số thuế" className="w-32 shrink-0">
                <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} className="h-8 text-xs" />
              </LabeledField>
            </div>
            <LabeledField label="Địa chỉ">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-8 text-xs" />
            </LabeledField>
            <div className="flex gap-2">
              <LabeledField label="Số điện thoại" className="min-w-0 flex-1">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-xs" />
              </LabeledField>
              <LabeledField label="Email" className="min-w-0 flex-1">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-xs" type="email" />
              </LabeledField>
            </div>
          </div>
        </fieldset>

        <Separator className="my-3" />

        {/* Giao hàng */}
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-slate-700">Giao hàng mặc định</legend>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <LabeledField label="Nơi giao" className="min-w-0 flex-1">
                <Input value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} className="h-8 text-xs" />
              </LabeledField>
            </div>
            <LabeledField label="Địa chỉ giao">
              <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="h-8 text-xs" />
            </LabeledField>
            <div className="flex gap-2">
              <LabeledField label="Người nhận" className="min-w-0 flex-1">
                <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="h-8 text-xs" />
              </LabeledField>
              <LabeledField label="SĐT người nhận" className="w-32 shrink-0">
                <Input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className="h-8 text-xs" />
              </LabeledField>
            </div>
          </div>
        </fieldset>

        <Separator className="my-3" />

        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-slate-700">Thông tin bổ sung</legend>
          <KeyValueEditor
            ref={customDataRef}
            defaultValue={(customer?.customData as Record<string, string | number>) ?? {}}
            onDirtyChange={setCustomDataDirty}
          />
        </fieldset>
      </div>
    </div>
  );
}
