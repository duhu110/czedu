"use client";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { CustomSidebarTrigger } from "@/components/admin/custom-sidebar-trigger";
import { NavUser } from "@/components/admin/nav-user";

export function AppNavbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 mb-6 flex items-center justify-between gap-2 rounded-xl border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-3",
      )}
    >
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger />
        <Separator
          className="mr-2 h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>教育局转学管理</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <NavUser />
    </header>
  );
}
