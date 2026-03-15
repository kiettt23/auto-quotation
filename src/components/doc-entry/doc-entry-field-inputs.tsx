"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerAutocompleteCombobox } from "@/components/shared/customer-autocomplete-combobox";
import type { Placeholder } from "@/lib/validations/doc-template-schemas";
import type { PresetPlaceholder } from "@/lib/preset-templates/types";

type Props = {
  placeholders: Placeholder[];
  values: Record<string, string>;
  onChange: (fieldKey: string, value: string) => void;
  /** Callback for autocomplete: sets main field + linked fields */
  onAutocompleteSelect?: (fieldKey: string, value: string, linkedValues?: Record<string, string>) => void;
  /** Preset placeholder metadata (for dataSource/linkedFields) */
  presetPlaceholders?: PresetPlaceholder[];
};

/** Renders form inputs for each template placeholder, with optional autocomplete */
export function DocEntryFieldInputs({ placeholders, values, onChange, onAutocompleteSelect, presetPlaceholders }: Props) {
  if (placeholders.length === 0) return null;

  /** Find preset metadata for a placeholder by matching cellRef to preset key */
  function getPresetMeta(cellRef: string): PresetPlaceholder | undefined {
    return presetPlaceholders?.find((p) => p.key === cellRef);
  }

  function handleCustomerSelect(cellRef: string, meta: PresetPlaceholder, customer: Record<string, string>) {
    if (!onAutocompleteSelect) return;
    const linkedValues: Record<string, string> = {};
    if (meta.linkedFields) {
      Object.entries(meta.linkedFields).forEach(([sourceField, targetKey]) => {
        linkedValues[targetKey] = customer[sourceField] ?? "";
      });
    }
    onAutocompleteSelect(cellRef, customer.name, linkedValues);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {placeholders.map((field) => {
        const meta = getPresetMeta(field.cellRef);
        const hasCustomerAutocomplete = meta?.dataSource === "customer" && onAutocompleteSelect;

        return (
          <div key={field.cellRef} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`field-${field.cellRef}`}>{field.label}</Label>
              {hasCustomerAutocomplete && (
                <CustomerAutocompleteCombobox
                  onSelect={(c) => handleCustomerSelect(field.cellRef, meta!, c as unknown as Record<string, string>)}
                />
              )}
            </div>
            <Input
              id={`field-${field.cellRef}`}
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              value={values[field.cellRef] ?? ""}
              onChange={(e) => onChange(field.cellRef, e.target.value)}
              placeholder={field.label}
              step={field.type === "number" ? "any" : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
