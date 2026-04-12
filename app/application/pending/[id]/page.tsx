import { notFound, redirect } from "next/navigation";
import { Clock3, FileClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicationById } from "@/app/actions/application";
import { getApplicationAccessPreviews } from "@/app/actions/application-access";
import { getSystemTextByType } from "@/app/actions/system-text";
import { ApplicationAccessGuard } from "@/app/application/_components/application-access-guard";
import { readApplicationAccessCookie } from "@/lib/application-access";

export default async function ApplicationPendingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hasAccess = await readApplicationAccessCookie(id);

  if (!hasAccess) {
    const phonePreviews = await getApplicationAccessPreviews(id);
    return (
      <ApplicationAccessGuard
        applicationId={id}
        phonePreviews={phonePreviews}
      />
    );
  }

  const result = await getApplicationById(id);

  if (!result.data) {
    notFound();
  }

  const application = result.data;

  if (application.status === "SUPPLEMENT") {
    redirect(`/application/supplement/${application.id}`);
  } else if (application.status === "EDITING") {
    redirect(`/application/edit/${application.id}`);
  } else if (application.status === "APPROVED") {
    redirect(`/application/confirmation/${application.id}`);
  } else if (application.status === "REJECTED") {
    redirect(`/application/rejected/${application.id}`);
  }

  const pendingTextResult = await getSystemTextByType(
    application.semesterId,
    "PENDING_TEXT",
  );
  const pendingPageText =
    pendingTextResult?.data?.content ||
    "您的申请已提交，正在等待教育局和学校审核。";

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-primary px-4 pb-6 pt-12">
        <h1 className="text-xl font-bold text-primary-foreground">
          申请审核中
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/80">
          城中区转学申请系统
        </p>
      </div>
      <div className="-mt-3 px-4">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-5">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100`}
            >
              <Clock3 className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">
                  {application.name}
                </h2>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {application.updatedAt.toLocaleDateString()}
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
              <span className="text-muted-foreground">当前年级</span>
              <span className="font-medium text-foreground">
                {application.currentGrade}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请转入年级</span>
              <span className="font-medium text-foreground">
                {application.targetGrade}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">户籍类别</span>
              <span className="font-medium text-foreground">
                {application.residencyType === "LOCAL"
                  ? "城中区户籍"
                  : "非城中区户籍"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">监护人1</span>
              <span className="font-medium text-foreground">
                {application.guardian1Name} / {application.guardian1Phone}
              </span>
            </div>
            {application.guardian2Name || application.guardian2Phone ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">监护人2</span>
                <span className="font-medium text-foreground">
                  {application.guardian2Name} / {application.guardian2Phone}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 px-4">
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileClock className="h-5 w-5 text-primary" />
              当前状态
              <Badge>审核中</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="block indent-[2em] !important">
            {pendingPageText}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
