import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
import { PrintApplicationButton } from "@/components/admin/print-application-button";
import { QRCode } from "@/components/admin/qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type TransferApplication } from "@/lib/admin/mock-transfer-applications";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function buildApplicationResultUrl(id: string) {
  return `https://example.com/application-result/${id}`;
}

function ApplicationPrintSheet({
  application,
}: {
  application: TransferApplication;
}) {
  const resultUrl = buildApplicationResultUrl(application.id);

  return (
    <section
      className="hidden print:block"
      data-testid="application-print-content"
    >
      <div className="mx-auto flex w-[210mm] min-h-[297mm] flex-col bg-white px-[10mm] py-[10mm] text-black">
        <div className="border border-black">
          <div className="grid grid-cols-[1.45fr_0.9fr_0.7fr] border-b border-black">
            <div className="space-y-2 border-r border-black px-4 py-4">
              <p className="text-[11px] tracking-[0.24em] text-black/70 uppercase">
                Transfer Application Form
              </p>
              <h2 className="font-semibold text-[24px] tracking-[0.08em]">
                学生转学申请单
              </h2>
              <p className="text-[12px] leading-5 text-black/70">
                本表用于转学事项登记留档，请家长保存申请编号并扫码查看办理结果。
              </p>
            </div>

            <div className="grid grid-cols-[82px_1fr] text-[12px]">
              <div className="border-r border-black">
                <div className="flex h-11 items-center justify-center border-b border-black bg-black/5 font-medium">
                  申请编号
                </div>
                <div className="flex h-11 items-center justify-center border-b border-black bg-black/5 font-medium">
                  申请日期
                </div>
                <div className="flex h-11 items-center justify-center bg-black/5 font-medium">
                  当前状态
                </div>
              </div>
              <div>
                <div className="flex h-11 items-center border-b border-black px-3">
                  {application.id}
                </div>
                <div className="flex h-11 items-center border-b border-black px-3">
                  {application.applyDate}
                </div>
                <div className="flex h-11 items-center px-3">
                  {application.status}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 px-3 py-3">
              <div className="size-24 border border-black p-1">
                <QRCode
                  background="#FFFFFF"
                  className="size-full"
                  data={resultUrl}
                  foreground="#000000"
                  robustness="H"
                />
              </div>
              <p className="text-center text-[12px] font-medium">
                扫码查看办理结果
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-black text-[12px]">
            <div className="grid grid-cols-[84px_1fr_84px_1fr] border-r border-black">
              <div className="border-r border-black bg-black/5 px-3 py-2 font-medium">
                学生姓名
              </div>
              <div className="border-r border-black px-3 py-2">
                {application.studentName}
              </div>
              <div className="border-r border-black bg-black/5 px-3 py-2 font-medium">
                学籍号
              </div>
              <div className="px-3 py-2">{application.studentId}</div>
            </div>

            <div className="grid grid-cols-[84px_1fr_84px_1fr]">
              <div className="border-r border-black bg-black/5 px-3 py-2 font-medium">
                当前年级
              </div>
              <div className="border-r border-black px-3 py-2">
                {application.currentGrade}
              </div>
              <div className="border-r border-black bg-black/5 px-3 py-2 font-medium">
                目标年级
              </div>
              <div className="px-3 py-2">{application.targetGrade}</div>
            </div>
          </div>

          <div className="grid grid-cols-[96px_1fr] border-b border-black text-[12px]">
            <div className="border-r border-black bg-black/5 px-3 py-3 font-medium">
              学校信息
            </div>
            <div className="grid grid-cols-[88px_1fr_88px_1fr]">
              <div className="border-r border-black bg-black/5 px-3 py-3 font-medium">
                当前学校
              </div>
              <div className="border-r border-black px-3 py-3">
                {application.currentSchool}
              </div>
              <div className="border-r border-black bg-black/5 px-3 py-3 font-medium">
                目标学校
              </div>
              <div className="px-3 py-3">{application.targetSchool}</div>
            </div>
          </div>

          <div className="grid grid-cols-[96px_1fr] border-b border-black text-[12px]">
            <div className="border-r border-black bg-black/5 px-3 py-3 font-medium">
              联系方式
            </div>
            <div className="grid grid-cols-[88px_1fr_88px_1fr]">
              <div className="border-r border-black bg-black/5 px-3 py-3 font-medium">
                联系电话
              </div>
              <div className="border-r border-black px-3 py-3">
                {application.phone}
              </div>
              <div className="border-r border-black bg-black/5 px-3 py-3 font-medium">
                电子邮箱
              </div>
              <div className="px-3 py-3">{application.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-[96px_1fr] border-b border-black text-[12px]">
            <div className="border-r border-black bg-black/5 px-3 py-3 font-medium">
              转学原因
            </div>
            <div className="min-h-28 px-3 py-3 leading-6">
              {application.reason}
            </div>
          </div>

          <div className="grid grid-cols-[96px_1fr] text-[12px]">
            <div className="border-r border-black bg-black/5 px-3 py-3 font-medium">
              材料核验
            </div>
            <div className="min-h-20 px-3 py-3 leading-6">
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

        <div className="mt-3 space-y-1 text-[10px] leading-4 text-black/70">
          <p>结果查询链接：{resultUrl}</p>
          <p>说明：二维码当前为占位地址，后续可替换为家长端真实查询页面。</p>
        </div>
      </div>
    </section>
  );
}

export function ApplicationDetail({
  application,
}: {
  application: TransferApplication;
}) {
  return (
    <>
      <div
        className="space-y-4 px-4 py-4 lg:px-6 print:hidden"
        data-testid="application-screen-content"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
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
      </div>

      <ApplicationPrintSheet application={application} />
    </>
  );
}
