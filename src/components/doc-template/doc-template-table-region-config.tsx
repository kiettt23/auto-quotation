"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TableColumnDraft, TableRegionDraft } from "./doc-template-configure-step";

type Props = {
  tableRegion: TableRegionDraft;
  onChange: (updated: Partial<TableRegionDraft>) => void;
};

/** Configuration section for the repeating-row table region. */
export function DocTemplateTableRegionConfig({ tableRegion, onChange }: Props) {
  function updateColumn(index: number, patch: Partial<TableColumnDraft>) {
    const updated = tableRegion.columns.map((col, i) =>
      i === index ? { ...col, ...patch } : col
    );
    onChange({ columns: updated });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="table-enabled"
          checked={tableRegion.enabled}
          onCheckedChange={(checked) => onChange({ enabled: !!checked })}
        />
        <Label htmlFor="table-enabled" className="cursor-pointer">
          Bật vùng bảng dữ liệu lặp
        </Label>
      </div>

      {tableRegion.enabled && (
        <div className="pl-6 space-y-4">
          {/* Start row */}
          <div className="flex items-center gap-3">
            <Label htmlFor="table-start-row" className="w-28 shrink-0 text-sm">
              Hàng bắt đầu
            </Label>
            <Input
              id="table-start-row"
              type="number"
              min={1}
              value={tableRegion.startRow}
              onChange={(e) => onChange({ startRow: parseInt(e.target.value) || 1 })}
              className="w-24 h-9"
            />
          </div>

          {/* Columns */}
          {tableRegion.columns.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Cột trong bảng</p>
              <div className="space-y-2">
                {tableRegion.columns.map((col, i) => (
                  <div key={col.col} className="flex items-center gap-2">
                    <Checkbox
                      checked={col.included}
                      onCheckedChange={(checked) => updateColumn(i, { included: !!checked })}
                    />
                    <span className="w-8 font-mono text-sm text-center">{col.col}</span>
                    <Input
                      value={col.label}
                      onChange={(e) => updateColumn(i, { label: e.target.value })}
                      disabled={!col.included}
                      placeholder="Nhãn cột..."
                      className="flex-1 h-8"
                    />
                    <Select
                      value={col.type}
                      onValueChange={(val) => updateColumn(i, { type: val as TableColumnDraft["type"] })}
                      disabled={!col.included}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Văn bản</SelectItem>
                        <SelectItem value="number">Số</SelectItem>
                        <SelectItem value="date">Ngày</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tableRegion.columns.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Chọn một sheet để tự động phát hiện cột.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
