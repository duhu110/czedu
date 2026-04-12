"use client";

import Link from "next/link";
import {
  Building2Icon,
  LayoutGridIcon,
  FileTextIcon,
  PlusIcon,
  SettingsIcon,
  ScrollTextIcon,
  UsersIcon,
} from "lucide-react";

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
import { SemesterSwitcher } from "@/components/admin/semester-switcher";

const navItems = [
  {
    title: "总览",
    url: "/admin",
    icon: <LayoutGridIcon />,
  },
  {
    title: "申请管理",
    url: "/admin/applications",
    icon: <FileTextIcon />,
  },
  {
    title: "操作记录",
    url: "/admin/operation-logs",
    icon: <ScrollTextIcon />,
  },
  {
    title: "文字管理",
    url: "/admin/system-texts",
    icon: <ScrollTextIcon />,
  },
  {
    title: "学校管理",
    url: "/admin/schools",
    icon: <Building2Icon />,
  },
  {
    title: "学期管理",
    url: "/admin/semesters",
    icon: <SettingsIcon />,
  },
];

type AppSidebarProps = {
  currentAdmin: {
    isSuperAdmin: boolean;
  };
};

export function AppSidebar({ currentAdmin }: AppSidebarProps) {
  const items = currentAdmin.isSuperAdmin
    ? [
        ...navItems,
        {
          title: "用户管理",
          url: "/admin/users",
          icon: <UsersIcon />,
        },
      ]
    : navItems;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-14 justify-center">
        <SemesterSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              tooltip="Quick Create"
            >
              <Link href="/admin/qrcode">
                <PlusIcon />
                <span>新增登记</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>管理功能</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
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
          <SidebarMenuItem>城中区教育局</SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
