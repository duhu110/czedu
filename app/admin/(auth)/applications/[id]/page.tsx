import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";

import { getApplicationById } from "@/app/actions/application";
import type { DeserializedApplication } from "@/app/actions/application";
import { getSchools } from "@/app/actions/school";
import { getSystemTextByType } from "@/app/actions/system-text";
import { ApprovalPanel } from "../_components/approval-panel";
import { ApplicationPrintSheet } from "../_components/application-print-sheet";
import { PrintProvider } from "../_components/print-context";
import {
  formatPrintTimeLabel,
  getPendingLookupUrl,
} from "../_components/application-print-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ApplicationStatus } from "@prisma/client";
import { ImageLightbox, PreviewableImage } from "../_components/image-lightbox";
import {
  PROPERTY_TYPE_LABELS,
  REJECTABLE_FIELDS,
} from "@/lib/validations/application";
import {
  getRecommendedSchool,
  getSchoolNames,
  toSchoolEntries,
} from "@/lib/school-matching";

// 字段路径 → 中文标签映射
const fieldLabelMap = new Map<string, string>();
for (const group of REJECTABLE_FIELDS) {
  for (const f of group.fields) {
    fieldLabelMap.set(f.field, f.label);
  }
}

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
  SUPPLEMENT: { label: "待补学籍信息卡", variant: "outline" },
  EDITING: { label: "待修改", variant: "outline" },
};

// 辅助渲染：扁平数组图片（学籍信息卡、居住证）
const ImageSection = ({ title, urls }: { title: string; urls: string[] }) => {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {urls.map((url, i) => (
          <PreviewableImage
            key={i}
            url={url}
            alt={`${title} ${i + 1}`}
            groupUrls={urls}
            groupAlts={urls.map((_, j) => `${title} ${j + 1}`)}
          />
        ))}
      </div>
    </div>
  );
};

// 辅助渲染：单张命名图片
const LabeledImage = ({
  label,
  url,
  groupUrls,
  groupAlts,
}: {
  label: string;
  url: string;
  groupUrls?: string[];
  groupAlts?: string[];
}) => {
  if (!url) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="aspect-square rounded border border-dashed bg-muted/30 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">未上传</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <PreviewableImage
        url={url}
        alt={label}
        groupUrls={groupUrls}
        groupAlts={groupAlts}
      />
    </div>
  );
};

// 户口簿结构化展示
const HukouSection = ({
  fileHukou,
}: {
  fileHukou: DeserializedApplication["fileHukou"];
}) => {
  // 收集所有户口簿图片用于灯箱分组导航
  const allUrls = [
    fileHukou.frontPage,
    fileHukou.householderPage,
    fileHukou.guardianPage,
    fileHukou.studentPage,
  ].filter(Boolean);
  const allAlts = ["首页", "户主页", "法定监护人页", "学生页"].filter(
    (_, i) =>
      [
        fileHukou.frontPage,
        fileHukou.householderPage,
        fileHukou.guardianPage,
        fileHukou.studentPage,
      ][i],
  );

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">户口簿</h3>
      <div className="grid grid-cols-2 gap-3">
        <LabeledImage
          label="首页"
          url={fileHukou.frontPage}
          groupUrls={allUrls}
          groupAlts={allAlts}
        />
        <LabeledImage
          label="户主页"
          url={fileHukou.householderPage}
          groupUrls={allUrls}
          groupAlts={allAlts}
        />
        <LabeledImage
          label="法定监护人页"
          url={fileHukou.guardianPage}
          groupUrls={allUrls}
          groupAlts={allAlts}
        />
        <LabeledImage
          label="学生页"
          url={fileHukou.studentPage}
          groupUrls={allUrls}
          groupAlts={allAlts}
        />
      </div>
      {fileHukou.others.length > 0 && (
        <ImageSection title="其他页面" urls={fileHukou.others} />
      )}
    </div>
  );
};

