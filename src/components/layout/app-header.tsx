"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const pageTitles: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/quotes": "Báo giá",
  "/quotes/new": "Tạo báo giá mới",
  "/products": "Sản phẩm",
  "/customers": "Khách hàng",
  "/settings": "Cài đặt",
  "/templates": "Mẫu tài liệu",
  "/templates/new": "Tạo mẫu tài liệu mới",
  "/documents": "Tài liệu",
  "/documents/new": "Tạo tài liệu mới",
  "/onboarding": "Thiết lập ban đầu",
  "/create-company": "Tạo công ty mới",
};

export function AppHeader() {
  const pathname = usePathname();

  // Exact match first, then prefix patterns for dynamic routes
  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/quotes/") ? "Chi tiết báo giá"
    : pathname.startsWith("/templates/") ? "Chi tiết mẫu tài liệu"
    : pathname.startsWith("/documents/") ? "Chi tiết tài liệu"
    : "");

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium">{title}</h1>
    </header>
  );
}
