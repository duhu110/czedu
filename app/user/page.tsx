import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardPenLine,
  FileClock,
  Files,
} from "lucide-react";

const mockPages = [
  {
    title: "基本资料录入",
    description: "查看移动端转学申请录入页，表单已预置 Mock 数据。",
    href: "/user/form",
    icon: ClipboardPenLine,
  },
  {
    title: "审核中",
    description: "查看提交申请后的审核进度和时间线展示。",
    href: "/user/pending",
    icon: FileClock,
  },
  {
    title: "确认结果",
    description: "查看审核通过后的须知确认与下一步动作。",
    href: "/user/confirmation",
    icon: CheckCircle2,
  },
  {
    title: "补充材料",
    description: "查看材料上传页，内置材料预览和提交流程。",
    href: "/user/supplement",
    icon: Files,
  },
] as const;

export default function UserPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-primary">Mock Navigation</p>
          <h1 className="text-2xl font-semibold text-foreground">
            转学申请移动端状态预览
          </h1>
          <p className="text-sm text-muted-foreground">
            选择任一状态页独立查看，不再依赖流程上下文。
          </p>
        </div>

        <div className="space-y-4">
          {mockPages.map((page) => {
            const Icon = page.icon;

            return (
              <Card key={page.href}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    {page.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {page.description}
                  </p>
                  <Button asChild className="w-full h-11 gap-2">
                    <Link href={page.href}>
                      进入页面
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
