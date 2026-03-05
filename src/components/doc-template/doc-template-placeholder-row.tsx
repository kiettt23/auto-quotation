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
import type { PlaceholderDraft } from "./doc-template-configure-step";

type Props = {
  item: PlaceholderDraft;
  index: number;
  onChange: (index: number, updated: Partial<PlaceholderDraft>) => void;
};

/** Single row for configuring one detected formula cell as a placeholder. */
export function DocTemplatePlaceholderRow({ item, index, onChange }: Props) {
  return (
    <div className="flex items-start gap-3 py-2 border-b last:border-0">
      <Checkbox
        id={`ph-include-${index}`}
        checked={item.included}
        onCheckedChange={(checked) => onChange(index, { included: !!checked })}
        className="mt-1"
      />
      <div className="grid flex-1 gap-2 sm:grid-cols-[80px_1fr_120px]">
        {/* Cell ref - read only */}
        <div>
          <Label className="text-xs text-muted-foreground">Ô</Label>
          <p className="h-9 flex items-center font-mono text-sm px-1">{item.cellRef}</p>
        </div>

        {/* Label editable */}
        <div>
          <Label htmlFor={`ph-label-${index}`} className="text-xs text-muted-foreground">
            Nhãn
          </Label>
          <Input
            id={`ph-label-${index}`}
            value={item.label}
            onChange={(e) => onChange(index, { label: e.target.value })}
            disabled={!item.included}
            placeholder="Nhập nhãn..."
            className="h-9"
          />
        </div>

        {/* Type select */}
        <div>
          <Label className="text-xs text-muted-foreground">Kiểu</Label>
          <Select
            value={item.type}
            onValueChange={(val) => onChange(index, { type: val as PlaceholderDraft["type"] })}
            disabled={!item.included}
          >
            <SelectTrigger className="h-9 w-full">
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

      {/* Formula hint */}
      {item.originalFormula && (
        <p className="hidden sm:block text-xs text-muted-foreground mt-6 max-w-[160px] truncate" title={item.originalFormula}>
          {item.originalFormula}
        </p>
      )}
    </div>
  );
}
