import { FileText, Package, Users, Building2, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

export const navItems: NavItem[] = [
  { href: "/documents", label: "Tài liệu", icon: FileText },
  { href: "/products", label: "Sản phẩm", icon: Package },
  { href: "/customers", label: "Khách hàng", icon: Users },
  { href: "/companies", label: "Công ty", icon: Building2 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];
