"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCompanyAction } from "@/actions/company.actions";
import { CompanyDialog } from "./company-dialog";
import type { CompanyRow } from "@/services/company.service";

type CompanyTableProps = {
  companies: CompanyRow[];
};

export function CompanyTable({ companies }: CompanyTableProps) {
  const [editCompany, setEditCompany] = useState<CompanyRow | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;
    const result = await deleteCompanyAction(id);
    if (result.success) {
      toast.success("Đã xóa công ty");
    } else {
      toast.error(result.error);
    }
  }

  if (companies.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-400">Chưa có công ty nào.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tên công ty</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Địa chỉ</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">SĐT</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mã số thuế</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tài xế</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((c) => (
            <TableRow key={c.id} className="group">
              <TableCell className="text-[13px] font-medium">{c.name}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{c.address ?? "—"}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{c.phone ?? "—"}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{c.taxCode ?? "—"}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{c.driverName ?? "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditCompany(c)} className="text-slate-500 hover:text-indigo-600">Sửa</button>
                  <button onClick={() => handleDelete(c.id, c.name)} className="text-red-400 hover:text-red-600">Xóa</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CompanyDialog
        open={!!editCompany}
        onOpenChange={(open) => !open && setEditCompany(null)}
        company={editCompany}
      />
    </>
  );
}
