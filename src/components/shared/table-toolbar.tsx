"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Tab = { label: string; value: string };

type TableToolbarProps = {
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
};

export function TableToolbar({
  tabs,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      {tabs && tabs.length > 0 ? (
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange?.(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        <div />
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-56 rounded-[10px] border-slate-200 bg-slate-50 pl-8 text-xs"
        />
      </div>
    </div>
  );
}
