"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navItems } from "./nav-items";
import { hasPermission } from "@/lib/rbac";
import { TenantSwitcher } from "./tenant-switcher";
import { authClient } from "@/auth/client";
import { logoutAction } from "@/app/(auth)/logout-action";

type TenantInfo = {
  tenantId: string;
  name: string;
  slug: string;
};

type Props = {
  role?: string;
  currentTenantId: string;
  tenants: TenantInfo[];
};

export function AppSidebar({ role = "VIEWER", currentTenantId, tenants }: Props) {
  const pathname = usePathname();

  async function handleLogout() {
    await authClient.signOut();
    await logoutAction();
  }

  const visibleItems = navItems.filter((item) =>
    hasPermission(role, item.minRole ?? "VIEWER")
  );

  const mainItems = visibleItems.filter((item) => item.href !== "/settings");
  const settingsItem = visibleItems.find((item) => item.href === "/settings");

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TenantSwitcher currentTenantId={currentTenantId} tenants={tenants} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {settingsItem && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive(settingsItem.href)}
                tooltip={settingsItem.label}
              >
                <Link href={settingsItem.href}>
                  <settingsItem.icon />
                  <span>{settingsItem.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Đăng xuất"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
