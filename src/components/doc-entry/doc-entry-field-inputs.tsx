"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Placeholder } from "@/lib/validations/doc-template-schemas";

type Props = {
  placeholders: Placeholder[];
  values: Record<string, string>;
  onChange: (fieldKey: string, value: string) => void;
};

/** Renders form inputs for each template placeholder */
export function DocEntryFieldInputs({ placeholders, values, onChange }: Props) {
  if (placeholders.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {placeholders.map((field) => (
        <div key={field.cellRef} className="space-y-1.5">
          <Label htmlFor={`field-${field.cellRef}`}>{field.label}</Label>
          <Input
            id={`field-${field.cellRef}`}
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            value={values[field.cellRef] ?? ""}
            onChange={(e) => onChange(field.cellRef, e.target.value)}
            placeholder={field.label}
            step={field.type === "number" ? "any" : undefined}
          />
        </div>
      ))}
    </div>
  );
}
