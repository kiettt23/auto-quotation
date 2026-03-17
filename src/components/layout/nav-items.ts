import { Home, FileText, Package, Users, Settings } from "lucide-react";

export const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/documents", label: "Tài liệu", icon: FileText },
  { href: "/products", label: "Sản phẩm", icon: Package },
  { href: "/customers", label: "Khách hàng", icon: Users },
  { href: "/settings", label: "Cài đặt", icon: Settings },
] as const;
