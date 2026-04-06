"use client";

import Link from "next/link";
import { LayoutGridIcon, FileTextIcon } from "lucide-react";

import { LogoIcon } from "@/components/admin/logo";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "总览",
    url: "/admin",
    icon: <LayoutGridIcon />,
  },
  {
    title: "申请管理",
    url: "/admin/users",
    icon: <FileTextIcon />,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton asChild>
          <Link href="/admin">
            <LogoIcon />
            <span className="font-medium">转学管理端</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>管理功能</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AdminLogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
