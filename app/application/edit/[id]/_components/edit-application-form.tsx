"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, useWatch, type FieldErrors, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SingleImageUploader } from "@/components/ui/single-image-uploader";
import {
  applicationSchema,
  ETHNICITY_OPTIONS,
  GRADE_OPTIONS,
  GUARDIAN_RELATION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  type ApplicationFormValues,
  type ApplicationInput,
} from "@/lib/validations/application";
import { submitApplicationEdit } from "@/app/actions/application";
import type { DeserializedApplication } from "@/app/actions/application";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditApplicationFormProps {
  application: DeserializedApplication;
  rejectedFields: string[];
}

type EditApplicationFormHook = UseFormReturn<
  ApplicationFormValues,
  unknown,
  ApplicationInput
>;

/** 检查字段路径是否在驳回列表中 */
function isRejected(field: string, rejectedFields: string[]): boolean {
  return rejectedFields.includes(field);
}

/** 被驳回字段的包装样式 */
function RejectedFieldWrapper({
  field,
  rejectedFields,
  children,
}: {
  field: string;
  rejectedFields: string[];
  children: React.ReactNode;
}) {
  const rejected = isRejected(field, rejectedFields);
  if (!rejected) return <>{children}</>;
  return (
    <div className="relative rounded-lg border-2 border-orange-300 bg-orange-50/30 p-3 -m-1">
      <span className="absolute -top-2.5 left-2 bg-orange-100 text-orange-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
        需修改
      </span>
      {children}
    </div>
  );
}

/** 根据驳回列表计算默认值 */
function computeDefaultValues(
  app: DeserializedApplication,
  rejectedFields: string[],
): ApplicationFormValues {
  const r = (field: string) => isRejected(field, rejectedFields);

  return {
    semesterId: app.semesterId,
    residencyType: r("residencyType")
      ? ("LOCAL" as ApplicationFormValues["residencyType"])
      : (app.residencyType as ApplicationFormValues["residencyType"]),
    propertyType: r("propertyType")
      ? ("PURCHASE" as ApplicationFormValues["propertyType"])
      : ((app.propertyType || "PURCHASE") as ApplicationFormValues["propertyType"]),
    name: r("name") ? "" : app.name,
    gender: r("gender")
      ? ("MALE" as ApplicationFormValues["gender"])
      : (app.gender as ApplicationFormValues["gender"]),
    ethnicity: r("ethnicity") ? "汉族" : app.ethnicity,
    idCard: r("idCard") ? "" : app.idCard,
    studentId: r("studentId") ? "" : app.studentId,
    guardian1Name: r("guardian1Name") ? "" : app.guardian1Name,
    guardian1Relation: r("guardian1Relation") ? "" : app.guardian1Relation,
    guardian1Phone: r("guardian1Phone") ? "" : app.guardian1Phone,
    guardian2Name: r("guardian2Name") ? "" : (app.guardian2Name || ""),
    guardian2Relation: r("guardian2Relation") ? "" : (app.guardian2Relation || ""),
    guardian2Phone: r("guardian2Phone") ? "" : (app.guardian2Phone || ""),
    currentSchool: r("currentSchool") ? "" : app.currentSchool,
    currentGrade: r("currentGrade") ? "" : app.currentGrade,
    targetGrade: r("targetGrade") ? "" : app.targetGrade,
    remark: r("remark") ? "" : (app.remark || ""),
    hukouAddress: r("hukouAddress") ? "" : app.hukouAddress,
    livingAddress: r("livingAddress") ? "" : app.livingAddress,
    fileHukou: {
      frontPage: r("fileHukou.frontPage") ? "" : app.fileHukou.frontPage,
      householderPage: r("fileHukou.householderPage") ? "" : app.fileHukou.householderPage,
      guardianPage: r("fileHukou.guardianPage") ? "" : app.fileHukou.guardianPage,
      studentPage: r("fileHukou.studentPage") ? "" : app.fileHukou.studentPage,
      others: r("fileHukou.others") ? [] : app.fileHukou.others,
    },
    fileProperty: {
      propertyDeed: r("fileProperty.propertyDeed") ? "" : app.fileProperty.propertyDeed,
      purchaseContract: r("fileProperty.purchaseContract") ? "" : app.fileProperty.purchaseContract,
      rentalCert: r("fileProperty.rentalCert") ? "" : app.fileProperty.rentalCert,
      others: r("fileProperty.others") ? [] : app.fileProperty.others,
    },
    fileStudentCard: r("fileStudentCard") ? [] : app.fileStudentCard,
    fileResidencePermit: r("fileResidencePermit") ? [] : app.fileResidencePermit,
  };
}

