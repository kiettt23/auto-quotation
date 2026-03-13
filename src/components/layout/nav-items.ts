import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  showInBottomNav: boolean;
};

export const navItems: NavItem[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    href: "/",
    showInBottomNav: true,
  },
  {
    label: "Báo giá",
    icon: FileText,
    href: "/quotes",
    showInBottomNav: true,
  },
  {
    label: "Sản phẩm",
    icon: Package,
    href: "/products",
    showInBottomNav: true,
  },
  {
    label: "Khách hàng",
    icon: Users,
    href: "/customers",
    showInBottomNav: true,
  },
  {
    label: "Cài đặt",
    icon: Settings,
    href: "/settings",
    showInBottomNav: false,
  },
];
