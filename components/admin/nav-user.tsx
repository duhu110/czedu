"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserIcon,
  BellIcon,
  CommandIcon,
  LifeBuoyIcon,
  BookOpenIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react";

import { clearAdminDemoAuth } from "@/lib/admin/demo-auth";

const user = {
  name: "教育局管理员",
  email: "admin@demo.local",
  avatar: "https://github.com/shabanhr.png",
};

export function NavUser() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="flex items-center justify-start gap-2">
          <DropdownMenuLabel className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-foreground">{user.name}</span>{" "}
              <br />
              <div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">
                {user.email}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                演示账号
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon />
            账号信息
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BellIcon />
            通知中心
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CommandIcon />
            快捷操作
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <LifeBuoyIcon />
            使用帮助
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookOpenIcon />
            审核指南
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CreditCardIcon />
            系统说明
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="w-full cursor-pointer"
            variant="destructive"
            onClick={() => {
              clearAdminDemoAuth();
              window.location.replace("/admin/login");
            }}
          >
            <LogOutIcon />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