export function EditApplicationForm({
  application,
  rejectedFields,
}: EditApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormValues, unknown, ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: computeDefaultValues(application, rejectedFields),
  });

  const residencyType = useWatch({
    control: form.control,
    name: "residencyType",
  });

  // 切换为城中区户籍时不再需要居住证
  useEffect(() => {
    if (residencyType === "LOCAL") {
      form.setValue("fileResidencePermit", []);
    }
  }, [residencyType, form]);

  const onInvalid = useCallback((errors: FieldErrors<ApplicationFormValues>) => {
    let count = 0;
    const walk = (obj: unknown) => {
      if (!obj || typeof obj !== "object") return;
      if ("message" in obj && typeof (obj as { message: unknown }).message === "string") {
        count++;
        return;
      }
      for (const v of Object.values(obj)) walk(v);
    };
    walk(errors);
    toast.error(`请检查表单中的 ${count} 项错误`, {
      description: "请向上滚动查看并修正标红的字段",
    });
  }, []);

  async function onSubmit(values: ApplicationInput) {
    setIsSubmitting(true);
    const res = await submitApplicationEdit(application.id, values);
    setIsSubmitting(false);
    if (res.success) {
      toast.success("申请信息修改成功！");
      router.push(`/application/edit/${application.id}/success`);
    } else {
      toast.error(res.error || "提交失败，请重试");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* ==================== 卡片1：学生基本信息 ==================== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1. 学生基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RejectedFieldWrapper field="name" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="学生姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>

            <div className="grid grid-cols-2 gap-4">
              <RejectedFieldWrapper field="gender" rejectedFields={rejectedFields}>
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>性别 *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-2 h-9 items-center"
                        >
                          <FormItem className="flex items-center space-x-1 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="MALE" />
                            </FormControl>
                            <FormLabel className="font-normal">男</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-1 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="FEMALE" />
                            </FormControl>
                            <FormLabel className="font-normal">女</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RejectedFieldWrapper>
              <RejectedFieldWrapper field="ethnicity" rejectedFields={rejectedFields}>
                <FormField
                  control={form.control}
                  name="ethnicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>民族 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择民族" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ETHNICITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RejectedFieldWrapper>
            </div>

            <RejectedFieldWrapper field="idCard" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="idCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>身份证号码 *</FormLabel>
                    <FormControl>
                      <Input placeholder="18位身份证号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>
            <RejectedFieldWrapper field="studentId" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>全国学籍号码 *</FormLabel>
                    <FormControl>
                      <Input placeholder="如：G123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>
          </CardContent>
        </Card>

        {/* ==================== 卡片2：房产信息 ==================== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">2. 房产信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RejectedFieldWrapper field="residencyType" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="residencyType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>
                      户籍类型 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="LOCAL" />
                          </FormControl>
                          <FormLabel className="font-normal">城中区户籍</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="NON_LOCAL" />
                          </FormControl>
                          <FormLabel className="font-normal">非城中区户籍</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>

            <RejectedFieldWrapper field="propertyType" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>
                      房产情况 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        {PROPERTY_TYPE_OPTIONS.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>

            <RejectedFieldWrapper field="hukouAddress" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="hukouAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>户籍详细地址 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入户口簿首页上的详细地址" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>
            <RejectedFieldWrapper field="livingAddress" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="livingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>现居住详细地址 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入目前实际居住的详细地址（需与房产证/租赁合同一致）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>
          </CardContent>
        </Card>

        {/* ==================== 卡片3：监护人信息 ==================== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">3. 监护人信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">监护人1（必填）</p>
            <div className="grid grid-cols-2 gap-4">
              <RejectedFieldWrapper field="guardian1Name" rejectedFields={rejectedFields}>
                <FormField
                  control={form.control}
                  name="guardian1Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名 *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RejectedFieldWrapper>
              <RejectedFieldWrapper field="guardian1Relation" rejectedFields={rejectedFields}>
                <FormField
                  control={form.control}
                  name="guardian1Relation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>与学生关系 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GUARDIAN_RELATION_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RejectedFieldWrapper>
            </div>
            <RejectedFieldWrapper field="guardian1Phone" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="guardian1Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号码 *</FormLabel>
                    <FormControl>
                      <Input type="tel" maxLength={11} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>

            <div className="h-px bg-muted my-2" />

            <p className="text-sm font-medium text-muted-foreground">监护人2（选填）</p>
            <div className="grid grid-cols-2 gap-4">
              <RejectedFieldWrapper field="guardian2Name" rejectedFields={rejectedFields}>
                <FormField
                  control={form.control}
                  name="guardian2Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RejectedFieldWrapper>
              <RejectedFieldWrapper field="guardian2Relation" rejectedFields={rejectedFields}>
                <FormField
                  control={form.control}
                  name="guardian2Relation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>与学生关系</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GUARDIAN_RELATION_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RejectedFieldWrapper>
            </div>
            <RejectedFieldWrapper field="guardian2Phone" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="guardian2Phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号码</FormLabel>
                    <FormControl>
                      <Input type="tel" maxLength={11} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>
          </CardContent>
        </Card>

        {/* ==================== 卡片4：转学信息 ==================== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">4. 转学信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RejectedFieldWrapper field="currentSchool" rejectedFields={rejectedFields}>
              <FormField
                control={form.control}
                name="currentSchool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>当前就读学校 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入完整的学校名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RejectedFieldWrapper>
            <div className="grid grid-cols-2 gap-4">
              <RejectedFieldWrapper field="currentGrade" rejectedFields={rejectedFields}>
                <FormField
                  control={form.control}
                  name="currentGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>当前就读年级 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GRADE_OPTIONS.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RejectedFieldWrapper>
              <RejectedFieldWrapper field="targetGrade" rejectedFields={rejectedFields}>
                <FormField
                  control={form.control}
                  name="targetGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>申请转入年级 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GRADE_OPTIONS.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RejectedFieldWrapper>
            </div>
          </CardContent>
        </Card>

        {/* ==================== 卡片5：资料上传 ==================== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">5. 申请资料上传</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-xs text-muted-foreground mb-4">
              请上传清晰的原件照片。单张图片不超过 5MB。
            </div>

            <div className="space-y-4">
              {/* 户口簿 */}
              <div className={cn(
                "border rounded-lg p-4 bg-muted/30",
                (isRejected("fileHukou.frontPage", rejectedFields) ||
                  isRejected("fileHukou.householderPage", rejectedFields) ||
                  isRejected("fileHukou.guardianPage", rejectedFields) ||
                  isRejected("fileHukou.studentPage", rejectedFields) ||
                  isRejected("fileHukou.others", rejectedFields)) &&
                  "border-orange-300 bg-orange-50/30"
              )}>
                <p className="text-sm font-medium mb-1">1. 户口簿 *</p>
                <p className="text-xs text-muted-foreground mb-3">
                  请分别上传首页、户主页、法定监护人之一页和学生页
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <RejectedFieldWrapper field="fileHukou.frontPage" rejectedFields={rejectedFields}>
                    <FormField
                      control={form.control}
                      name="fileHukou.frontPage"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SingleImageUploader
                              value={field.value}
                              onChange={field.onChange}
                              label="首页"
                              hasError={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </RejectedFieldWrapper>
                  <RejectedFieldWrapper field="fileHukou.householderPage" rejectedFields={rejectedFields}>
                    <FormField
                      control={form.control}
                      name="fileHukou.householderPage"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SingleImageUploader
                              value={field.value}
                              onChange={field.onChange}
                              label="户主页"
                              hasError={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </RejectedFieldWrapper>
                  <RejectedFieldWrapper field="fileHukou.guardianPage" rejectedFields={rejectedFields}>
                    <FormField
                      control={form.control}
                      name="fileHukou.guardianPage"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SingleImageUploader
                              value={field.value}
                              onChange={field.onChange}
                              label="监护人页"
                              hasError={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </RejectedFieldWrapper>
                  <RejectedFieldWrapper field="fileHukou.studentPage" rejectedFields={rejectedFields}>
                    <FormField
                      control={form.control}
                      name="fileHukou.studentPage"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <SingleImageUploader
                              value={field.value}
                              onChange={field.onChange}
                              label="学生页"
                              hasError={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </RejectedFieldWrapper>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    其他页面（选填，最多3张）
                  </p>
                  <RejectedFieldWrapper field="fileHukou.others" rejectedFields={rejectedFields}>
                    <FormField
                      control={form.control}
                      name="fileHukou.others"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUploader
                              value={field.value}
                              onChange={field.onChange}
                              maxCount={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </RejectedFieldWrapper>
                </div>
              </div>

              {/* 住房证明 */}
              <EditPropertyUploadSection form={form} rejectedFields={rejectedFields} />

              {/* 学籍信息表 */}
              <RejectedFieldWrapper field="fileStudentCard" rejectedFields={rejectedFields}>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium mb-1">
                    3. 学生学籍信息表
                  </p>
                  <p className="mb-2 text-xs text-muted-foreground">
                    由原就读学校打印并加盖学校公章。如果暂时没有，也可以先提交申请。
                  </p>
                  <FormField
                    control={form.control}
                    name="fileStudentCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploader
                            value={field.value || []}
                            onChange={field.onChange}
                            maxCount={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </RejectedFieldWrapper>

              {/* 居住证（仅非城中区） */}
              {residencyType === "NON_LOCAL" && (
                <RejectedFieldWrapper field="fileResidencePermit" rejectedFields={rejectedFields}>
                  <div className="border border-primary/50 rounded-lg p-4 bg-primary/5 shadow-sm">
                    <p className="text-sm font-medium text-primary mb-1">
                      4. 监护人及学生居住证
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      非城中区户籍学生可上传监护人及学生在辖区内的有效居住证，大通湟源湟中户籍学生可不上传，是否上传由人工审核。
                    </p>
                    <FormField
                      control={form.control}
                      name="fileResidencePermit"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUploader
                              value={field.value || []}
                              onChange={field.onChange}
                              maxCount={3}
                              hasError={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </RejectedFieldWrapper>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="sticky bottom-0 left-0 w-full p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mt-8">
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                正在提交修改...
              </>
            ) : (
              "确认并提交修改"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

/**
 * 住房证明上传区（编辑版本）
 */
function EditPropertyUploadSection({
  form,
  rejectedFields,
}: {
  form: EditApplicationFormHook;
  rejectedFields: string[];
}) {
  const fpErrors = form.formState.errors.fileProperty;
  const hasGroupError = !!(
    fpErrors &&
    ((fpErrors as { message?: string }).message ||
      (fpErrors as { root?: { message?: string } }).root?.message)
  );

  const hasRejected =
    isRejected("fileProperty.propertyDeed", rejectedFields) ||
    isRejected("fileProperty.purchaseContract", rejectedFields) ||
    isRejected("fileProperty.rentalCert", rejectedFields) ||
    isRejected("fileProperty.others", rejectedFields);

  return (
    <div className={cn(
      "border rounded-lg p-4 bg-muted/30",
      hasRejected && "border-orange-300 bg-orange-50/30"
    )}>
      <p className="text-sm font-medium mb-1">2. 住房证明 *</p>
      <p className="text-xs text-muted-foreground mb-3">
        以下三项至少上传其中一项：不动产权证、购房合同或房屋租赁备案证明
      </p>
      <FormField
        control={form.control}
        name="fileProperty"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-3 gap-3 mb-3">
        <RejectedFieldWrapper field="fileProperty.propertyDeed" rejectedFields={rejectedFields}>
          <FormField
            control={form.control}
            name="fileProperty.propertyDeed"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SingleImageUploader
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="不动产权证"
                    hasError={hasGroupError}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </RejectedFieldWrapper>
        <RejectedFieldWrapper field="fileProperty.purchaseContract" rejectedFields={rejectedFields}>
          <FormField
            control={form.control}
            name="fileProperty.purchaseContract"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SingleImageUploader
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="购房合同"
                    hasError={hasGroupError}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </RejectedFieldWrapper>
        <RejectedFieldWrapper field="fileProperty.rentalCert" rejectedFields={rejectedFields}>
          <FormField
            control={form.control}
            name="fileProperty.rentalCert"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SingleImageUploader
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="租赁备案证明"
                    hasError={hasGroupError}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </RejectedFieldWrapper>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          其他证明（选填，最多3张）
        </p>
        <RejectedFieldWrapper field="fileProperty.others" rejectedFields={rejectedFields}>
          <FormField
            control={form.control}
            name="fileProperty.others"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploader
                    value={field.value || []}
                    onChange={field.onChange}
                    maxCount={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </RejectedFieldWrapper>
      </div>
    </div>
  );
}
