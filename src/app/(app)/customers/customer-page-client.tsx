"use client";
import { LabeledField } from "@/components/shared/labeled-field";

import { useState, useMemo } from "react";
import { Plus, Users, X, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
} from "@/actions/customer.actions";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import type { CustomerRow } from "@/services/customer.service";


type Props = { customers: CustomerRow[] };

export function CustomerPageClient({ customers }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q));
  }, [customers, search]);

  const selectedCustomer = selectedId
    ? customers.find((c) => c.id === selectedId) ?? null
    : null;

  const detailOpen = isCreating || !!selectedCustomer;

  function handleSelect(id: string) {
    setIsCreating(false);
    setSelectedId(id);
  }

  function handleAdd() {
    setSelectedId(null);
    setIsCreating(true);
  }

  function handleClose() {
    setSelectedId(null);
    setIsCreating(false);
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
          <Input
            placeholder="Tìm khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 flex-1 rounded-xl border-slate-200 bg-slate-50 pl-3 text-xs"
          />
          <button
            onClick={handleAdd}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <Users className="h-7 w-7 text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-slate-900">Chưa có khách hàng</p>
              <p className="mt-1 text-xs text-slate-400">Nhấn + để thêm khách hàng đầu tiên</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors ${
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
                </button>
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
    receiverPhone !== (customer?.receiverPhone ?? "");

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
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Thông tin</legend>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <LabeledField label="Tên khách hàng *" className="min-w-0 flex-1">
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
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Giao hàng mặc định</legend>
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
      </div>
    </div>
  );
}
