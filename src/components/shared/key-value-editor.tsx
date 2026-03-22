"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  value: Record<string, string | number>;
  onChange: (data: Record<string, string | number>) => void;
}

/** Simple key-value pair editor for customData fields */
export function KeyValueEditor({ value, onChange }: Props) {
  const entries = Object.entries(value);

  function updateKey(oldKey: string, newKey: string) {
    if (newKey === oldKey) return;
    const updated = { ...value };
    const val = updated[oldKey];
    delete updated[oldKey];
    updated[newKey] = val;
    onChange(updated);
  }

  function updateValue(key: string, val: string) {
    onChange({ ...value, [key]: val });
  }

  function addEntry() {
    const key = `field_${entries.length + 1}`;
    onChange({ ...value, [key]: "" });
  }

  function removeEntry(key: string) {
    const updated = { ...value };
    delete updated[key];
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center gap-2">
          <Input
            value={key}
            onChange={(e) => updateKey(key, e.target.value)}
            placeholder="Tên field"
            className="h-8 w-1/3 text-xs"
          />
          <Input
            value={String(val)}
            onChange={(e) => updateValue(key, e.target.value)}
            placeholder="Giá trị"
            className="h-8 flex-1 text-xs"
          />
          <button
            type="button"
            onClick={() => removeEntry(key)}
            className="cursor-pointer rounded p-1 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addEntry}
        className="h-7 text-xs text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="mr-1 h-3 w-3" />
        Thêm field
      </Button>
    </div>
  );
}
