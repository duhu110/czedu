import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertCircle, ArrowRight, Clock3, FileClock, PenLine } from "lucide-react";

import { getApplicationById } from "@/app/actions/application";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ApplicationPendingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getApplicationById(id);

  if (!result.data) {
    notFound();
  }

  const application = result.data;

  if (application.status === "APPROVED" || application.status === "REJECTED") {
    redirect(`/application/confirmation/${application.id}`);
  }

  const isSupplement = application.status === "SUPPLEMENT";
  const isEditing = application.status === "EDITING";

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-primary px-4 pb-6 pt-12">
        <h1 className="text-xl font-bold text-primary-foreground">
          {isEditing ? "需要修改" : isSupplement ? "待补充资料" : "审核中"}
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/80">
          {isEditing
            ? "您的申请需要修改部分信息，请扫描现场提供的二维码进行修改"
            : isSupplement
              ? "请补传学籍信息卡后继续审核"
              : "您的申请已提交，正在等待教育局和学校审核"}
        </p>
      </div>

      <div className="-mt-3 px-4">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-5">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                isEditing || isSupplement ? "bg-orange-100" : "bg-yellow-100"
              }`}
            >
              {isEditing ? (
                <PenLine className="h-7 w-7 text-orange-600" />
              ) : isSupplement ? (
                <AlertCircle className="h-7 w-7 text-orange-600" />
              ) : (
                <Clock3 className="h-7 w-7 text-yellow-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{application.name}</h2>
                <Badge variant={isEditing || isSupplement ? "outline" : "secondary"}>
                  {isEditing ? "待修改" : isSupplement ? "待补充资料" : "待审核"}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                申请编号：{application.id}
              </p>
            </div>
          </div>
          <CardContent className="space-y-3 pt-0 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">当前学校</span>
              <span className="font-medium text-foreground">
                {application.currentSchool}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请转入年级</span>
              <span className="font-medium text-foreground">
                {application.targetGrade}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">主监护人电话</span>
              <span className="font-medium text-foreground">
                {application.guardian1Phone}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 px-4">
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileClock className="h-5 w-5 text-primary" />
              当前处理说明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {isEditing ? (
              <>
                <p>审核人员发现您的部分申请信息需要修改。</p>
                {application.adminRemark && (
                  <div className="rounded-md bg-orange-50 p-3 text-orange-700 text-xs">
                    <strong>审核备注：</strong>{application.adminRemark}
                  </div>
                )}
                <p>请前往登记处，扫描工作人员提供的二维码进行修改。</p>
              </>
            ) : isSupplement ? (
              <>
                <p>系统已收到您的基本申请资料，但学籍信息卡尚未上传。</p>
                <p>请补传学籍信息卡后，申请会自动转入正式审核流程。</p>
              </>
            ) : (
              <>
                <p>当前申请资料已经齐全，工作人员正在进行审核。</p>
                <p>审核完成后，系统会进入"通过"或"驳回"结果页。</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {isSupplement ? (
        <div className="mt-6 px-4">
          <Button asChild className="h-12 w-full gap-2">
            <Link href={`/application/supplement/${application.id}`}>
              去补充学籍信息卡
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
