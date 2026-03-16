"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, FileX, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { DocEntryTable, type EntryRow } from "./doc-entry-table";
import { DocEntryTemplatePickerDialog } from "./doc-entry-template-picker-dialog";

type TemplateOption = {
  id: string;
  name: string;
  _count: { entries: number };
};

type Props = {
  entries: EntryRow[];
  templates: TemplateOption[];
  currentPage: number;
  pageSize: number;
  currentTemplateId?: string;
  currentSearch?: string;
};

/** Client component: lists doc entries with server-side pagination and template filter */
export function DocEntryListClient({
  entries,
  templates,
  currentPage,
  pageSize,
  currentTemplateId,
  currentSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentSearch ?? "");

  const filterTemplateId = currentTemplateId ?? "all";
  const hasNextPage = entries.length >= pageSize;

  /** Build URL with updated search params */
  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.push(`/documents?${params.toString()}`);
  }

  function handleTemplateFilter(value: string) {
    navigate({ templateId: value === "all" ? undefined : value, page: undefined });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-[200px]">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm số tài liệu..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate({ search: searchInput.trim() || undefined, page: undefined });
                }
              }}
            />
          </div>
          <Select value={filterTemplateId} onValueChange={handleTemplateFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Lọc theo mẫu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mẫu</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setPickerOpen(true)}>
          <Plus className="mr-2 size-4" />
          Tạo tài liệu
        </Button>
      </div>

      {/* Content */}
      {entries.length === 0 && currentPage === 1 ? (
        <EmptyState
          icon={FileX}
          title="Chưa có tài liệu"
          description="Tạo tài liệu đầu tiên từ một mẫu đã định nghĩa"
          actionLabel="Tạo tài liệu"
          onAction={() => setPickerOpen(true)}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={FileX}
          title="Không tìm thấy tài liệu"
          description="Không có tài liệu nào ở trang này"
          actionLabel="Về trang đầu"
          onAction={() => navigate({ page: undefined })}
        />
      ) : (
        <>
          <DocEntryTable entries={entries} />

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => navigate({ page: currentPage > 2 ? String(currentPage - 1) : undefined })}
            >
              <ChevronLeft className="mr-1 size-4" />
              Trước
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Trang {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => navigate({ page: String(currentPage + 1) })}
            >
              Sau
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </>
      )}

      {/* Template picker dialog */}
      <DocEntryTemplatePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        templates={templates}
      />
    </div>
  );
}
