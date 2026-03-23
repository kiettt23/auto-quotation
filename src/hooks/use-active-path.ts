"use client";

import { usePathname } from "next/navigation";

/** Check if a nav href is active based on current pathname */
export function useActivePath(href: string): boolean {
  const pathname = usePathname();
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
