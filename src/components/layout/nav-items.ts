import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  Blocks,
  FilePlus2,
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
    href: "/bao-gia",
    showInBottomNav: true,
  },
  {
    label: "Sản phẩm",
    icon: Package,
    href: "/san-pham",
    showInBottomNav: true,
  },
  {
    label: "Khách hàng",
    icon: Users,
    href: "/khach-hang",
    showInBottomNav: true,
  },
  {
    label: "Mẫu chứng từ",
    icon: Blocks,
    href: "/mau-chung-tu",
    showInBottomNav: false,
  },
  {
    label: "Chứng từ",
    icon: FilePlus2,
    href: "/chung-tu",
    showInBottomNav: true,
  },
  {
    label: "Cài đặt",
    icon: Settings,
    href: "/cai-dat",
    showInBottomNav: false,
  },
];
