"use client";

import type { DocumentTypeRow } from "@/services/document-type.service";

interface Props {
  types: DocumentTypeRow[];
  selectedId: string;
  onSelect: (typeId: string) => void;
}

/** Badge color cycling for document types */
const BADGE_STYLES = [
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
];

export function DocumentTypeSelector({ types, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      {types.map((type, i) => {
        const isActive = selectedId === type.id;
        const badge = BADGE_STYLES[i % BADGE_STYLES.length];

        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelect(type.id)}
            className={`flex w-44 flex-col items-center gap-2 rounded-xl border-2 bg-white p-5 transition-colors ${
              isActive
                ? "border-indigo-500 ring-1 ring-indigo-500"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span
              className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}
            >
              {type.shortLabel}
            </span>
            <span
              className={`text-sm font-medium ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {type.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
