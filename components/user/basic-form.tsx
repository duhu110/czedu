"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BasicInfo } from "@/lib/transfer-context";
import { mockBasicInfo } from "@/lib/transfer-mock";
import {
  createInitialDocumentUploads,
  documentGroupConfigs,
  type DocumentGroupKey,
  type DocumentUploads,
  validateRequiredDocumentUploads,
} from "@/lib/user-form-documents";
import {
  User,
  School,
  Phone,
  FileText,
  ArrowRight,
  Upload,
  X,
  Files,
} from "lucide-react";

export function BasicForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<BasicInfo>(mockBasicInfo);
  const [documentUploads, setDocumentUploads] = useState<DocumentUploads>(
    createInitialDocumentUploads(),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof BasicInfo, string>>
  >({});
  const [documentErrors, setDocumentErrors] = useState<
    Partial<Record<DocumentGroupKey, string>>
  >({});
  const fileInputRefs = useRef<
    Partial<Record<DocumentGroupKey, HTMLInputElement | null>>
  >({});

  const grades = [
    "一年级",
    "二年级",
    "三年级",
    "四年级",
    "五年级",
    "六年级",
    "初一",
    "初二",
    "初三",
    "高一",
    "高二",
    "高三",
  ];

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BasicInfo, string>> = {};

    if (!formData.studentName.trim()) newErrors.studentName = "请输入学生姓名";
    if (!formData.studentId.trim()) newErrors.studentId = "请输入学籍号";
    if (!formData.currentSchool.trim())
      newErrors.currentSchool = "请输入当前学校";
    if (!formData.currentGrade) newErrors.currentGrade = "请选择当前年级";
    if (!formData.targetSchool.trim())
      newErrors.targetSchool = "请输入目标学校";
    if (!formData.targetGrade) newErrors.targetGrade = "请选择目标年级";
    if (!formData.phone.trim()) newErrors.phone = "请输入联系电话";
    else if (!/^1[3-9]\d{9}$/.test(formData.phone))
      newErrors.phone = "请输入有效的手机号码";
    if (!formData.email.trim()) newErrors.email = "请输入电子邮箱";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "请输入有效的邮箱地址";
    if (!formData.reason.trim()) newErrors.reason = "请填写转学原因";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDocumentUploads = () => {
    const nextDocumentErrors = validateRequiredDocumentUploads(documentUploads);
    setDocumentErrors(nextDocumentErrors);
    return Object.keys(nextDocumentErrors).length === 0;
  };

  const handleSubmit = () => {
    const isFormValid = validateForm();
    const isDocumentValid = validateDocumentUploads();

    if (isFormValid && isDocumentValid) {
      router.push("/user/pending");
    }
  };

  const updateField = (field: keyof BasicInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDocumentSelect = (
    key: DocumentGroupKey,
    fileList: FileList | null,
  ) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const nextFiles = Array.from(fileList);
    setDocumentUploads((prev) => ({
      ...prev,
      [key]: [...prev[key], ...nextFiles],
    }));

    if (documentErrors[key]) {
      setDocumentErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleRemoveDocument = (key: DocumentGroupKey, index: number) => {
    setDocumentUploads((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const formatFileSize = (fileSize: number) => {
    if (fileSize >= 1024 * 1024) {
      return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-6">
        <h1 className="text-xl font-bold text-primary-foreground">转学申请</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          请填写学生基本资料
        </p>
      </div>

      {/* Progress */}
      <div className="px-4 -mt-3">
        <div className="bg-card rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                1
              </div>
              <span className="mt-1 text-foreground font-medium">基本资料</span>
            </div>
            <div className="flex-1 h-0.5 bg-border mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium">
                2
              </div>
              <span className="mt-1 text-muted-foreground">审核中</span>
            </div>
            <div className="flex-1 h-0.5 bg-border mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium">
                3
              </div>
              <span className="mt-1 text-muted-foreground">确认结果</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 mt-4 space-y-4">
        {/* Student Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              学生信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                学生姓名 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="请输入学生姓名"
                value={formData.studentName}
                onChange={(e) => updateField("studentName", e.target.value)}
                className={errors.studentName ? "border-destructive" : ""}
              />
              {errors.studentName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.studentName}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                学籍号 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="请输入学籍号"
                value={formData.studentId}
                onChange={(e) => updateField("studentId", e.target.value)}
                className={errors.studentId ? "border-destructive" : ""}
              />
              {errors.studentId && (
                <p className="text-xs text-destructive mt-1">
                  {errors.studentId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* School Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <School className="w-4 h-4 text-primary" />
              学校信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                当前学校 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="请输入当前就读学校"
                value={formData.currentSchool}
                onChange={(e) => updateField("currentSchool", e.target.value)}
                className={errors.currentSchool ? "border-destructive" : ""}
              />
              {errors.currentSchool && (
                <p className="text-xs text-destructive mt-1">
                  {errors.currentSchool}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                当前年级 <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.currentGrade}
                onValueChange={(v) => updateField("currentGrade", v)}
              >
                <SelectTrigger
                  className={errors.currentGrade ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="请选择当前年级" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currentGrade && (
                <p className="text-xs text-destructive mt-1">
                  {errors.currentGrade}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                目标学校 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="请输入申请转入的学校"
                value={formData.targetSchool}
                onChange={(e) => updateField("targetSchool", e.target.value)}
                className={errors.targetSchool ? "border-destructive" : ""}
              />
              {errors.targetSchool && (
                <p className="text-xs text-destructive mt-1">
                  {errors.targetSchool}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                目标年级 <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.targetGrade}
                onValueChange={(v) => updateField("targetGrade", v)}
              >
                <SelectTrigger
                  className={errors.targetGrade ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="请选择目标年级" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetGrade && (
                <p className="text-xs text-destructive mt-1">
                  {errors.targetGrade}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              联系方式
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                联系电话 <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                placeholder="请输入家长联系电话"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                电子邮箱 <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="请输入电子邮箱"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reason */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              转学原因
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                转学原因 <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="请详细说明转学原因（如：家庭搬迁、工作调动等）"
                value={formData.reason}
                onChange={(e) => updateField("reason", e.target.value)}
                className={`min-h-[100px] ${errors.reason ? "border-destructive" : ""}`}
              />
              {errors.reason && (
                <p className="text-xs text-destructive mt-1">{errors.reason}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Uploads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Files className="w-4 h-4 text-primary" />
              资料上传
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              户口本和房产证均为必传，每组支持上传多份文件。
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentGroupConfigs.map((group) => {
              const files = documentUploads[group.key];

              return (
                <div
                  key={group.key}
                  className="rounded-2xl border border-border p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-foreground">
                          {group.label}
                        </h3>
                        {group.required && (
                          <span className="text-xs text-destructive">*必传</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {group.description}
                      </p>
                    </div>
                    <Badge variant="secondary">{files.length} 份</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex min-w-0 items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(group.key, index)}
                          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          aria-label={`删除${group.label}文件${index + 1}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <input
                    ref={(element) => {
                      fileInputRefs.current[group.key] = element;
                    }}
                    data-testid={`upload-input-${group.key}`}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(event) => {
                      handleDocumentSelect(group.key, event.target.files);
                      event.target.value = "";
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => fileInputRefs.current[group.key]?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    上传{group.label}
                  </Button>

                  {documentErrors[group.key] && (
                    <p className="text-xs text-destructive">
                      {documentErrors[group.key]}
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-base font-medium gap-2"
        >
          提交申请
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-xs text-muted-foreground text-center pb-4">
          当前为 Mock 录入页，提交后将直接跳转到审核中页面
        </p>
      </div>
    </div>
  );
}
