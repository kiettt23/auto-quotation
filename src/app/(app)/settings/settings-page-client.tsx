"use client";

import { useState } from "react";
import { Tags, Ruler, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SimpleListManager } from "@/components/settings/simple-list-manager";
import { DocumentTypeColumnEditor } from "@/components/settings/document-type-column-editor";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/actions/category.actions";
import {
  createUnitAction,
  deleteUnitAction,
} from "@/actions/unit.actions";
import type { CategoryRow } from "@/services/category.service";
import type { UnitRow } from "@/services/unit.service";
import type { DocumentTypeRow } from "@/services/document-type.service";

const tabs = [
  { id: "categories", label: "Danh mục", icon: Tags },
  { id: "units", label: "Đơn vị tính", icon: Ruler },
  { id: "documentTypes", label: "Mẫu tài liệu", icon: FileText },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface Props {
  categories: CategoryRow[];
  units: UnitRow[];
  documentTypes: DocumentTypeRow[];
}

export function SettingsPageClient({ categories, units, documentTypes }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("categories");

  return (
    <div className="flex h-[calc(100vh-48px)] gap-0 px-10 py-6">
      {/* Left — Tab list */}
      <div className="flex w-56 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-[13px] font-semibold text-slate-900">Cài đặt</h1>
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Content */}
      <div className="ml-6 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "categories" && (
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Danh mục sản phẩm
              </h2>
              <p className="mb-2 text-xs text-slate-400">
                Phân loại sản phẩm theo nhóm. Dùng khi thêm sản phẩm mới.
              </p>
              <SimpleListManager
                items={categories}
                onAdd={(name) => createCategoryAction(name)}
                onDelete={(id) => deleteCategoryAction(id)}
                placeholder="Tên danh mục mới..."
                emptyMessage="Chưa có danh mục nào."
              />
            </div>
          )}

          {activeTab === "units" && (
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Đơn vị tính
              </h2>
              <p className="mb-2 text-xs text-slate-400">
                Đơn vị đo lường cho sản phẩm. Dùng khi thêm sản phẩm mới.
              </p>
              <SimpleListManager
                items={units}
                onAdd={(name) => createUnitAction(name)}
                onDelete={(id) => deleteUnitAction(id)}
                placeholder="Tên đơn vị mới..."
                emptyMessage="Chưa có đơn vị nào."
              />
            </div>
          )}

          {activeTab === "documentTypes" && (
            <DocumentTypeColumnEditor documentTypes={documentTypes} />
          )}
        </div>
      </div>
    </div>
  );
}
