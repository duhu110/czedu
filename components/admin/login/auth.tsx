"use client";

import { useActionState } from "react"; // 使用新版 Hook
import { useRouter } from "next/navigation";
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

// 引入我们之前定义的登录 Action
import { loginAction, type ActionState } from "@/app/actions/auth";

export function AuthPage() {
  const router = useRouter();

  // 使用 useActionState 处理服务端响应
  // 核心修复点：为 useActionState 指定泛型 <ActionState, FormData>
  // 这样第一个参数 prevState 就会自动推导为 ActionState 类型，不再需要写 :any
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prevState, formData) => {
      // 这里的 prevState 现在已经是 ActionState 类型了
      const username = formData.get("admin-account") as string;
      const password = formData.get("admin-password") as string;

      const result = await loginAction({ username, password });

      if (result.success) {
        router.push("/admin");
        router.refresh();
        return { error: null, success: true };
      }

      return { error: result.error, success: false };
    },
    { error: null, success: false }, // 初始状态也必须符合 ActionState 结构
  );

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden px-6 md:px-8">
      <div
        className={cn(
          "relative flex w-full max-w-sm flex-col justify-between p-6 md:p-8",
          "dark:bg-[radial-gradient(50%_80%_at_20%_0%,--theme(--color-foreground/.1),transparent)]",
        )}
      >
        {/* ...装饰性代码保持不变... */}
        <DecorIcon position="top-left" />
        <DecorIcon position="bottom-right" />
        <div className="w-full max-w-sm animate-in space-y-8">
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">
              教育局管理端登录
            </h1>
            <p className="text-base text-muted-foreground">
              请输入管理员凭据访问转学申请管理系统。
            </p>
          </div>
          <div className="space-y-4">
            {/* 接入 formAction */}
            <form action={formAction} className="space-y-2">
              <InputGroup>
                <InputGroupInput
                  autoComplete="username"
                  id="admin-account"
                  name="admin-account"
                  placeholder="请输入管理员账号"
                  required
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
                  required
                />
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon icon={AtIcon} strokeWidth={2} />
                </InputGroupAddon>
              </InputGroup>
              {/* 显示错误信息 */}
              {state?.error && (
                <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                  {state.error}
                </p>
              )}
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "登录中..." : "登录管理端"}
              </Button>
            </form>
            <AuthDivider />
          </div>
          <p className="text-muted-foreground text-sm italic">
            请确保已运行初始化脚本创建管理员。
          </p>
        </div>
      </div>
    </div>
  );
}
