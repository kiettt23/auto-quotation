"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
      <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
        <p className="text-sm text-slate-500">Chưa có khách hàng nào.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold">Tên khách hàng</TableHead>
              <TableHead className="font-semibold">Địa chỉ</TableHead>
              <TableHead className="font-semibold">SĐT</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-slate-500">
                  {c.address ?? "—"}
                </TableCell>
                <TableCell className="text-slate-500">
                  {c.phone ?? "—"}
                </TableCell>
                <TableCell className="text-slate-500">
                  {c.email ?? "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditCustomer(c)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(c.id, c.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CustomerDialog
        open={!!editCustomer}
        onOpenChange={(open) => !open && setEditCustomer(null)}
        customer={editCustomer}
      />
    </>
  );
}
