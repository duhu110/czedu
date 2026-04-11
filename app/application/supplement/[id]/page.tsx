import { notFound, redirect } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";

import { getApplicationById } from "@/app/actions/application";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const result = await getApplicationById(id);

  if (!result.data) {
    notFound();
  }

  const application = result.data;

  if (application.status === "PENDING") {
    redirect(`/application/pending/${application.id}`);
  }

  if (application.status === "APPROVED" || application.status === "REJECTED") {
    redirect(`/application/confirmation/${application.id}`);
  }

  // 判断户口本是否完整上传
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
        <h1 className="text-xl font-bold text-primary-foreground">补传学籍信息卡</h1>
        <p className="mt-1 text-sm text-primary-foreground/80">
          该申请缺少学籍信息表，请补传后继续审核。
        </p>
      </div>

      <div className="-mt-3 space-y-6 px-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">申请信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请人</span>
              <span className="font-medium text-foreground">{application.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">身份证号</span>
              <span className="font-medium text-foreground">{application.idCard}</span>
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">主监护人</span>
              <span className="font-medium text-foreground">
                {application.guardian1Name} / {application.guardian1Phone}
              </span>
            </div>
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
            <UploadStatusRow
              label="户口本（首页、户主页、监护人页、学生页）"
              uploaded={hukouUploaded}
            />
            {application.residencyType === "LOCAL" && (
              <UploadStatusRow
                label="住房证明（不动产权证/购房合同/租赁备案证明）"
                uploaded={propertyUploaded}
              />
            )}
            <UploadStatusRow
              label="学生学籍信息表"
              uploaded={application.fileStudentCard.length > 0}
            />
            {application.residencyType === "NON_LOCAL" ? (
              <UploadStatusRow
                label="监护人或学生居住证"
                uploaded={application.fileResidencePermit.length > 0}
              />
            ) : null}
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
              <p className="leading-6 text-muted-foreground">
                已上传资料仅展示提交状态，不在此页面重复展示图片内容。
              </p>
            </div>
          </CardContent>
        </Card>

        <SupplementForm applicationId={application.id} />
      </div>
    </div>
  );
}
