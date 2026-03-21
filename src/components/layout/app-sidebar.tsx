"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useActivePath } from "@/hooks/use-active-path";
import { navItems } from "./nav-items";
import { AppLogo } from "./app-logo";
import { SidebarUserCard } from "./sidebar-user-card";
import type { NavItem } from "./nav-items";

function NavLink({ href, label, icon: Icon, badge }: NavItem) {
  const isActive = useActivePath(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13.5px] font-medium transition-all duration-200",
        isActive
          ? "bg-white/10 text-white font-semibold shadow-sm"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
      {badge != null && badge > 0 && (
        <span className="ml-auto rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

type AppSidebarProps = {
  userName: string;
  userEmail: string;
};

export function AppSidebar({ userName, userEmail }: AppSidebarProps) {
  return (
    <aside className="hidden lg:flex w-[250px] flex-col bg-slate-900 px-4 py-5">
      <Link href="/" className="pb-6">
        <AppLogo variant="dark" />
      </Link>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="my-3 h-px bg-white/10" />

      <div className="flex-1" />

      <SidebarUserCard userName={userName} userEmail={userEmail} variant="dark" />
    </aside>
  );
}
