"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/auth-client";

type SidebarUserCardProps = {
  userName: string;
  userEmail: string;
  variant?: "light" | "dark";
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SidebarUserCard({ userName, userEmail, variant = "light" }: SidebarUserCardProps) {
  const router = useRouter();
  const isDark = variant === "dark";

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className={`flex items-center gap-2.5 rounded-[10px] border p-2.5 ${
      isDark
        ? "border-white/10 bg-white/5"
        : "border-slate-200 bg-slate-50"
    }`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
        {getInitials(userName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
          {userName}
        </p>
        <p className={`truncate text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {userEmail}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className={`shrink-0 rounded-md p-1 transition-colors ${
          isDark
            ? "text-slate-500 hover:bg-white/10 hover:text-slate-300"
            : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        }`}
        title="Đăng xuất"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
