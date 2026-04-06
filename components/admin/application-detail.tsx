import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
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
    <div className="space-y-4 px-4 py-4 lg:px-6">
      <Button asChild className="w-fit pl-0" variant="ghost">
        <Link href="/admin/users">
          <ArrowLeftIcon className="mr-2 size-4" />
          返回申请列表
        </Link>
      </Button>

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
    </div>
  );
}
