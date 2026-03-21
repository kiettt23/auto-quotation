"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import { RecentDocumentsTable } from "@/components/dashboard/recent-documents-table";
import type { DashboardStats } from "@/services/stats.service";
import type { DocumentRow } from "@/services/document.service";

type Props = {
  stats: DashboardStats;
  documents: DocumentRow[];
  userName: string;
};

export function DashboardClient({ stats, documents, userName }: Props) {
  const firstName = userName.split(" ").pop() ?? userName;
  const dateStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-7 py-6 lg:py-10">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Xin chào, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{dateStr}</p>
        </div>
        <div className="flex gap-2.5">
          <Button asChild className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Link href="/documents/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo tài liệu
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <StatCardGrid data={stats} />

      {/* Recent Documents */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Tài liệu gần đây</h2>
          <Button variant="ghost" size="sm" asChild className="text-xs text-slate-500">
            <Link href="/documents">Xem tất cả →</Link>
          </Button>
        </div>
        <RecentDocumentsTable documents={documents} />
      </div>
    </div>
  );
}
