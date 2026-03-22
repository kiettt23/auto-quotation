"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Entry {
  id: number;
  key: string;
  val: string;
}

export interface KeyValueEditorRef {
  getData: () => Record<string, string | number>;
}

interface Props {
  defaultValue: Record<string, string | number>;
  onDirtyChange?: (dirty: boolean) => void;
}

function toEntries(data: Record<string, string | number>): Entry[] {
  return Object.entries(data).map(([key, val], i) => ({
    id: i,
    key,
    val: String(val),
  }));
}

/** Key-value editor — fully uncontrolled, parent reads via ref.getData() */
export const KeyValueEditor = forwardRef<KeyValueEditorRef, Props>(
  function KeyValueEditor({ defaultValue, onDirtyChange }, ref) {
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
            <Input
              value={entry.key}
              onChange={(e) => updateKey(entry.id, e.target.value)}
              placeholder="Tên field"
              className="h-8 w-1/3 text-xs"
            />
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
