import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, FileText } from "lucide-react";

import { getApplicationById } from "@/app/actions/application";
import { getApplicationAccessPreviews } from "@/app/actions/application-access";
import { getSystemTextByType } from "@/app/actions/system-text";
import { ApplicationAccessGuard } from "@/app/application/_components/application-access-guard";
import { readApplicationAccessCookie } from "@/lib/application-access";
import { SupplementForm } from "./_components/supplement-form";

function UploadStatusRow({
  label,
  uploaded,
}: {
  label: string;
  uploaded: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 text-sm">
      <span className="text-foreground">{label}</span>
      <Badge variant={uploaded ? "default" : "outline"}>
        {uploaded ? "已上传" : "待上传"}
      </Badge>
    </div>
  );
}

export default async function ApplicationSupplementPage({
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
  const supplementTextResult = await getSystemTextByType(
    application.semesterId,
    "SUPPLEMENT_TEXT",
  );
  const supplementTextContent =
    supplementTextResult.data?.content?.trim() ||
    "该申请缺少学籍信息表，请补传后继续审核。";

  if (application.status === "PENDING") {
    redirect(`/application/pending/${application.id}`);
  }

  if (application.status === "APPROVED") {
    redirect(`/application/confirmation/${application.id}`);
  }

  if (application.status === "REJECTED") {
    redirect(`/application/rejected/${application.id}`);
  }

  // 判断户口簿是否完整上传
  const hukouUploaded =
    !!application.fileHukou.frontPage &&
    !!application.fileHukou.householderPage &&
    !!application.fileHukou.guardianPage &&
    !!application.fileHukou.studentPage;

  // 判断住房证明是否上传（仅城中区户籍）
  const propertyUploaded =
    !!application.fileProperty.propertyDeed ||
    !!application.fileProperty.purchaseContract ||
    !!application.fileProperty.rentalCert;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-primary px-4 pb-6 pt-12">
        <h1 className="text-xl font-bold text-primary-foreground">
          补传学籍信息卡
        </h1>
        <p className="mt-1 whitespace-pre-line text-sm text-primary-foreground/80">
          {supplementTextContent}
        </p>
      </div>
      <div className="-mt-3 space-y-6 px-4">
        <Card>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-4 px-4 py-5">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100`}
              >
                <UploadCloud className="h-7 w-7 text-yellow-600" />
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              已提交资料
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <UploadStatusRow label="户口簿" uploaded={hukouUploaded} />
            {application.residencyType === "LOCAL" && (
              <UploadStatusRow label="住房证明" uploaded={propertyUploaded} />
            )}
            {application.residencyType === "NON_LOCAL" ? (
              <UploadStatusRow
                label="居住证"
                uploaded={application.fileResidencePermit.length > 0}
              />
            ) : null}
            <UploadStatusRow
              label="学生学籍信息表"
              uploaded={application.fileStudentCard.length > 0}
            />
          </CardContent>
        </Card>
        <SupplementForm applicationId={application.id} />
      </div>
    </div>
  );
}
