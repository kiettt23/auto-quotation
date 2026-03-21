"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { CompanyTable } from "./company-table";
import { CompanyDialog } from "./company-dialog";
import type { CompanyRow } from "@/services/company.service";

type Props = {
  companies: CompanyRow[];
};

export function CompanyPageClient({ companies }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : companies;

  return (
    <div className="flex flex-col gap-7 p-6 lg:p-10">
      <PageHeader
        title="Công ty"
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm công ty
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm công ty..."
        />
        <CompanyTable companies={filtered} />
      </div>

      <CompanyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
