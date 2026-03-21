"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import type { CustomerRow } from "@/services/customer.service";

type Props = {
  customers: CustomerRow[];
};

export function CustomerPageClient({ customers }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  return (
    <div className="flex flex-col gap-7 p-6 lg:p-10">
      <PageHeader
        title="Khách hàng"
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm khách hàng
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm khách hàng..."
        />
        <CustomerTable customers={filtered} />
      </div>

      <CustomerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
