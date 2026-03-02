"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/": "Tổng quan",
  "/bao-gia": "Báo giá",
  "/bao-gia/tao-moi": "Tạo báo giá mới",
  "/san-pham": "Sản phẩm",
  "/khach-hang": "Khách hàng",
  "/cai-dat": "Cài đặt",
};

export function AppHeader() {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/bao-gia/") ? "Chi tiết báo giá" : "");

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex gap-2 text-muted-foreground"
          onClick={() => {
            // Phase 08: open command palette
          }}
        >
          <Search className="size-4" />
          <span>Tìm sản phẩm...</span>
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            Ctrl+K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Tìm sản phẩm"
          onClick={() => {
            // Phase 08: open command palette
          }}
        >
          <Search className="size-4" />
        </Button>
      </div>
    </header>
  );
}
