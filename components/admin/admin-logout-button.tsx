"use client";

import { LogOutIcon } from "lucide-react";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { clearAdminDemoAuth } from "@/lib/admin/demo-auth";

export function AdminLogoutButton() {
  return (
    <SidebarMenuButton
      className="text-muted-foreground"
      size="sm"
      onClick={() => {
        clearAdminDemoAuth();
        window.location.replace("/admin/login");
      }}
    >
      <LogOutIcon />
      <span>退出登录</span>
    </SidebarMenuButton>
  );
}
