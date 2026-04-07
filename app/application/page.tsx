import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardPenLine,
  FileClock,
  Files,
  CircleX,
} from "lucide-react";
import { applicationTestRecordIds } from "@/lib/application-test-records";

const applicationPages = [
  {
    title: "新建申请",
    description: "填写并提交新的转学申请，学籍信息卡可后续补传。",
    href: "/application/new",
    icon: ClipboardPenLine,
    actionLabel: "发起申请",
  },
  {
    title: "审核中申请",
    description: "查看一条状态为待审核的测试申请。",
    href: `/application/pending/${applicationTestRecordIds.pending}`,
    icon: FileClock,
    actionLabel: "查看审核中",
  },
  {
    title: "审核通过结果",
    description: "查看一条已通过且已分配目标学校的测试申请。",
    href: `/application/confirmation/${applicationTestRecordIds.approved}`,
    icon: CheckCircle2,
    actionLabel: "查看通过结果",
  },
  {
    title: "审核驳回结果",
    description: "查看一条已驳回且带审核备注的测试申请。",
    href: `/application/confirmation/${applicationTestRecordIds.rejected}`,
    icon: CircleX,
    actionLabel: "查看驳回结果",
  },
  {
    title: "待补充资料",
    description: "查看一条缺少学籍信息卡、等待补件的测试申请。",
    href: `/application/supplement/${applicationTestRecordIds.supplement}`,
    icon: Files,
    actionLabel: "查看待补充资料",
  },
] as const;

export default function UserPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-primary">转学申请系统</p>
          <h1 className="text-2xl font-semibold text-foreground">
            转学申请移动端状态预览
          </h1>
          <p className="text-sm text-muted-foreground">
            选择真实业务入口或固定测试申请，直接查看当前状态页。
          </p>
        </div>
        <div className="space-y-4">
          {applicationPages.map((page) => {
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
                      {page.actionLabel}
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
