import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getApplicationById } from "@/app/actions/application";
import { ApprovalPanel } from "../_components/approval-panel";
import { ApplicationPrintSheet } from "../_components/application-print-sheet";
import {
  formatPrintTimeLabel,
  getPendingLookupUrl,
} from "../_components/application-print-utils";
import { PrintApplicationButton } from "../_components/print-application-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ApplicationStatus } from "@prisma/client";

// 复用状态字典
const statusMap: Record<
  ApplicationStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "待审核", variant: "secondary" },
  APPROVED: { label: "已通过", variant: "default" },
  REJECTED: { label: "已驳回", variant: "destructive" },
  SUPPLEMENT: { label: "待补充资料", variant: "outline" },
};

// 辅助渲染图片的微组件
const ImageSection = ({ title, urls }: { title: string; urls: string[] }) => {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {urls.map((url, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden rounded border bg-muted block"
          >
            <Image
              src={url}
              alt={title}
              fill
              className="object-cover transition group-hover:scale-105"
            />
            {/* 悬浮提示新标签页打开 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
              <ExternalLink className="text-white h-6 w-6" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// Next.js 15 规范：params 是一个 Promise
export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await getApplicationById(id);
  const app = res.data;

  if (!app) {
    notFound();
  }

  const printTimeLabel = formatPrintTimeLabel(new Date());
  const pendingLookupUrl = getPendingLookupUrl(
    app.id,
    "https://czedu.local",
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-6 print:hidden">
        {/* 头部导航 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/applications">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                {app.name} 的转学申请
                <Badge variant={statusMap[app.status].variant}>
                  {statusMap[app.status].label}
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                学期：{app.semester.name} | 提交于{" "}
                {app.createdAt.toLocaleString("zh-CN")}
              </p>
            </div>
          </div>
          <PrintApplicationButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左列：文本信息 */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">1. 基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-3 py-1 border-b">
                  <span className="text-muted-foreground">户籍类型</span>
                  <span className="col-span-2">
                    {app.residencyType === "LOCAL"
                      ? "城中区户籍"
                      : "非城中区户籍"}
                  </span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b">
                  <span className="text-muted-foreground">身份证号</span>
                  <span className="col-span-2 font-mono">{app.idCard}</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b">
                  <span className="text-muted-foreground">学籍号</span>
                  <span className="col-span-2 font-mono">{app.studentId}</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b">
                  <span className="text-muted-foreground">性别</span>
                  <span className="col-span-2">
                    {app.gender === "MALE" ? "男" : "女"}
                  </span>
                </div>
              </CardContent>
            </Card>

                <div className="grid grid-cols-3 py-1 border-b">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">2. 监护人信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-3 py-1 border-b">
                        <span className="text-muted-foreground">监护人1</span>
                        <span className="col-span-2">
                          {app.guardian1Name} ({app.guardian1Phone})
                        </span>
                      </div>
                      {app.guardian2Name && (
                        <div className="grid grid-cols-3 py-1 border-b">
                          <span className="text-muted-foreground">监护人2</span>
                          <span className="col-span-2">
                            {app.guardian2Name} ({app.guardian2Phone})
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">3. 学校与地址</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-3 py-1 border-b">
                        <span className="text-muted-foreground">当前学校</span>
                        <span className="col-span-2">{app.currentSchool}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1 border-b">
                        <span className="text-muted-foreground">年级变更</span>
                        <span className="col-span-2 text-primary font-medium">
                          {app.currentGrade} ➡️ {app.targetGrade}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 py-1 border-b">
                        <span className="text-muted-foreground">分配学校</span>
                        <span className="col-span-2">
                          {app.targetSchool || "尚未分配"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 py-1 border-b">
                        <span className="text-muted-foreground">户籍地址</span>
                        <span className="col-span-2">{app.hukouAddress}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1">
                        <span className="text-muted-foreground">居住地址</span>
                        <span className="col-span-2">{app.livingAddress}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 审批操作面板 (引入刚才写的客户端组件) */}
                  <ApprovalPanel
                    applicationId={app.id}
                    currentStatus={app.status}
                    currentRemark={app.adminRemark}
                    currentTargetSchool={app.targetSchool}
                  />
                </div>
          </div>

          {/* 右列：上传的附件资料 */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  4. 证明材料原件
                  <span className="text-xs font-normal text-muted-foreground">
                    点击图片可全屏查看
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 bg-muted/10 pt-4 rounded-b-xl">
                <ImageSection
                  title="户口本（首页及学生页）"
                  urls={app.fileHukou}
                />
                <ImageSection
                  title="房产证或房屋租赁备案证明"
                  urls={app.fileProperty}
                />
                <ImageSection
                  title="学生学籍信息卡"
                  urls={app.fileStudentCard}
                />
                {app.residencyType === "NON_LOCAL" && (
                  <ImageSection
                    title="监护人或学生居住证"
                    urls={app.fileResidencePermit}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ApplicationPrintSheet
        application={app}
        printTimeLabel={printTimeLabel}
        pendingLookupUrl={pendingLookupUrl}
      />
    </div>
  );
}
