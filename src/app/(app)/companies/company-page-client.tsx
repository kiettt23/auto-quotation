"use client";
import { LabeledField } from "@/components/shared/labeled-field";
import { KeyValueEditor, type KeyValueEditorRef } from "@/components/shared/key-value-editor";

import { useState, useRef } from "react";
import { Plus, Building2, X, Save, Loader2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
} from "@/actions/company.actions";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import type { CompanyRow } from "@/services/company.service";


/* ── Props ── */
type Props = { companies: CompanyRow[] };

export function CompanyPageClient({ companies }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedCompany = selectedId
    ? companies.find((c) => c.id === selectedId) ?? null
    : null;

  const detailOpen = isCreating || !!selectedCompany;

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
      {/* Master panel */}
      <div
        className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          detailOpen ? "flex-3" : "flex-1"
        }`}
      >
        {/* Toolbar */}
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

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {companies.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <Building2 className="h-7 w-7 text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">Chưa có công ty nào</p>
                <p className="mt-1 text-sm text-slate-400">Thêm công ty để bắt đầu tạo tài liệu</p>
              </div>
              <Button onClick={handleAdd} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm công ty
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`group flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-all ${
                    selectedId === c.id
                      ? "bg-indigo-50 ring-1 ring-indigo-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-xs font-bold text-white">
                    {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {c.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {c.address ?? "Chưa có địa chỉ"}
                    </p>
                  </div>
                  {c.taxCode && (
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {c.taxCode}
                    </span>
                  )}
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    selectedId === c.id ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400"
                  }`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          detailOpen ? "ml-6 flex-2 opacity-100" : "w-0 flex-none opacity-0"
        }`}
      >
        {detailOpen && (
          <CompanyDetailPanel
            key={isCreating ? "new" : (selectedCompany?.id ?? "new")}
            company={isCreating ? null : selectedCompany}
            onClose={handleClose}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        )}
      </div>
    </div>
  );
}

/* ── Detail/Edit Panel ── */
function CompanyDetailPanel({
  company,
  onClose,
  onSaved,
  onDeleted,
}: {
  company: CompanyRow | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isNew = !company;
  const [isPending, setIsPending] = useState(false);

  /* Form state */
  const [name, setName] = useState(company?.name ?? "");
  const [address, setAddress] = useState(company?.address ?? "");
  const [phone, setPhone] = useState(company?.phone ?? "");
  const [email, setEmail] = useState(company?.email ?? "");
  const [taxCode, setTaxCode] = useState(company?.taxCode ?? "");
  const [bankName, setBankName] = useState(company?.bankName ?? "");
  const [bankAccount, setBankAccount] = useState(company?.bankAccount ?? "");
  const [driverName, setDriverName] = useState(company?.driverName ?? "");
  const [vehicleId, setVehicleId] = useState(company?.vehicleId ?? "");
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl ?? "");
  const customDataRef = useRef<KeyValueEditorRef>(null);
  const [customDataDirty, setCustomDataDirty] = useState(false);

  const isDirty =
    isNew ||
    name !== (company?.name ?? "") ||
    address !== (company?.address ?? "") ||
    phone !== (company?.phone ?? "") ||
    email !== (company?.email ?? "") ||
    taxCode !== (company?.taxCode ?? "") ||
    bankName !== (company?.bankName ?? "") ||
    bankAccount !== (company?.bankAccount ?? "") ||
    driverName !== (company?.driverName ?? "") ||
    vehicleId !== (company?.vehicleId ?? "") ||
    logoUrl !== (company?.logoUrl ?? "") ||
    customDataDirty;

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Tên công ty không được để trống");
      return;
    }
    setIsPending(true);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("address", address);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("taxCode", taxCode);
    formData.set("bankName", bankName);
    formData.set("bankAccount", bankAccount);
    formData.set("driverName", driverName);
    formData.set("vehicleId", vehicleId);
    formData.set("logoUrl", logoUrl);
    const customData = customDataRef.current?.getData() ?? {};
    if (Object.keys(customData).length > 0) {
      formData.set("customData", JSON.stringify(customData));
    }

    const result = isNew
      ? await createCompanyAction(formData)
      : await updateCompanyAction(company!.id, formData);

    setIsPending(false);
    if (result.success) {
      toast.success(isNew ? "Đã thêm công ty" : "Đã lưu");
      onSaved();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!company) return;
    const result = await deleteCompanyAction(company.id);
    if (result.success) { toast.success("Đã xóa"); onDeleted(); }
    else toast.error(result.error);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <Button
          onClick={handleSave}
          disabled={isPending || !isDirty}
          size="sm"
          variant={isDirty ? "default" : "outline"}
          className={`h-7 min-w-0 flex-1 gap-1 rounded-lg text-xs transition-all ${
            isDirty
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "text-slate-400"
          }`}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {isPending ? "Lưu..." : isDirty ? (isNew ? "Tạo" : "Lưu") : "Đã lưu"}
        </Button>
        {!isNew && (
          <DeleteConfirmDialog name={company!.name} onConfirm={handleDelete} />
        )}
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <Separator className="mx-4" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Group 1: Thông tin */}
        <fieldset className="mb-3">
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Thông tin
          </legend>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <LabeledField label={<>Tên công ty <span className="text-red-500">*</span></>} className="min-w-0 flex-1">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="CÔNG TY TNHH..."
                />
              </LabeledField>
              <LabeledField label="Mã số thuế" className="w-32 shrink-0">
                <Input
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className="h-8 text-xs"
                />
              </LabeledField>
            </div>
            <LabeledField label="Địa chỉ">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-8 text-xs"
              />
            </LabeledField>
            <div className="flex gap-2">
              <LabeledField label="Số điện thoại" className="min-w-0 flex-1">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-8 text-xs"
                />
              </LabeledField>
              <LabeledField label="Email" className="min-w-0 flex-1">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs"
                  type="email"
                />
              </LabeledField>
            </div>
          </div>
        </fieldset>

        <Separator className="my-3" />

        {/* Group 2: Ngân hàng */}
        <fieldset className="mb-3">
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Ngân hàng
          </legend>
          <div className="flex gap-2">
            <LabeledField label="Tên ngân hàng" className="min-w-0 flex-1">
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="h-8 text-xs"
              />
            </LabeledField>
            <LabeledField label="Số tài khoản" className="w-36 shrink-0">
              <Input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="h-8 text-xs"
              />
            </LabeledField>
          </div>
        </fieldset>

        <Separator className="my-3" />

        {/* Group 3: Vận chuyển */}
        <fieldset className="mb-3">
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Vận chuyển mặc định
          </legend>
          <div className="flex gap-2">
            <LabeledField label="Tài xế" className="min-w-0 flex-1">
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="h-8 text-xs"
              />
            </LabeledField>
            <LabeledField label="Biển số xe" className="w-28 shrink-0">
              <Input
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="h-8 text-xs"
              />
            </LabeledField>
          </div>
        </fieldset>

        <Separator className="my-3" />

        {/* Group 4: Logo */}
        <fieldset>
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Logo
          </legend>
          <LabeledField label="URL Logo">
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="h-8 text-xs"
              placeholder="https://..."
            />
          </LabeledField>
        </fieldset>

        <Separator className="my-3" />

        {/* Group 5: Custom Data */}
        <fieldset>
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Thông tin bổ sung
          </legend>
          <KeyValueEditor
            ref={customDataRef}
            defaultValue={(company?.customData as Record<string, string | number>) ?? {}}
            onDirtyChange={setCustomDataDirty}
          />
        </fieldset>
      </div>
    </div>
  );
}
