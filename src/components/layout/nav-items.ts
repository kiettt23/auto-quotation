import { Home, FileText, Package, Users, Building2, Settings } from "lucide-react";

export const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/documents", label: "Tài liệu", icon: FileText },
  { href: "/products", label: "Sản phẩm", icon: Package },
  { href: "/customers", label: "Khách hàng", icon: Users },
  { href: "/companies", label: "Công ty", icon: Building2 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
] as const;
