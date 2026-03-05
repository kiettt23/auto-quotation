"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// ─── Types ────────────────────────────────────────────────────────────────────

type TableRow = {
  contractNo: string;
  itemName: string;
  lotNo: string;
  boxQty: string;
  netWeight: string;
  invoiceVat: string;
};

type FormState = {
  companyName: string;
  companyAddress: string;
  companyTaxCode: string;
  docNumber: string;
  deliveryDate: string;
  buyerName: string;
  buyerAddress: string;
  deliveryTo: string;
  deliveryAddress: string;
  vehicleId: string;
  driverName: string;
  receiverName: string;
  receiverPhone: string;
  items: TableRow[];
};

const STORAGE_KEY = "pgh-form-state";

const EMPTY_ROW: TableRow = {
  contractNo: "", itemName: "", lotNo: "",
  boxQty: "", netWeight: "", invoiceVat: "",
};

const DEFAULT_STATE: FormState = {
  companyName: "CONG TY TNHH TEXTILES IN SAIGON",
  companyAddress: "", companyTaxCode: "",
  docNumber: "PGH-001", deliveryDate: "",
  buyerName: "", buyerAddress: "",
  deliveryTo: "", deliveryAddress: "",
  vehicleId: "", driverName: "",
  receiverName: "", receiverPhone: "",
  items: [{ ...EMPTY_ROW }],
};

// ─── localStorage helpers ────────────────────────────────────────────────────

function loadState(): FormState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: FormState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PghFormPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setForm(loadState());
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) saveState(form);
  }, [form, loaded]);

  const update = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  function handleItemChange(index: number, field: keyof TableRow, value: string) {
    const items = form.items.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    update({ items });
  }

  function addRow() {
    update({ items: [...form.items, { ...EMPTY_ROW }] });
  }

  function removeRow(index: number) {
    update({ items: form.items.filter((_, i) => i !== index) });
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await fetch("/api/pgh/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: form.deliveryDate, // layout uses date field for backwards compat
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.docNumber || "PGH"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất PDF thành công");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xuất PDF thất bại");
    } finally {
      setIsExporting(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Phiếu Giao Nhận (PGH)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Nhập thông tin và xuất PDF — Approach 2 test
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
          Xuất PDF
        </Button>
      </div>

      <Separator />

      {/* Company info */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Thông tin công ty</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tên công ty" value={form.companyName} onChange={(v) => update({ companyName: v })} />
          <Field label="Địa chỉ" value={form.companyAddress} onChange={(v) => update({ companyAddress: v })} />
          <Field label="Mã số thuế" value={form.companyTaxCode} onChange={(v) => update({ companyTaxCode: v })} />
        </div>
      </section>

      <Separator />

      {/* Document info */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Thông tin phiếu</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Số phiếu" value={form.docNumber} onChange={(v) => update({ docNumber: v })} />
          <Field label="Ngày giao hàng" value={form.deliveryDate} onChange={(v) => update({ deliveryDate: v })} type="date" />
        </div>
      </section>

      <Separator />

      {/* Buyer info */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Khách hàng</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên khách hàng" value={form.buyerName} onChange={(v) => update({ buyerName: v })} />
          <Field label="Địa chỉ khách hàng" value={form.buyerAddress} onChange={(v) => update({ buyerAddress: v })} />
        </div>
      </section>

      <Separator />

      {/* Delivery info */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Giao hàng</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Giao đến (tên)" value={form.deliveryTo} onChange={(v) => update({ deliveryTo: v })} />
          <Field label="Địa chỉ giao" value={form.deliveryAddress} onChange={(v) => update({ deliveryAddress: v })} />
          <Field label="Số xe" value={form.vehicleId} onChange={(v) => update({ vehicleId: v })} />
          <Field label="Tên tài xế" value={form.driverName} onChange={(v) => update({ driverName: v })} />
          <Field label="Người nhận" value={form.receiverName} onChange={(v) => update({ receiverName: v })} />
          <Field label="SĐT người nhận" value={form.receiverPhone} onChange={(v) => update({ receiverPhone: v })} />
        </div>
      </section>

      <Separator />

      {/* Items table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Chi tiết hàng hóa ({form.items.length} dòng)</h2>
          <Button type="button" size="sm" variant="outline" onClick={addRow}>
            <Plus className="mr-1 size-3" /> Thêm dòng
          </Button>
        </div>

        <div className="space-y-2">
          {form.items.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1.5fr_1fr_80px_80px_1fr_auto] gap-2 items-end">
              <MiniField label={idx === 0 ? "Hợp đồng" : undefined} value={row.contractNo} onChange={(v) => handleItemChange(idx, "contractNo", v)} />
              <MiniField label={idx === 0 ? "Tên hàng" : undefined} value={row.itemName} onChange={(v) => handleItemChange(idx, "itemName", v)} />
              <MiniField label={idx === 0 ? "Số Lô" : undefined} value={row.lotNo} onChange={(v) => handleItemChange(idx, "lotNo", v)} />
              <MiniField label={idx === 0 ? "Số thùng" : undefined} value={row.boxQty} onChange={(v) => handleItemChange(idx, "boxQty", v)} type="number" />
              <MiniField label={idx === 0 ? "Cân nặng" : undefined} value={row.netWeight} onChange={(v) => handleItemChange(idx, "netWeight", v)} type="number" />
              <MiniField label={idx === 0 ? "Hóa đơn VAT" : undefined} value={row.invoiceVat} onChange={(v) => handleItemChange(idx, "invoiceVat", v)} />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 shrink-0"
                onClick={() => removeRow(idx)}
                disabled={form.items.length <= 1}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Reusable field components ───────────────────────────────────────────────

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function MiniField({ label, value, onChange, type = "text" }: {
  label?: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-sm" />
    </div>
  );
}
