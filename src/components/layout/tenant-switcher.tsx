"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Building2, ChevronsUpDown, Check, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { switchTenantAction } from "@/app/(dashboard)/switch-tenant-action";

type TenantInfo = {
  tenantId: string;
  name: string;
  slug: string;
};

type Props = {
  currentTenantId: string;
  tenants: TenantInfo[];
};

export function TenantSwitcher({ currentTenantId, tenants }: Props) {
  const [isPending, startTransition] = useTransition();

  const current = tenants.find((t) => t.tenantId === currentTenantId) ?? tenants[0];

  function handleSwitch(tenantId: string) {
    if (tenantId === currentTenantId) return;
    startTransition(() => {
      switchTenantAction(tenantId);
    });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isPending}
              tooltip={current?.name ?? "Công ty"}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <Building2 className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="font-semibold truncate">{current?.name ?? "Công ty"}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {current?.slug ?? ""}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.tenantId}
                onSelect={() => handleSwitch(tenant.tenantId)}
                className="gap-2"
              >
                <div className="flex size-6 items-center justify-center rounded bg-primary/10">
                  <Building2 className="size-3.5 text-primary" />
                </div>
                <span className="flex-1 truncate">{tenant.name}</span>
                {tenant.tenantId === currentTenantId && (
                  <Check className="size-4 shrink-0" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/create-company" className="gap-2">
                <div className="flex size-6 items-center justify-center rounded border border-dashed">
                  <Plus className="size-3.5" />
                </div>
                <span>Tạo công ty mới</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
