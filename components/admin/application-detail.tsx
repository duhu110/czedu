import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
import { PrintApplicationButton } from "@/components/admin/print-application-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type TransferApplication } from "@/lib/admin/mock-transfer-applications";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function ApplicationDetail({
  application,
}: {
  application: TransferApplication;
}) {
  return (
    <div className="space-y-4 px-4 py-4 lg:px-6 print:px-0 print:py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild className="w-fit pl-0" variant="ghost">
          <Link href="/admin/users">
            <ArrowLeftIcon className="mr-2 size-4" />
            返回申请列表
          </Link>
        </Button>
        <PrintApplicationButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>申请摘要</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <DetailRow label="申请编号" value={application.id} />
          <DetailRow label="申请日期" value={application.applyDate} />
          <DetailRow label="审核人" value={application.reviewer} />
          <div className="grid gap-1 rounded-lg border p-3">
            <span className="text-xs text-muted-foreground">当前状态</span>
            <ApplicationStatusBadge status={application.status} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>学生信息</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <DetailRow label="学生姓名" value={application.studentName} />
          <DetailRow label="学籍号" value={application.studentId} />
          <DetailRow label="当前年级" value={application.currentGrade} />
          <DetailRow label="目标年级" value={application.targetGrade} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>学校信息</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <DetailRow label="当前学校" value={application.currentSchool} />
          <DetailRow label="目标学校" value={application.targetSchool} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>联系方式</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <DetailRow label="联系电话" value={application.phone} />
          <DetailRow label="电子邮箱" value={application.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>转学原因</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7">
          {application.reason}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>审核信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-medium">结果说明：</span>
            {application.resultSummary}
          </p>
          <p>
            <span className="font-medium">备注：</span>
            {application.notes}
          </p>
          <div>
            <span className="font-medium">待补充资料：</span>
            {application.missingDocuments.length ? (
              <ul className="list-disc pl-5">
                {application.missingDocuments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <span> 无</span>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="mx-auto max-w-4xl rounded-[24px] border border-dashed border-border/70 bg-background px-6 py-8 print:max-w-none print:rounded-none print:border print:border-border print:px-8 print:py-10">
          <div className="flex items-start justify-between gap-6 border-b pb-6">
            <div className="space-y-2">
              <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
                Transfer Request
              </p>
              <h2 className="font-semibold text-3xl tracking-tight">
                学生转学申请单
              </h2>
              <p className="text-sm text-muted-foreground">
                本申请单用于教育局内部流转、审核与留档。
              </p>
            </div>
            <div className="space-y-2 text-right text-sm">
              <p>
                <span className="text-muted-foreground">申请编号：</span>
                <span className="font-medium">{application.id}</span>
              </p>
              <p>
                <span className="text-muted-foreground">申请日期：</span>
                <span className="font-medium">{application.applyDate}</span>
              </p>
              <div className="flex justify-end">
                <ApplicationStatusBadge status={application.status} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 py-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border bg-card/60 p-5">
              <h3 className="font-medium text-base">学生基本信息</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="学生姓名" value={application.studentName} />
                <DetailRow label="学籍号" value={application.studentId} />
                <DetailRow label="当前年级" value={application.currentGrade} />
                <DetailRow label="目标年级" value={application.targetGrade} />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border bg-card/60 p-5">
              <h3 className="font-medium text-base">学校与联系人</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="当前学校" value={application.currentSchool} />
                <DetailRow label="目标学校" value={application.targetSchool} />
                <DetailRow label="联系电话" value={application.phone} />
                <DetailRow label="电子邮箱" value={application.email} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 border-t pt-6">
            <div className="space-y-3">
              <h3 className="font-medium text-base">申请说明</h3>
              <div className="rounded-2xl border bg-card/40 p-5 text-sm leading-7">
                {application.reason}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3">
                <h3 className="font-medium text-base">审核结论</h3>
                <div className="space-y-3 rounded-2xl border bg-card/40 p-5 text-sm leading-7">
                  <p>
                    <span className="font-medium">审核人：</span>
                    {application.reviewer}
                  </p>
                  <p>
                    <span className="font-medium">结果说明：</span>
                    {application.resultSummary}
                  </p>
                  <p>
                    <span className="font-medium">补充说明：</span>
                    {application.notes}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-base">材料核验</h3>
                <div className="rounded-2xl border bg-card/40 p-5 text-sm leading-7">
                  {application.missingDocuments.length ? (
                    <ul className="list-disc space-y-1 pl-5">
                      {application.missingDocuments.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>材料齐全，无需补充。</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
