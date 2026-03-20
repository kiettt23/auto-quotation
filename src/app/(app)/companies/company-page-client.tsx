"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Công ty</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm công ty
        </Button>
      </div>

      <Input
        placeholder="Tìm công ty..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <CompanyTable companies={filtered} />

      <CompanyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
