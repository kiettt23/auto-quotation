import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  FileStack,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  showInBottomNav: boolean;
  /** Minimum role required to see this item. Defaults to VIEWER (everyone). */
  minRole?: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
};

export const navItems: NavItem[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    href: "/dashboard",
    showInBottomNav: true,
  },
  {
    label: "Mẫu tài liệu",
    icon: FileStack,
    href: "/templates",
    showInBottomNav: true,
    minRole: "ADMIN",
  },
  {
    label: "Tài liệu",
    icon: FolderOpen,
    href: "/documents",
    showInBottomNav: true,
  },
  {
    label: "Sản phẩm",
    icon: Package,
    href: "/products",
    showInBottomNav: false,
  },
  {
    label: "Khách hàng",
    icon: Users,
    href: "/customers",
    showInBottomNav: false,
  },
  {
    label: "Cài đặt",
    icon: Settings,
    href: "/settings",
    showInBottomNav: false,
    minRole: "ADMIN",
  },
];
