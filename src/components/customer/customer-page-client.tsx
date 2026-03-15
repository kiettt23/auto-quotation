"use client";

import { useState } from "react";
import { CustomerToolbar } from "./customer-toolbar";
import { CustomerDataTable } from "./customer-data-table";
import { CustomerDialog } from "./customer-dialog";
import type { CustomerWithDocCount } from "@/services/customer-service";

type Props = {
  customers: CustomerWithDocCount[];
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
    useState<CustomerWithDocCount | null>(null);

  function handleAdd() {
    setEditingCustomer(null);
    setDialogOpen(true);
  }

  function handleEdit(customer: CustomerWithDocCount) {
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
