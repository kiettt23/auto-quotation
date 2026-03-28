"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FileText,
  ChevronRight,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  calculateTotal,
  formatCurrency,
  formatDate,
} from "@/lib/utils/document-helpers";
import { getTemplateEntry, getTemplateList } from "@/lib/pdf/template-registry";
import { cn } from "@/lib/utils/cn";
import { duplicateDocumentAction, deleteDocumentAction } from "@/actions/document.actions";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { DocumentPdfDownloadButton } from "@/components/documents/document-pdf-download-button";
import { DocumentDetailEditPanel } from "./document-detail-edit-panel";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentData } from "@/lib/types/document-data";
import type { ProductWithRelations } from "@/services/product.service";
import type { CustomerRow } from "@/services/customer.service";
import type { CompanyRow } from "@/services/company.service";

const PAGE_SIZE = 20;

const templateList = getTemplateList();
const tabs = [
  { label: "Tất cả", value: "all" },
  ...templateList.map((t) => ({ label: t.name, value: t.id })),
];

function resolveTemplateId(doc: DocumentRow): string {
  return doc.templateId;
}

export function DocumentListClient({
  documents,
  products,
  customers,
  companies,
}: {
  documents: DocumentRow[];
  products: ProductWithRelations[];
  customers: CustomerRow[];
  companies: CompanyRow[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  // Ref to panel's auto-save function — called before switching/closing panel
  const panelAutoSaveRef = useRef<(() => Promise<void>) | null>(null);

  // Filter tab sliding indicator
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

  const filtered = useMemo(() => {
    let list = documents;
    if (activeTab !== "all") {
      list = list.filter((d) => resolveTemplateId(d) === activeTab);
    }
    return list;
  }, [documents, activeTab]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => setPage(1), [activeTab]);

  const selectedDoc = selectedId
    ? (documents.find((d) => d.id === selectedId) ?? null)
    : null;

  const panelOpen = isCreating || !!selectedDoc;

  function handleAdd() {
    setSelectedId(null);
    setIsCreating(true);
  }

  async function handleSelect(id: string) {
    if (panelAutoSaveRef.current) await panelAutoSaveRef.current();
    setIsCreating(false);
    setSelectedId((prev) => (prev === id ? null : id));
  }

  async function handleClose() {
    if (panelAutoSaveRef.current) await panelAutoSaveRef.current();
    setSelectedId(null);
    setIsCreating(false);
  }


  async function handleRowDuplicate(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const result = await duplicateDocumentAction(id);
    if (result.success) {
      toast.success("Đã sao chép");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRowDelete(id: string) {
    const result = await deleteDocumentAction(id);
    if (result.success) {
      toast.success("Đã xóa");
      if (selectedId === id) setSelectedId(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleSaved() {
    setIsCreating(false);
    router.refresh();
  }

  return (
    <div className="flex h-[calc(100vh-48px)] gap-0 px-10 py-6">
      {/* Master — document list */}
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
          panelOpen ? "flex-3" : "flex-1",
        )}
      >
        {/* Toolbar — single row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            ref={filterContainerRef}
            className="relative flex items-center gap-1 rounded-xl bg-slate-100/80 p-1"
          >
            {/* Sliding indicator */}
            <div
              className={cn(
                "pointer-events-none absolute rounded-lg bg-white shadow-sm",
                filterReady
                  ? "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  : "",
              )}
              style={{
                left: filterIndicator.left,
                width: filterIndicator.width,
                top: 4,
                bottom: 4,
              }}
            />
            {tabs.map((tab, i) => (
              <button
                key={tab.value}
                ref={(el) => {
                  filterTabRefs.current[i] = el;
                }}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "relative z-10 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                  activeTab === tab.value
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-700",
                )}
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

        {/* List */}
        {documents.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-sm text-slate-400">
                  Không tìm thấy tài liệu
                </div>
              ) : (
                <div className="space-y-1">
                  {paginated.map((doc) => {
                    const tid = resolveTemplateId(doc);
                    const template = getTemplateEntry(tid);
                    const data = doc.data as DocumentData;
                    const total = data?.items
                      ? calculateTotal(data.items)
                      : 0;
                    const isSelected = doc.id === selectedId;
                    const docCompany = companies.find((c) => c.id === doc.companyId);

                    return (
                      <div
                        key={doc.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelect(doc.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect(doc.id); }}
                        className={cn(
                          "group relative flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-all",
                          isSelected
                            ? "bg-indigo-50 ring-1 ring-indigo-200"
                            : "hover:bg-slate-50",
                        )}
                      >
                        {/* Type indicator */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                            template?.color.dotColor ?? "bg-slate-500",
                          )}
                        >
                          {template?.shortLabel ?? "?"}
                        </div>

                        {/* Main info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-900">
                              {doc.documentNumber}
                            </span>
                            <span className={cn(
                              "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                              template?.color.badgeBg ?? "bg-slate-100",
                              template?.color.badgeText ?? "text-slate-500",
                            )}>
                              {template?.name ?? "Tài liệu"}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {data?.customerName ?? "Chưa có khách hàng"}
                          </p>
                        </div>

                        {/* Amount + date + overlay actions */}
                        <div className="relative shrink-0">
                          {/* Amount — hidden on hover */}
                          <div className="w-24 text-right transition-opacity group-hover:opacity-0">
                            <p className="text-[13px] font-semibold text-slate-700">
                              {total > 0 ? formatCurrency(total) : "—"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {data?.date ? data.date.split("-").reverse().join("/") : formatDate(doc.createdAt)}
                            </p>
                          </div>
                          {/* Actions — overlay, shown on hover, right-aligned expanding left */}
                          <div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                            <Link
                              href={`/documents/${doc.id}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-slate-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                              title="Mở trang xem trước PDF"
                            >
                              <Eye className="h-3 w-3" />
                              {!panelOpen && <span>Xem trước</span>}
                            </Link>
                            <div onClick={(e) => e.stopPropagation()}>
                              <DocumentPdfDownloadButton
                                document={doc}
                                company={{
                                  name: docCompany?.name ?? "",
                                  address: docCompany?.address,
                                  phone: docCompany?.phone,
                                  taxCode: docCompany?.taxCode,
                                  logoUrl: docCompany?.logoUrl,
                                  headerLayout: docCompany?.headerLayout,
                                  driverName: docCompany?.driverName,
                                  vehicleId: docCompany?.vehicleId,
                                }}
                                columns={template?.columns ?? []}
                                showTotal={template?.showTotal ?? false}
                                title={template?.name ?? "Tài liệu"}
                                signatureLabels={template?.signatureLabels ?? []}
                                templateId={tid}
                                size="row"
                                showLabel={!panelOpen}
                              />
                            </div>
                            <button
                              onClick={(e) => handleRowDuplicate(e, doc.id)}
                              className="flex cursor-pointer items-center gap-1 rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-slate-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                              title="Sao chép tài liệu này"
                            >
                              <Copy className="h-3 w-3" />
                              {!panelOpen && <span>Sao chép</span>}
                            </button>
                            <DeleteConfirmDialog
                              name={template?.name ?? "Tài liệu"}
                              onConfirm={() => handleRowDelete(doc.id)}
                              trigger={
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-red-200 hover:bg-white hover:text-red-500 hover:shadow-sm"
                                  title="Xóa tài liệu này"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  {!panelOpen && <span>Xóa</span>}
                                </button>
                              }
                            />
                          </div>
                        </div>

                        {/* Arrow hint */}
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-all duration-200",
                            isSelected
                              ? "text-indigo-400"
                              : "text-slate-300 group-hover:text-slate-400",
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Detail — preview panel with slide animation */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
          panelOpen
            ? "ml-6 flex-2 opacity-100"
            : "ml-0 w-0 flex-0 opacity-0",
        )}
      >
        {isCreating && (
          <DocumentDetailEditPanel
            key="create"
            products={products}
            customers={customers}
            companies={companies}
            onClose={handleClose}
            onSaved={handleSaved}
          />
        )}
        {selectedDoc && !isCreating && (
          <DocumentDetailEditPanel
            key={selectedDoc.id}
            doc={selectedDoc}
            products={products}
            customers={customers}
            companies={companies}
            onClose={handleClose}
            onSaved={handleSaved}
            onRegisterAutoSave={(fn) => { panelAutoSaveRef.current = fn; }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Sub components ─── */

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
      <p className="text-[11px] text-slate-400">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}
      </p>
      <div className="flex gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
        >
          ←
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
        <FileText className="h-7 w-7 text-indigo-500" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-900">Chưa có tài liệu nào</p>
        <p className="mt-1 text-sm text-slate-400">
          Tạo báo giá, phiếu xuất kho hoặc phiếu giao hàng đầu tiên
        </p>
      </div>
      <Button
        onClick={onAdd}
        className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Tạo tài liệu
      </Button>
    </div>
  );
}
