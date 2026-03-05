"use client";

import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PdfRegionDraft } from "./doc-template-configure-step";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  regions: PdfRegionDraft[];
  onChange: (regions: PdfRegionDraft[]) => void;
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function newRegion(): PdfRegionDraft {
  return {
    id: `region_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    x: 0,
    y: 0,
    width: 150,
    height: 20,
    fontSize: 10,
    type: "text",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocTemplatePdfRegionEditor({ regions, onChange }: Props) {
  function handleAdd() {
    onChange([...regions, newRegion()]);
  }

  function handleRemove(index: number) {
    onChange(regions.filter((_, i) => i !== index));
  }

  function handleChange(index: number, patch: Partial<PdfRegionDraft>) {
    onChange(regions.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Vùng văn bản PDF ({regions.length})</p>
        <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
          <Plus className="mr-1 size-3" />
          Thêm vùng
        </Button>
      </div>

      {regions.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
          Chưa có vùng nào. Nhấn &quot;Thêm vùng&quot; để bắt đầu.
        </p>
      )}

      <div className="space-y-3">
        {regions.map((region, index) => (
          <RegionRow
            key={region.id}
            region={region}
            index={index}
            onChange={(patch) => handleChange(index, patch)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Single region row ────────────────────────────────────────────────────────

type RegionRowProps = {
  region: PdfRegionDraft;
  index: number;
  onChange: (patch: Partial<PdfRegionDraft>) => void;
  onRemove: () => void;
};

function RegionRow({ region, index, onChange, onRemove }: RegionRowProps) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">Vùng #{index + 1}</span>
        <Button type="button" size="icon" variant="ghost" className="size-6" onClick={onRemove}>
          <Trash2 className="size-3 text-destructive" />
        </Button>
      </div>

      {/* Label and type */}
      <div className="grid grid-cols-[1fr_120px] gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nhãn</Label>
          <Input
            value={region.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Tên trường..."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Kiểu</Label>
          <Select
            value={region.type}
            onValueChange={(val) => onChange({ type: val as PdfRegionDraft["type"] })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Văn bản</SelectItem>
              <SelectItem value="number">Số</SelectItem>
              <SelectItem value="date">Ngày</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-5 gap-2">
        {(["x", "y", "width", "height", "fontSize"] as const).map((field) => (
          <div key={field} className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {field === "fontSize" ? "Cỡ chữ" : field.toUpperCase()}
            </Label>
            <Input
              type="number"
              value={region[field]}
              onChange={(e) => onChange({ [field]: parseFloat(e.target.value) || 0 })}
              className="h-8 text-sm px-2"
              step={field === "fontSize" ? 1 : 0.5}
              min={field === "width" || field === "height" || field === "fontSize" ? 1 : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
