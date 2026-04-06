"use client";

import type { ReactNode } from "react";
import { LogoIcon } from "@/components/admin/logo";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { LatestChange } from "@/components/admin/latest-change";
import {
  LayoutGridIcon,
  BarChart3Icon,
  HelpCircleIcon,
  ActivityIcon,
  PlusIcon,
  ChevronRightIcon,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon: ReactNode;
  isActive?: boolean;
  items?: Array<{ title: string; url: string }>;
};

type SidebarSection = {
  label: string;
  items: SidebarNavItem[];
};

const navSections: SidebarSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "数据管理",
        url: "#",
        icon: <LayoutGridIcon />,
        isActive: true,
      },
      {
        title: "审核管理",
        url: "#",
        icon: <BarChart3Icon />,
      },
    ],
  },
];

const footerNavLinks: SidebarNavItem[] = [
  {
    title: "Seller help",
    url: "#",
    icon: <HelpCircleIcon />,
  },
  {
    title: "Platform status",
    url: "#",
    icon: <ActivityIcon />,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton asChild>
          <a href="#link">
            <LogoIcon />
            <span className="font-medium">Efferd</span>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              tooltip="Add product"
            >
              <PlusIcon />
              <span>新增登记</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                <Collapsible
                  asChild
                  defaultOpen={item.isActive}
                  key={item.title}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.title}
                    >
                      <a href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRightIcon />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <a href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <LatestChange />
        <SidebarMenu className="mt-2">
          {footerNavLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="text-muted-foreground"
                isActive={false}
                size="sm"
              >
                <a href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
