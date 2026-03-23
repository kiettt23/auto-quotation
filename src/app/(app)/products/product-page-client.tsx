"use client";
import { LabeledField } from "@/components/shared/labeled-field";
import { KeyValueEditor, type KeyValueEditorRef } from "@/components/shared/key-value-editor";
import { getAllCustomColumnKeys } from "@/lib/pdf/template-registry";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Plus, Package, X, Save, Loader2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/actions/product.actions";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/document-helpers";
import type { ProductWithRelations } from "@/services/product.service";
import type { CategoryRow } from "@/services/category.service";
import type { UnitRow } from "@/services/unit.service";


type Props = {
  products: ProductWithRelations[];
  categories: CategoryRow[];
  units: UnitRow[];
};

export function ProductPageClient({ products, categories, units }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const tabs = useMemo(() => [
    { label: "Tất cả", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ], [categories]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter((p) => p.categoryId === activeTab);
  }, [products, activeTab]);

  /* Sliding indicator */
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const filterTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [filterIndicator, setFilterIndicator] = useState({ left: 0, width: 0 });
  const [filterReady, setFilterReady] = useState(false);
  const activeTabIndex = tabs.findIndex((t) => t.value === activeTab);

  const updateFilterIndicator = useCallback(() => {
    const container = filterContainerRef.current;
    const tab = filterTabRefs.current[activeTabIndex];
    if (!container || !tab) return;
    const cRect = container.getBoundingClientRect();
    const tRect = tab.getBoundingClientRect();
    setFilterIndicator({ left: tRect.left - cRect.left, width: tRect.width });
    if (!filterReady) setFilterReady(true);
  }, [activeTabIndex, filterReady]);

  useEffect(() => {
    updateFilterIndicator();
  }, [updateFilterIndicator]);

  const selectedProduct = selectedId
    ? products.find((p) => p.id === selectedId) ?? null
    : null;

  const detailOpen = isCreating || !!selectedProduct;

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
          <div
            ref={filterContainerRef}
            className="relative flex items-center gap-1 rounded-xl bg-slate-100/80 p-1"
          >
            <div
              className={`pointer-events-none absolute rounded-lg bg-white shadow-sm ${
                filterReady ? "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]" : ""
              } ${filterReady ? "opacity-100" : "opacity-0"}`}
              style={{ left: filterIndicator.left, width: filterIndicator.width, top: 4, bottom: 4 }}
            />
            {tabs.map((tab, i) => (
              <button
                key={tab.value}
                ref={(el) => { filterTabRefs.current[i] = el; }}
                onClick={() => setActiveTab(tab.value)}
                className={`relative z-10 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  activeTab === tab.value ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
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
          {filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <Package className="h-7 w-7 text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">Chưa có sản phẩm nào</p>
                <p className="mt-1 text-sm text-slate-400">Thêm sản phẩm để bắt đầu tạo tài liệu</p>
              </div>
              <Button onClick={handleAdd} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`group flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-all ${
                    selectedId === p.id
                      ? "bg-indigo-50 ring-1 ring-indigo-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-white">
                    {p.name ? p.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{p.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {[p.categoryName, p.unitName, p.specification].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700">
                    {formatCurrency(p.unitPrice)}
                  </span>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    selectedId === p.id ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400"
                  }`} />
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
          <ProductDetailPanel
            key={isCreating ? "new" : (selectedProduct?.id ?? "new")}
            product={isCreating ? null : selectedProduct}
            categories={categories}
            units={units}
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
function ProductDetailPanel({
  product,
  categories,
  units,
  onClose,
  onSaved,
  onDeleted,
}: {
  product: ProductWithRelations | null;
  categories: CategoryRow[];
  units: UnitRow[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isNew = !product;
  const [isPending, setIsPending] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [unitId, setUnitId] = useState(product?.unitId ?? "");
  const [unitPrice, setUnitPrice] = useState(product?.unitPrice ?? 0);
  const [specification, setSpecification] = useState(product?.specification ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const customDataRef = useRef<KeyValueEditorRef>(null);
  const [customDataDirty, setCustomDataDirty] = useState(false);

  const isDirty =
    isNew ||
    name !== (product?.name ?? "") ||
    categoryId !== (product?.categoryId ?? "") ||
    unitId !== (product?.unitId ?? "") ||
    unitPrice !== (product?.unitPrice ?? 0) ||
    specification !== (product?.specification ?? "") ||
    description !== (product?.description ?? "") ||
    customDataDirty;

  async function handleSave() {
    if (!name.trim()) { toast.error("Tên không được để trống"); return; }
    setIsPending(true);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("categoryId", categoryId);
    formData.set("unitId", unitId);
    formData.set("unitPrice", String(unitPrice));
    formData.set("specification", specification);
    formData.set("description", description);
    const customData = customDataRef.current?.getData() ?? {};
    if (Object.keys(customData).length > 0) {
      formData.set("customData", JSON.stringify(customData));
    }

    const result = isNew
      ? await createProductAction(formData)
      : await updateProductAction(product!.id, formData);
    setIsPending(false);
    if (result.success) { toast.success(isNew ? "Đã thêm" : "Đã lưu"); onSaved(); }
    else toast.error(result.error);
  }

  async function handleDelete() {
    if (!product) return;
    const result = await deleteProductAction(product.id);
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
          <DeleteConfirmDialog name={product!.name} onConfirm={handleDelete} />
        )}
        <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <Separator className="mx-4" />

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <fieldset>
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Thông tin sản phẩm</legend>
          <div className="space-y-1.5">
            <LabeledField label={<>Tên sản phẩm <span className="text-red-500">*</span></>}>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs" />
            </LabeledField>
            <div className="flex gap-2">
              <LabeledField label="Danh mục" className="min-w-0 flex-1">
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LabeledField>
              <LabeledField label="Đơn vị" className="w-28 shrink-0">
                <Select value={unitId} onValueChange={setUnitId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LabeledField>
            </div>
            <div className="flex gap-2">
              <LabeledField label="Đơn giá (VNĐ)" className="w-36 shrink-0">
                <Input
                  type="number"
                  min={0}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </LabeledField>
              <LabeledField label="Quy cách" className="min-w-0 flex-1">
                <Input value={specification} onChange={(e) => setSpecification(e.target.value)} className="h-8 text-xs" />
              </LabeledField>
            </div>
            <LabeledField label="Mô tả">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </LabeledField>
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Thông tin bổ sung</legend>
          <KeyValueEditor
            ref={customDataRef}
            defaultValue={(product?.customData as Record<string, string | number>) ?? {}}
            onDirtyChange={setCustomDataDirty}
            keyOptions={getAllCustomColumnKeys()}
          />
        </fieldset>
      </div>
    </div>
  );
}
