"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Placeholder } from "@/lib/validations/doc-template-schemas";

type Props = {
  placeholders: Placeholder[];
  values: Record<string, string>;
  onChange: (cellRef: string, value: string) => void;
};

/** Renders form inputs for each template placeholder based on its type */
export function DocEntryFieldInputs({ placeholders, values, onChange }: Props) {
  if (placeholders.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {placeholders.map((p) => (
        <div key={p.cellRef} className="space-y-1.5">
          <Label htmlFor={`field-${p.cellRef}`}>
            {p.label}
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
              ({p.cellRef})
            </span>
          </Label>
          <Input
            id={`field-${p.cellRef}`}
            type={p.type === "number" ? "number" : p.type === "date" ? "date" : "text"}
            value={values[p.cellRef] ?? ""}
            onChange={(e) => onChange(p.cellRef, e.target.value)}
            placeholder={p.label}
            step={p.type === "number" ? "any" : undefined}
          />
        </div>
      ))}
    </div>
  );
}
