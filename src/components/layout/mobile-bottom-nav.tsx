"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import { hasPermission } from "@/lib/rbac";

interface MobileBottomNavProps {
  role?: string;
}

export function MobileBottomNav({ role = "VIEWER" }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Filter to bottom-nav items the current role can see
  const bottomItems = navItems.filter(
    (item) =>
      item.showInBottomNav &&
      (!item.minRole || hasPermission(role, item.minRole))
  );

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background md:hidden">
      {bottomItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
              active
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
