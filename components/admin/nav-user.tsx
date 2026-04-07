"use client";

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
  LifeBuoyIcon,
  BookOpenIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth"; // 引入 logout 动作
import { useState } from "react"; // 进阶：可以加个 loading 状态

// 1. 定义接口
interface NavUserProps {
  user: {
    name: string | null;
    username: string;
  };
}

export function NavUser({ user }: NavUserProps) {
  const [isPending, setIsPending] = useState(false);
  const handleLogout = async () => {
    setIsPending(true);
    // 这里可以直接调用，因为 logoutAction 内部处理了重定向
    await logoutAction();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="flex items-center justify-start gap-2">
          <DropdownMenuLabel className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <UserIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              {/* 2. 使用真实数据 */}
              <span className="font-bold text-sm text-foreground">
                {user.name || "管理员"}
              </span>
              <div className="text-[10px] text-muted-foreground">
                @{user.username}
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
            onClick={handleLogout} // 绑定处理函数
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>{isPending ? "正在退出..." : "退出登录"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
