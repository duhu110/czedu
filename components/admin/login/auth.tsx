"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DecorIcon } from "@/components/ui/decor-icon";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AuthDivider } from "@/components/admin/login/auth-divider";
import { HugeiconsIcon } from "@hugeicons/react";
import { AtIcon } from "@hugeicons/core-free-icons";

import { getAdminDemoAuth, setAdminDemoAuth } from "@/lib/admin/demo-auth";

export function AuthPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (getAdminDemoAuth()) {
      window.location.replace("/admin");
    }
  }, []);

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden px-6 md:px-8">
      <div
        className={cn(
          "relative flex w-full max-w-sm flex-col justify-between p-6 md:p-8",
          "dark:bg-[radial-gradient(50%_80%_at_20%_0%,--theme(--color-foreground/.1),transparent)]",
        )}
      >
        <div className="absolute -inset-y-6 -left-px w-px bg-border" />
        <div className="absolute -inset-y-6 -right-px w-px bg-border" />
        <div className="absolute -inset-x-6 -top-px h-px bg-border" />
        <div className="absolute -inset-x-6 -bottom-px h-px bg-border" />
        <DecorIcon position="top-left" />
        <DecorIcon position="bottom-right" />
        <div className="w-full max-w-sm animate-in space-y-8">
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">
              教育局管理端登录
            </h1>
            <p className="text-base text-muted-foreground">
              使用演示账号进入学生转学申请管理后台。
            </p>
          </div>
          <div className="space-y-4">
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault();

                if (!account.trim() || !password.trim()) {
                  return;
                }

                setAdminDemoAuth();
                window.location.replace("/admin");
              }}
            >
              <InputGroup>
                <InputGroupInput
                  autoComplete="username"
                  id="admin-account"
                  name="admin-account"
                  placeholder="请输入管理员账号"
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                />
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon icon={AtIcon} strokeWidth={2} />
                </InputGroupAddon>
              </InputGroup>
              <InputGroup>
                <InputGroupInput
                  autoComplete="current-password"
                  id="admin-password"
                  name="admin-password"
                  placeholder="请输入登录密码"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon icon={AtIcon} strokeWidth={2} />
                </InputGroupAddon>
              </InputGroup>
              <Button className="w-full" type="submit">
                登录管理端
              </Button>
            </form>
            <AuthDivider />
          </div>
          <p className="text-muted-foreground text-sm">
            本页面为 DEMO 登录流程，仅用于页面演示。输入任意非空账号和密码即可进入管理端。
          </p>
        </div>
      </div>
    </div>
  );
}
