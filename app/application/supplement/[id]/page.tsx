"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  mockApplicationId,
  mockBasicInfo,
  mockSupplementInfo,
  type SupplementInfo,
} from "../../_mock-data";
import {
  Camera,
  X,
  CheckCircle2,
  ImageIcon,
  FileText,
  Plus,
  ArrowLeft,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

interface UploadItem {
  id: keyof Omit<SupplementInfo, "additionalDocs">;
  title: string;
  description: string;
  required: boolean;
}

const uploadItems: UploadItem[] = [
  {
    id: "idCardFront",
    title: "身份证正面",
    description: "上传学生身份证正面照片",
    required: true,
  },
  {
    id: "idCardBack",
    title: "身份证背面",
    description: "上传学生身份证背面照片",
    required: true,
  },
  {
    id: "transcript",
    title: "成绩单",
    description: "上传原学校开具的成绩单",
    required: true,
  },
  {
    id: "transferLetter",
    title: "转学证明",
    description: "上传原学校开具的转学证明",
    required: true,
  },
];

export default function ApplicationSupplementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SupplementInfo>(mockSupplementInfo);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const additionalInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (
    id: keyof Omit<SupplementInfo, "additionalDocs">,
    file: File,
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData((prev) => ({ ...prev, [id]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (
    id: keyof Omit<SupplementInfo, "additionalDocs">,
  ) => {
    setFormData((prev) => ({ ...prev, [id]: null }));
  };

  const handleAdditionalFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        additionalDocs: [...prev.additionalDocs, result],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAdditional = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalDocs: prev.additionalDocs.filter((_, i) => i !== index),
    }));
  };

  const requiredFields = uploadItems.filter((item) => item.required);
  const allRequiredFilled = requiredFields.every((item) => formData[item.id]);
  const uploadedCount =
    uploadItems.filter((item) => formData[item.id]).length +
    formData.additionalDocs.length;

  const handleSubmit = () => {
    if (allRequiredFilled) {
      setShowSuccess(true);
    }
  };

  const handleGoBack = () => {
    router.push("/application/confirmation");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push("/application");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="返回确认结果"
            onClick={handleGoBack}
            className="text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">
              补充材料
            </h1>
            <p className="text-sm text-primary-foreground/80 mt-1">
              请上传相关证明文件
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 -mt-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">上传进度</span>
              <span className="font-medium text-foreground">
                {uploadedCount} /{" "}
                {uploadItems.length + formData.additionalDocs.length}
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${uploadItems.length > 0 ? (uploadItems.filter((item) => formData[item.id]).length / uploadItems.length) * 100 : 0}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Uploads */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          必要材料
          <span className="text-xs text-muted-foreground font-normal">
            （全部必填）
          </span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {uploadItems.map((item) => {
            const hasFile = !!formData[item.id];

            return (
              <Card
                key={item.id}
                className={`overflow-hidden transition-colors ${hasFile ? "border-success/50" : ""}`}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {item.title}
                      </span>
                      {hasFile && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </div>

                    {hasFile ? (
                      <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={formData[item.id]!}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => handleRemoveFile(item.id)}
                          className="absolute top-1 right-1 w-6 h-6 bg-foreground/80 text-background rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                        className="aspect-[4/3] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Camera className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          点击上传
                        </span>
                      </button>
                    )}

                    <input
                      ref={(el) => {
                        fileInputRefs.current[item.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(item.id, file);
                      }}
                    />

                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Additional Documents */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          其他材料
          <span className="text-xs text-muted-foreground font-normal">
            （可选）
          </span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {formData.additionalDocs.map((doc, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <Image
                src={doc}
                alt={`附加材料 ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleRemoveAdditional(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-foreground/80 text-background rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {formData.additionalDocs.length < 6 && (
            <button
              onClick={() => additionalInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">添加</span>
            </button>
          )}

          <input
            ref={additionalInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAdditionalFile(file);
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          可上传户口本、体检报告、获奖证书等其他证明材料，最多6张
        </p>
      </div>

      {/* Tips */}
      <div className="px-4 mt-6">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium text-foreground text-sm mb-2">
              上传须知
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• 请确保照片清晰可辨认，避免模糊、反光</li>
              <li>• 证件照片需完整，不要有遮挡或裁切</li>
              <li>• 支持JPG、PNG格式，单张不超过10MB</li>
              <li>• 上传后请检查是否正确，确认无误后提交</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="px-4 mt-6">
        <Button
          onClick={handleSubmit}
          disabled={!allRequiredFilled}
          className="w-full h-12 gap-2"
        >
          <Send className="w-4 h-4" />
          提交材料
        </Button>
        {!allRequiredFilled && (
          <p className="text-xs text-destructive text-center mt-2">
            请上传所有必要材料后提交
          </p>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-[85vw] rounded-2xl">
          <DialogHeader className="items-center pt-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <DialogTitle className="text-center">提交成功</DialogTitle>
            <DialogDescription className="text-center">
              您的转学申请材料已全部提交
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">申请人</span>
                  <span className="font-medium">
                    {mockBasicInfo.studentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">目标学校</span>
                  <span className="font-medium text-primary">
                    {mockBasicInfo.targetSchool}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">申请编号</span>
                  <span className="font-medium">{mockApplicationId}</span>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground text-center mt-4">
              当前为 Mock 材料页，确认后将返回状态入口页
            </p>
          </div>
          <Button onClick={handleSuccessClose} className="w-full">
            返回首页
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
