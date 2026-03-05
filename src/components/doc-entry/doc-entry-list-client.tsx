"use client";

import { useState } from "react";
import { Plus, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
};

/** Client component: lists doc entries with template filter and create action */
export function DocEntryListClient({ entries, templates }: Props) {
  const [filterTemplateId, setFilterTemplateId] = useState<string>("all");
  const [pickerOpen, setPickerOpen] = useState(false);

  const filtered =
    filterTemplateId === "all"
      ? entries
      : entries.filter((e) => e.template.id === filterTemplateId);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Select value={filterTemplateId} onValueChange={setFilterTemplateId}>
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

        <Button onClick={() => setPickerOpen(true)}>
          <Plus className="mr-2 size-4" />
          Tạo chứng từ
        </Button>
      </div>

      {/* Content */}
      {entries.length === 0 ? (
        <EmptyState
          icon={FileX}
          title="Chưa có chứng từ"
          description="Tạo chứng từ đầu tiên từ một mẫu đã định nghĩa"
          actionLabel="Tạo chứng từ"
          actionHref="#"
        />
      ) : (
        <DocEntryTable entries={filtered} />
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
