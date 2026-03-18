"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createDocumentTypeAction,
  updateDocumentTypeAction,
  deleteDocumentTypeAction,
} from "@/actions/document-type.actions";
import type { DocumentTypeRow } from "@/services/document-type.service";
import { autoCalculateWidths, type ColumnDef } from "@/lib/types/column-def";
import { QUOTATION_COLUMNS } from "@/lib/constants/default-column-presets";
import { getTemplateList } from "@/lib/pdf/template-registry";
import { toast } from "sonner";

interface Props {
  documentTypes: DocumentTypeRow[];
}

const COLUMN_TYPE_OPTIONS = [
  { value: "text", label: "Văn bản" },
  { value: "number", label: "Số" },
  { value: "currency", label: "Tiền tệ" },
] as const;

export function DocumentTypeColumnEditor({ documentTypes: initialTypes }: Props) {
  const [types, setTypes] = useState(initialTypes);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  // --- Add new document type ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newShortLabel, setNewShortLabel] = useState("");

  async function handleAddType() {
    if (!newLabel.trim() || !newShortLabel.trim()) return;
    const key = newShortLabel.trim().toUpperCase().replace(/\s+/g, "_");
    startTransition(async () => {
      const result = await createDocumentTypeAction({
        key,
        label: newLabel.trim(),
        shortLabel: newShortLabel.trim().toUpperCase(),
        columns: QUOTATION_COLUMNS,
        showTotal: true,
      });
      if (result.success) {
        setTypes((prev) => [...prev, result.data as DocumentTypeRow]);
        setNewLabel("");
        setNewShortLabel("");
        setShowAddForm(false);
        toast.success("Đã thêm loại chứng từ.");
      } else {
        toast.error(result.error);
      }
    });
  }

  // --- Delete document type ---
  async function handleDeleteType() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteDocumentTypeAction(deleteTarget.id);
      if (result.success) {
        setTypes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        if (expandedId === deleteTarget.id) setExpandedId(null);
        toast.success("Đã xóa loại chứng từ.");
      } else {
        toast.error(result.error);
      }
      setDeleteTarget(null);
    });
  }

  // --- Update columns for a type ---
  async function handleSaveColumns(typeId: string, columns: ColumnDef[], showTotal: boolean, signatureLabels?: string[], templateId?: string | null) {
    startTransition(async () => {
      const result = await updateDocumentTypeAction(typeId, {
        columns,
        showTotal,
        ...(signatureLabels ? { signatureLabels } : {}),
        ...(templateId !== undefined ? { templateId } : {}),
      });
      if (result.success) {
        setTypes((prev) => prev.map((t) => (t.id === typeId ? { ...t, columns, showTotal, ...(templateId !== undefined ? { templateId } : {}) } : t)));
        toast.success("Đã lưu cấu hình.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Loại chứng từ</h2>
          <p className="text-sm text-slate-500">
            Cấu hình các cột trong bảng sản phẩm trên tài liệu và PDF.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-1 h-4 w-4" />
          Thêm loại
        </Button>
      </div>

      {/* Add new type form */}
      {showAddForm && (
        <div className="flex items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Tên loại</label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="VD: Hợp đồng"
              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs font-medium text-slate-600">Mã viết tắt</label>
            <input
              value={newShortLabel}
              onChange={(e) => setNewShortLabel(e.target.value.toUpperCase())}
              placeholder="VD: HĐ"
              maxLength={5}
              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm uppercase focus:border-blue-500 focus:outline-none"
            />
          </div>
          <Button size="sm" onClick={handleAddType} disabled={isPending || !newLabel.trim() || !newShortLabel.trim()}>
            Tạo
          </Button>
        </div>
      )}

      {/* Document type list */}
      {types.map((type) => (
        <DocumentTypeCard
          key={type.id}
          type={type}
          expanded={expandedId === type.id}
          onToggle={() => setExpandedId(expandedId === type.id ? null : type.id)}
          onSave={(columns, showTotal, signatureLabels, templateId) => handleSaveColumns(type.id, columns, showTotal, signatureLabels, templateId)}
          onDelete={() => setDeleteTarget({ id: type.id, label: type.label })}
          isPending={isPending}
        />
      ))}

      {types.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">
          Chưa có loại chứng từ nào. Thêm loại đầu tiên.
        </p>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa loại chứng từ</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa &quot;{deleteTarget?.label}&quot;? Tài liệu đã tạo với loại này sẽ không bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteType} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Individual type card with column editor ---

function DocumentTypeCard({
  type,
  expanded,
  onToggle,
  onSave,
  onDelete,
  isPending,
}: {
  type: DocumentTypeRow;
  expanded: boolean;
  onToggle: () => void;
  onSave: (columns: ColumnDef[], showTotal: boolean, signatureLabels?: string[], templateId?: string | null) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const cols = (type.columns ?? []) as ColumnDef[];
  const [columns, setColumns] = useState<ColumnDef[]>(cols);
  const [showTotal, setShowTotal] = useState(type.showTotal);
  const [sigLabels, setSigLabels] = useState<string[]>(
    (type.signatureLabels as string[]) ?? ["Bên mua", "Bên bán"],
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    (type as Record<string, unknown>).templateId as string ?? "default",
  );
  const [dirty, setDirty] = useState(false);
  const templateList = getTemplateList();

  function updateColumn(index: number, patch: Partial<ColumnDef>) {
    setColumns((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    setDirty(true);
  }

  function addColumn() {
    const key = `custom_${Date.now()}`;
    setColumns((prev) => [...prev, { key, label: "Cột mới", type: "text", width: "10%" }]);
    setDirty(true);
  }

  function removeColumn(index: number) {
    setColumns((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  }

  function moveColumn(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= columns.length) return;
    setColumns((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
    setDirty(true);
  }

  function handleSave() {
    const withWidths = autoCalculateWidths(columns);
    setColumns(withWidths);
    onSave(withWidths, showTotal, sigLabels, selectedTemplate === "default" ? null : selectedTemplate);
    setDirty(false);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-slate-900">{type.label}</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{type.shortLabel}</span>
          <span className="text-xs text-slate-400">{cols.length} cột</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
          title="Xóa loại chứng từ"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </button>

      {/* Column editor */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4">
          {/* Column list */}
          <div className="mb-3 space-y-2">
            {/* Header row */}
            <div className="grid grid-cols-[24px_1fr_100px_32px_32px] gap-2 text-xs font-medium text-slate-500">
              <span />
              <span>Tên cột</span>
              <span>Kiểu dữ liệu</span>
              <span />
              <span />
            </div>

            {columns.map((col, i) => (
              <div
                key={col.key}
                className="grid grid-cols-[24px_1fr_100px_32px_32px] items-center gap-2"
              >
                <GripVertical className="h-4 w-4 cursor-grab text-slate-300" />

                {/* Label */}
                <input
                  value={col.label}
                  onChange={(e) => updateColumn(i, { label: e.target.value })}
                  disabled={col.system}
                  className="rounded border border-slate-200 px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                />

                {/* Type */}
                <select
                  value={col.type}
                  onChange={(e) => updateColumn(i, { type: e.target.value as ColumnDef["type"] })}
                  disabled={col.system}
                  className="rounded border border-slate-200 px-2 py-1 text-sm disabled:bg-slate-50"
                >
                  {COLUMN_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* Move up/down */}
                <div className="flex flex-col">
                  <button
                    onClick={() => moveColumn(i, -1)}
                    disabled={i === 0}
                    className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveColumn(i, 1)}
                    disabled={i === columns.length - 1}
                    className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                {/* Delete */}
                {col.system ? (
                  <span className="text-xs text-slate-300" title="Cột hệ thống, không xóa được">🔒</span>
                ) : (
                  <button
                    onClick={() => removeColumn(i)}
                    className="rounded p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add column button */}
          <button
            onClick={addColumn}
            className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm cột
          </button>

          {/* Show total toggle */}
          <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={showTotal}
              onChange={(e) => { setShowTotal(e.target.checked); setDirty(true); }}
              className="rounded border-slate-300"
            />
            Hiển thị dòng tổng cộng
          </label>

          {/* Signature labels */}
          <div className="mb-4">
            <span className="mb-2 block text-sm font-medium text-slate-700">Ô chữ ký trên PDF</span>
            <div className="flex flex-wrap gap-2">
              {sigLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    value={label}
                    onChange={(e) => {
                      const updated = [...sigLabels];
                      updated[i] = e.target.value;
                      setSigLabels(updated);
                      setDirty(true);
                    }}
                    className="w-32 rounded border border-slate-200 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => { setSigLabels(sigLabels.filter((_, idx) => idx !== i)); setDirty(true); }}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => { setSigLabels([...sigLabels, "Người ký"]); setDirty(true); }}
                className="flex items-center gap-1 rounded border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600"
              >
                <Plus className="h-3 w-3" />
                Thêm ô ký
              </button>
            </div>
          </div>

          {/* Template selector */}
          <div className="mb-4">
            <span className="mb-2 block text-sm font-medium text-slate-700">Mẫu PDF</span>
            <select
              value={selectedTemplate}
              onChange={(e) => { setSelectedTemplate(e.target.value); setDirty(true); }}
              className="rounded border border-slate-200 px-3 py-1.5 text-sm"
            >
              {templateList.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
              ))}
            </select>
          </div>

          {/* Save */}
          {dirty && (
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              Lưu cấu hình
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
