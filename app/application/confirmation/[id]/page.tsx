import { notFound, redirect } from "next/navigation";
import { CheckCircle2, CircleX } from "lucide-react";

import { getApplicationById } from "@/app/actions/application";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovedConfirmationPanel } from "../_components/approved-confirmation-panel";

export default async function ApplicationConfirmationPage({
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

  if (application.status === "PENDING" || application.status === "SUPPLEMENT") {
    redirect(`/application/pending/${application.id}`);
  }

  const isApproved = application.status === "APPROVED";

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-primary px-4 pb-6 pt-12">
        <h1 className="text-xl font-bold text-primary-foreground">确认结果</h1>
        <p className="mt-1 text-sm text-primary-foreground/80">
          {isApproved ? "您的申请已审核通过" : "您的申请未通过审核"}
        </p>
      </div>

      <div className="-mt-3 px-4">
        <Card className="overflow-hidden">
          <div
            className={`px-4 py-5 ${isApproved ? "bg-green-50" : "bg-red-50"}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                  isApproved ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {isApproved ? (
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                ) : (
                  <CircleX className="h-7 w-7 text-red-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground">
                    {isApproved ? "审核通过" : "审核驳回"}
                  </h2>
                  <Badge variant={isApproved ? "default" : "destructive"}>
                    {isApproved ? "APPROVED" : "REJECTED"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  申请编号：{application.id}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="space-y-4 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请人</span>
              <span className="font-medium text-foreground">{application.name}</span>
            </div>
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
            {isApproved ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">分配学校</span>
                <span className="font-medium text-primary">
                  {application.targetSchool || "待分配"}
                </span>
              </div>
            ) : (
              <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="font-medium text-foreground">驳回原因</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {application.adminRemark || "未填写审核备注"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isApproved ? <ApprovedConfirmationPanel /> : null}
    </div>
  );
}
