"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyInfoForm } from "./company-info-form";
import { QuoteTemplateForm } from "./quote-template-form";
import { DefaultsForm } from "./defaults-form";
import { CategoriesUnitsManager } from "./categories-units-manager";
import type { Settings, Category, Unit } from "@/generated/prisma/client";

type Props = {
  settings: Settings;
  categories: Category[];
  units: Unit[];
};

export function SettingsPageClient({ settings, categories, units }: Props) {
  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="company">Công ty</TabsTrigger>
        <TabsTrigger value="template">Mẫu báo giá</TabsTrigger>
        <TabsTrigger value="defaults">Mặc định</TabsTrigger>
        <TabsTrigger value="categories">Danh mục & ĐVT</TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="mt-6">
        <CompanyInfoForm settings={settings} />
      </TabsContent>

      <TabsContent value="template" className="mt-6">
        <QuoteTemplateForm settings={settings} />
      </TabsContent>

      <TabsContent value="defaults" className="mt-6">
        <DefaultsForm settings={settings} />
      </TabsContent>

      <TabsContent value="categories" className="mt-6">
        <CategoriesUnitsManager categories={categories} units={units} />
      </TabsContent>
    </Tabs>
  );
}
