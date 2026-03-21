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
import { deleteCustomerAction } from "@/actions/customer.actions";
import { CustomerDialog } from "./customer-dialog";
import type { CustomerRow } from "@/services/customer.service";

type CustomerTableProps = {
  customers: CustomerRow[];
};

export function CustomerTable({ customers }: CustomerTableProps) {
  const [editCustomer, setEditCustomer] = useState<CustomerRow | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;
    const result = await deleteCustomerAction(id);
    if (result.success) {
      toast.success("Đã xóa khách hàng");
    } else {
      toast.error(result.error);
    }
  }

  if (customers.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-400">Chưa có khách hàng nào.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tên khách hàng</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Địa chỉ</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">SĐT</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.id} className="group">
              <TableCell className="text-[13px] font-medium">{c.name}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{c.address ?? "—"}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{c.phone ?? "—"}</TableCell>
              <TableCell className="text-[13px] text-slate-500">{c.email ?? "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditCustomer(c)} className="text-slate-500 hover:text-indigo-600">Sửa</button>
                  <button onClick={() => handleDelete(c.id, c.name)} className="text-red-400 hover:text-red-600">Xóa</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CustomerDialog
        open={!!editCustomer}
        onOpenChange={(open) => !open && setEditCustomer(null)}
        customer={editCustomer}
      />
    </>
  );
}
