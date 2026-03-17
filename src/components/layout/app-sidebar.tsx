"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useActivePath } from "@/hooks/use-active-path";
import { signOut } from "@/lib/auth/auth-client";
import { navItems } from "./nav-items";
import { AppLogo } from "./app-logo";

function NavLink({ href, label, icon: Icon }: (typeof navItems)[number]) {
  const isActive = useActivePath(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
        isActive
          ? "bg-blue-50 font-medium text-blue-600"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function AppSidebar() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-slate-200 bg-white px-4 py-5">
      <Link href="/" className="pb-6">
        <AppLogo />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </aside>
  );
}
