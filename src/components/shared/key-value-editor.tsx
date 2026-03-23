"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Trash2, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Entry {
  id: number;
  key: string;
  val: string;
}

/** Predefined key option for combobox mode */
export interface KeyOption {
  key: string;
  label: string;
}

export interface KeyValueEditorRef {
  getData: () => Record<string, string | number>;
}

interface Props {
  defaultValue: Record<string, string | number>;
  onDirtyChange?: (dirty: boolean) => void;
  /** When provided, key input becomes a combobox with suggestions */
  keyOptions?: KeyOption[];
}

function toEntries(data: Record<string, string | number>): Entry[] {
  return Object.entries(data).map(([key, val], i) => ({
    id: i,
    key,
    val: String(val),
  }));
}

/** Combobox for selecting a key from predefined options */
function KeyCombobox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: KeyOption[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.label === value || o.key === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-40 justify-between px-2.5 text-xs font-normal"
        >
          <span className="truncate">
            {selected ? selected.label : value || "Chọn field..."}
          </span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        <div className="flex flex-col">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                onChange(opt.label);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-slate-100",
                (value === opt.label || value === opt.key) && "bg-indigo-50 text-indigo-700",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Key-value editor — fully uncontrolled, parent reads via ref.getData() */
export const KeyValueEditor = forwardRef<KeyValueEditorRef, Props>(
  function KeyValueEditor({ defaultValue, onDirtyChange, keyOptions }, ref) {
    const [entries, setEntries] = useState<Entry[]>(() => toEntries(defaultValue));
    const nextId = useRef(entries.length);
    const initialJson = useRef(JSON.stringify(defaultValue));

    useImperativeHandle(ref, () => ({
      getData() {
        const out: Record<string, string | number> = {};
        for (const e of entries) {
          if (e.key.trim()) out[e.key.trim()] = e.val;
        }
        return out;
      },
    }));

    function checkDirty(updated: Entry[]) {
      const out: Record<string, string | number> = {};
      for (const e of updated) {
        if (e.key.trim()) out[e.key.trim()] = e.val;
      }
      onDirtyChange?.(JSON.stringify(out) !== initialJson.current);
    }

    function updateKey(id: number, newKey: string) {
      setEntries((prev) => {
        const updated = prev.map((e) => (e.id === id ? { ...e, key: newKey } : e));
        checkDirty(updated);
        return updated;
      });
    }

    function updateValue(id: number, newVal: string) {
      setEntries((prev) => {
        const updated = prev.map((e) => (e.id === id ? { ...e, val: newVal } : e));
        checkDirty(updated);
        return updated;
      });
    }

    function addEntry() {
      nextId.current += 1;
      setEntries((prev) => {
        const updated = [...prev, { id: nextId.current, key: "", val: "" }];
        checkDirty(updated);
        return updated;
      });
    }

    function removeEntry(id: number) {
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        checkDirty(updated);
        return updated;
      });
    }

    return (
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2">
            {keyOptions ? (
              <KeyCombobox
                value={entry.key}
                onChange={(v) => updateKey(entry.id, v)}
                options={keyOptions}
              />
            ) : (
              <Input
                value={entry.key}
                onChange={(e) => updateKey(entry.id, e.target.value)}
                placeholder="Tên field"
                className="h-8 w-40 shrink-0 text-xs"
              />
            )}
            <Input
              value={entry.val}
              onChange={(e) => updateValue(entry.id, e.target.value)}
              placeholder="Giá trị"
              className="h-8 flex-1 text-xs"
            />
            <button
              type="button"
              onClick={() => removeEntry(entry.id)}
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
  },
);
