"use client";

import { FileUp, LayoutTemplate } from "lucide-react";
import { PRESET_TEMPLATES, type PresetTemplate } from "@/lib/preset-templates";

export type SourceChoice =
  | { type: "upload" }
  | { type: "preset"; preset: PresetTemplate };

type Props = {
  onSelect: (choice: SourceChoice) => void;
};

export function DocTemplateSourceStep({ onSelect }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Chọn cách tạo mẫu tài liệu:
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Preset templates */}
        {PRESET_TEMPLATES.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect({ type: "preset", preset })}
            className="flex flex-col items-start gap-2 rounded-xl border-2 border-muted-foreground/25 p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <LayoutTemplate className="size-8 text-primary" />
            <div>
              <p className="font-medium">{preset.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {preset.description}
              </p>
            </div>
            <span className="mt-auto text-xs text-primary font-medium">
              Mẫu có sẵn
            </span>
          </button>
        ))}

        {/* Upload custom file */}
        <button
          type="button"
          onClick={() => onSelect({ type: "upload" })}
          className="flex flex-col items-start gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <FileUp className="size-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Tải lên file</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload file Excel (.xlsx) hoặc PDF (.pdf) để tự cấu hình
            </p>
          </div>
          <span className="mt-auto text-xs text-muted-foreground font-medium">
            Tùy chỉnh
          </span>
        </button>
      </div>
    </div>
  );
}
