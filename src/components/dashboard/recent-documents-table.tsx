"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  documentTypeConfig,
  calculateTotal,
  formatCurrency,
  formatDate,
} from "@/lib/utils/document-helpers";
import type { DocumentRow } from "@/services/document.service";
import type { DocumentType } from "@/db/schema/document";
import type { DocumentData } from "@/lib/types/document-data";

const tabs = [
  { label: "Tất cả", value: "all" },
  { label: "Báo giá", value: "QUOTATION" },
  { label: "Giao hàng", value: "DELIVERY_ORDER" },
  { label: "Xuất kho", value: "WAREHOUSE_EXPORT" },
] as const;

type Props = { documents: DocumentRow[] };

export function RecentDocumentsTable({ documents }: Props) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = documents;
    if (activeTab !== "all") {
      list = list.filter((d) => d.type === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) => {
        const data = d.data as DocumentData;
        return (
          d.documentNumber.toLowerCase().includes(q) ||
          data?.customerName?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [documents, activeTab, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-56 rounded-[10px] border-slate-200 bg-slate-50 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Số tài liệu</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Loại</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Khách hàng</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tổng tiền</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ngày tạo</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-400">
                Không có tài liệu nào
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((doc) => {
              const config = documentTypeConfig[doc.type as DocumentType];
              const data = doc.data as DocumentData;
              const total = data?.items ? calculateTotal(data.items) : 0;

              return (
                <TableRow key={doc.id} className="group">
                  <TableCell className="text-[13px] font-semibold text-indigo-600">
                    <Link href={`/documents/${doc.id}`} className="hover:underline">
                      {doc.documentNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[13px]">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${config?.dotColor ?? "bg-slate-500"}`} />
                      {config?.label ?? doc.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-[13px] text-slate-600">
                    {data?.customerName ?? "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-slate-600">
                    {total > 0 ? formatCurrency(total) : "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-slate-500">
                    {formatDate(doc.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                      <Link href={`/documents/${doc.id}`} className="text-slate-500 hover:text-indigo-600">Xem</Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
