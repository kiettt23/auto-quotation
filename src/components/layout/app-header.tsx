"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { signOut } from "@/lib/auth/auth-client";
import { navItems } from "./nav-items";
import { AppBrand } from "./app-brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type AppHeaderProps = {
  userName: string;
  userEmail: string;
};

export function AppHeader({ userName, userEmail }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const activeIndex = navItems.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );

  const updateIndicator = useCallback(() => {
    const navEl = navRef.current;
    const tabEl = tabRefs.current[activeIndex];
    if (!navEl || !tabEl) return;

    const navRect = navEl.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();
    setIndicator({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
    });
    if (!ready) setReady(true);
  }, [activeIndex, ready]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900">
      <div className="mx-auto flex h-12 max-w-[1400px] items-end justify-center px-10">
        {/* Brand name */}
        <Link href="/" className="absolute left-10 top-1/2 -translate-y-1/2">
          <AppBrand />
        </Link>

        {/* Navigation tabs — centered */}
        <nav ref={navRef} className="relative flex items-end gap-0.5">
          {/* Sliding indicator */}
          <div
            className={cn(
              "pointer-events-none absolute bottom-0 h-full rounded-t-lg bg-slate-50",
              "before:absolute before:-left-5 before:bottom-0 before:h-5 before:w-5 before:rounded-br-2xl before:bg-slate-900 before:shadow-[8px_8px_0_8px_#F8FAFC]",
              "after:absolute after:-right-5 after:bottom-0 after:h-5 after:w-5 after:rounded-bl-2xl after:bg-slate-900 after:shadow-[-8px_8px_0_8px_#F8FAFC]",
              ready
                ? "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                : "",
              (!ready || activeIndex < 0) ? "opacity-0" : "opacity-100",
            )}
            style={{ left: indicator.left, width: indicator.width }}
          />

          {navItems.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                className={cn(
                  "relative z-10 flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors duration-200",
                  isActive
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-200 cursor-pointer",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors hover:bg-slate-600">
              {getInitials(userName)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="border-b px-3 py-2">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
