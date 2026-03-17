"use client";

import { documentTypeConfig } from "@/lib/utils/document-helpers";
import type { DocumentType } from "@/db/schema/document";

const types: DocumentType[] = ["QUOTATION", "WAREHOUSE_EXPORT", "DELIVERY_ORDER"];

export function DocumentTypeSelector({
  selected,
  onSelect,
}: {
  selected: DocumentType;
  onSelect: (type: DocumentType) => void;
}) {
  return (
    <div className="flex gap-4">
      {types.map((type) => {
        const config = documentTypeConfig[type];
        const isActive = selected === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`flex w-44 flex-col items-center gap-2 rounded-xl border-2 bg-white p-5 transition-colors ${
              isActive
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span
              className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}
            >
              {config.prefix}
            </span>
            <span
              className={`text-sm font-medium ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