// 住房证明结构化展示
const PropertySection = ({
  fileProperty,
}: {
  fileProperty: DeserializedApplication["fileProperty"];
}) => {
  const hasAny =
    fileProperty.propertyDeed ||
    fileProperty.purchaseContract ||
    fileProperty.rentalCert ||
    fileProperty.others.length > 0;

  if (!hasAny) return null;

  // 收集所有住房证明图片用于灯箱分组导航
  const entries: { label: string; url: string }[] = [
    { label: "不动产权证", url: fileProperty.propertyDeed },
    { label: "购房合同", url: fileProperty.purchaseContract },
    { label: "房屋租赁备案证明", url: fileProperty.rentalCert },
  ].filter((e): e is { label: string; url: string } => Boolean(e.url));
  const groupUrls = entries.map((e) => e.url);
  const groupAlts = entries.map((e) => e.label);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">住房证明</h3>
      <div className="grid grid-cols-2 gap-3">
        {fileProperty.propertyDeed && (
          <LabeledImage
            label="不动产权证"
            url={fileProperty.propertyDeed}
            groupUrls={groupUrls}
            groupAlts={groupAlts}
          />
        )}
        {fileProperty.purchaseContract && (
          <LabeledImage
            label="购房合同"
            url={fileProperty.purchaseContract}
            groupUrls={groupUrls}
            groupAlts={groupAlts}
          />
        )}
        {fileProperty.rentalCert && (
          <LabeledImage
            label="房屋租赁备案证明"
            url={fileProperty.rentalCert}
            groupUrls={groupUrls}
            groupAlts={groupAlts}
          />
        )}
      </div>
      {fileProperty.others.length > 0 && (
        <ImageSection title="其他证明" urls={fileProperty.others} />
      )}
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

  const schoolsResult = await getSchools();
  const schoolEntries = toSchoolEntries(schoolsResult.data ?? []);
  const schoolNames = getSchoolNames(schoolEntries);
  const recommendedSchool = getRecommendedSchool(
    app.hukouAddress,
    app.livingAddress,
    app.residencyType,
    schoolEntries,
  );

  // 获取 SystemText 数据
  const [transferNoticeRes, consentFormRes, pendingTextRes] = await Promise.all(
    [
      getSystemTextByType(app.semesterId, "TRANSFER_NOTICE"),
      getSystemTextByType(app.semesterId, "CONSENT_FORM"),
      getSystemTextByType(app.semesterId, "PENDING_TEXT"),
    ],
  );

  const printTimeLabel = formatPrintTimeLabel(new Date());
  const pendingLookupUrl = getPendingLookupUrl(app.id, "https://czedu.local");
  let qrCodeDataUrl: string | null = null;

  try {
    qrCodeDataUrl = await QRCode.toDataURL(pendingLookupUrl, {
      margin: 1,
      width: 132,
    });
  } catch (error) {
    console.error("Generate Application Print QR Error:", error);
  }

  return (
    <ImageLightbox>
      <PrintProvider>
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 左列：文本信息（与申请表单卡片顺序一致） */}
              <div className="lg:col-span-5 space-y-6">
                {/* 卡片1：学生基本信息 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">1. 学生基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 py-1 border-b">
                      <span className="text-muted-foreground">姓名</span>
                      <span className="col-span-2 font-medium">{app.name}</span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b">
                      <span className="text-muted-foreground">性别</span>
                      <span className="col-span-2">
                        {app.gender === "MALE" ? "男" : "女"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b">
                      <span className="text-muted-foreground">民族</span>
                      <span className="col-span-2">{app.ethnicity}</span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b">
                      <span className="text-muted-foreground">身份证号</span>
                      <span className="col-span-2 font-mono">{app.idCard}</span>
                    </div>
                    <div className="grid grid-cols-3 py-1">
                      <span className="text-muted-foreground">学籍号</span>
                      <span className="col-span-2 font-mono">
                        {app.studentId}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 卡片2：房产信息 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">2. 房产信息</CardTitle>
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
                      <span className="text-muted-foreground">房产情况</span>
                      <span className="col-span-2">
                        {PROPERTY_TYPE_LABELS[app.propertyType]}
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

                {/* 卡片3：监护人信息 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">3. 监护人信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 py-1 border-b">
                      <span className="text-muted-foreground">监护人1</span>
                      <span className="col-span-2">
                        {app.guardian1Name} ({app.guardian1Phone})
                      </span>
                    </div>
                    {app.guardian2Name && (
                      <div className="grid grid-cols-3 py-1">
                        <span className="text-muted-foreground">监护人2</span>
                        <span className="col-span-2">
                          {app.guardian2Name} ({app.guardian2Phone})
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 卡片4：转学信息（分配学校已移至审核操作区） */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">4. 转学信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 py-1 border-b">
                      <span className="text-muted-foreground">当前学校</span>
                      <span className="col-span-2">{app.currentSchool}</span>
                    </div>
                    <div className="grid grid-cols-3 py-1">
                      <span className="text-muted-foreground">年级变更</span>
                      <span className="col-span-2 text-primary font-medium">
                        {app.currentGrade} → {app.targetGrade}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 驳回修改信息提示 */}
                {app.status === "EDITING" && app.rejectedFields.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-700">
                        已驳回修改 - 等待家长扫码修改以下字段
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {app.rejectedFields.map((field) => (
                          <Badge
                            key={field}
                            variant="outline"
                            className="text-xs border-orange-300 text-orange-700"
                          >
                            {fieldLabelMap.get(field) || field}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 审批操作面板 */}
                <ApprovalPanel
                  applicationId={app.id}
                  currentStatus={app.status}
                  currentRemark={app.adminRemark}
                  currentTargetSchool={app.targetSchool}
                  schoolNames={schoolNames}
                  recommendedSchool={recommendedSchool}
                  residencyType={app.residencyType}
                  updatedAt={app.updatedAt}
                />
              </div>

              {/* 右列：上传的附件资料 */}
              <div className="lg:col-span-7">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      5. 证明材料原件
                      <span className="text-xs font-normal text-muted-foreground">
                        点击图片可全屏查看
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 bg-muted/10 pt-4 rounded-b-xl">
                    <HukouSection fileHukou={app.fileHukou} />
                    <PropertySection fileProperty={app.fileProperty} />
                    <ImageSection
                      title="学生学籍信息表"
                      urls={app.fileStudentCard}
                    />
                    {app.residencyType === "NON_LOCAL" && (
                      <ImageSection
                        title="监护人及学生居住证"
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
            qrCodeDataUrl={qrCodeDataUrl}
            transferNoticeContent={transferNoticeRes.data?.content ?? null}
            consentFormContent={consentFormRes.data?.content ?? null}
            pendingTextContent={pendingTextRes.data?.content ?? null}
          />
        </div>
      </PrintProvider>
    </ImageLightbox>
  );
}
