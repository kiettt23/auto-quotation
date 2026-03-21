"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  documentTypeConfig,
  calculateTotal,
  formatCurrency,
  formatDate,
} from "@/lib/utils/document-helpers";
import { cn } from "@/lib/utils/cn";
import { DocumentDetailEditPanel } from "./document-detail-edit-panel";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentType } from "@/db/schema/document";
import type { DocumentData } from "@/lib/types/document-data";
import type { ProductWithRelations } from "@/services/product.service";
import type { CustomerRow } from "@/services/customer.service";
import type { DocumentTypeRow } from "@/services/document-type.service";
import type { CompanyRow } from "@/services/company.service";

const PAGE_SIZE = 20;

const tabs = [
  { label: "Tất cả", value: "all" },
  { label: "Báo giá", value: "QUOTATION" },
  { label: "Giao hàng", value: "DELIVERY_ORDER" },
  { label: "Xuất kho", value: "WAREHOUSE_EXPORT" },
];

export function DocumentListClient({
  documents,
  products,
  customers,
  documentTypes,
  companies,
}: {
  documents: DocumentRow[];
  products: ProductWithRelations[];
  customers: CustomerRow[];
  documentTypes: DocumentTypeRow[];
  companies: CompanyRow[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      list = list.filter((d) => d.type === activeTab);
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

  function handleDeleted(id: string) {
    if (selectedId === id) setSelectedId(null);
    router.refresh();
  }

  return (
    <div className="flex h-[calc(100vh-48px)] gap-0 px-10 py-6">
      {/* Master — document list */}
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
          selectedDoc ? "flex-[3]" : "flex-1",
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
          <Link
            href="/documents/new"
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Plus className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* List */}
        {documents.length === 0 ? (
          <EmptyState />
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
                    const config =
                      documentTypeConfig[doc.type as DocumentType];
                    const data = doc.data as DocumentData;
                    const total = data?.items
                      ? calculateTotal(data.items)
                      : 0;
                    const isSelected = doc.id === selectedId;

                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() =>
                          setSelectedId((prev) =>
                            prev === doc.id ? null : doc.id,
                          )
                        }
                        className={cn(
                          "group flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-all",
                          isSelected
                            ? "bg-indigo-50 ring-1 ring-indigo-200"
                            : "hover:bg-slate-50",
                        )}
                      >
                        {/* Type indicator */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                            doc.type === "QUOTATION"
                              ? "bg-indigo-500"
                              : doc.type === "DELIVERY_ORDER"
                                ? "bg-emerald-500"
                                : "bg-amber-500",
                          )}
                        >
                          {config?.prefix ?? "?"}
                        </div>

                        {/* Main info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-900">
                              {doc.documentNumber}
                            </span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              {config?.label ?? doc.type}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {data?.customerName ?? "Chưa có khách hàng"}
                          </p>
                        </div>

                        {/* Amount + date */}
                        <div className="shrink-0 text-right">
                          <p className="text-[13px] font-semibold text-slate-700">
                            {total > 0 ? formatCurrency(total) : "—"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {formatDate(doc.createdAt)}
                          </p>
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
                      </button>
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
          selectedDoc
            ? "ml-6 flex-[2] opacity-100"
            : "ml-0 w-0 flex-[0] opacity-0",
        )}
      >
        {selectedDoc && (
          <DocumentDetailEditPanel
            key={selectedDoc.id}
            doc={selectedDoc}
            products={products}
            customers={customers}
            companies={companies}
            documentTypes={documentTypes}
            onClose={() => setSelectedId(null)}
            onSaved={() => router.refresh()}
            onDeleted={handleDeleted}
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

function EmptyState() {
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
        asChild
        className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
      >
        <Link href="/documents/new">
          <Plus className="mr-1.5 h-4 w-4" />
          Tạo tài liệu
        </Link>
      </Button>
    </div>
  );
}
