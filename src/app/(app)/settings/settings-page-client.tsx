"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tags, Ruler, FileText } from "lucide-react";
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

interface Props {
  categories: CategoryRow[];
  units: UnitRow[];
  documentTypes: DocumentTypeRow[];
}

export function SettingsPageClient({ categories, units, documentTypes }: Props) {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <h1 className="text-2xl font-bold text-slate-900">Cài đặt</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="categories" className="gap-1.5">
            <Tags className="h-4 w-4" />
            Danh mục
          </TabsTrigger>
          <TabsTrigger value="units" className="gap-1.5">
            <Ruler className="h-4 w-4" />
            Đơn vị tính
          </TabsTrigger>
          <TabsTrigger value="documentTypes" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Mẫu tài liệu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Danh mục sản phẩm
            </h2>
            <p className="mb-2 text-sm text-slate-500">
              Phân loại sản phẩm theo nhóm. Dùng khi thêm sản phẩm mới.
            </p>
            <SimpleListManager
              items={categories}
              onAdd={(name) => createCategoryAction(name)}
              onDelete={(id) => deleteCategoryAction(id)}
              placeholder="Tên danh mục mới..."
              emptyMessage="Chưa có danh mục nào. Thêm danh mục đầu tiên."
            />
          </div>
        </TabsContent>

        <TabsContent value="units">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Đơn vị tính
            </h2>
            <p className="mb-2 text-sm text-slate-500">
              Đơn vị đo lường cho sản phẩm. Dùng khi thêm sản phẩm mới.
            </p>
            <SimpleListManager
              items={units}
              onAdd={(name) => createUnitAction(name)}
              onDelete={(id) => deleteUnitAction(id)}
              placeholder="Tên đơn vị mới..."
              emptyMessage="Chưa có đơn vị nào. Thêm đơn vị đầu tiên."
            />
          </div>
        </TabsContent>

        <TabsContent value="documentTypes">
          <DocumentTypeColumnEditor documentTypes={documentTypes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
