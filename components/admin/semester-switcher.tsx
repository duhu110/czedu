// components/admin/semester-switcher.tsx
"use client";

import * as React from "react";
import { ChevronsUpDown, CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export interface Semester {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export function SemesterSwitcher({ semesters }: { semesters: Semester[] }) {
  // 1. 自动计算当前选中的学期逻辑
  const activeSemester = React.useMemo(() => {
    if (semesters.length === 0) return null;
    const now = new Date();
    // 优先找当前日期在范围内的
    const matched = semesters.find(
      (s) => now >= new Date(s.startDate) && now <= new Date(s.endDate),
    );
    // 找不到就选开始日期离现在最近的一个
    return matched || semesters[0];
  }, [semesters]);

  const [selected, setSelected] = React.useState(activeSemester);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selected?.name || "暂无学期"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  业务学期
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              切换当前学期
            </DropdownMenuLabel>
            {semesters.length === 0 ? (
              <div className="p-2 text-xs text-center text-muted-foreground">
                尚无学期数据
              </div>
            ) : (
              semesters.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="gap-2 p-2"
                >
                  {s.name}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/admin/semesters"
                className="cursor-pointer text-primary"
              >
                管理学期列表...
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
