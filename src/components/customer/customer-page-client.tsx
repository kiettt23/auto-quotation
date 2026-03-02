"use client";

import { useState } from "react";
import { CustomerToolbar } from "./customer-toolbar";
import { CustomerDataTable } from "./customer-data-table";
import { CustomerDialog } from "./customer-dialog";

export type CustomerWithCount = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  _count: { quotes: number };
};

type Props = {
  customers: CustomerWithCount[];
  total: number;
  page: number;
  totalPages: number;
  currentSearch?: string;
};

export function CustomerPageClient({
  customers,
  total,
  page,
  totalPages,
  currentSearch,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerWithCount | null>(null);

  function handleAdd() {
    setEditingCustomer(null);
    setDialogOpen(true);
  }

  function handleEdit(customer: CustomerWithCount) {
    setEditingCustomer(customer);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <CustomerToolbar
        currentSearch={currentSearch}
        onAddCustomer={handleAdd}
      />
      <CustomerDataTable
        customers={customers}
        total={total}
        page={page}
        totalPages={totalPages}
        onEdit={handleEdit}
      />
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
      />
    </div>
  );
}
