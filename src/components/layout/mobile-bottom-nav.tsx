"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useActivePath } from "@/hooks/use-active-path";
import { navItems } from "./nav-items";
import type { NavItem } from "./nav-items";

function MobileNavLink({ href, label, icon: Icon }: NavItem) {
  const isActive = useActivePath(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
        isActive ? "text-indigo-600" : "text-slate-400"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px]">{label}</span>
    </Link>
  );
}

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white lg:hidden">
      {navItems.slice(0, 5).map((item) => (
        <MobileNavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
