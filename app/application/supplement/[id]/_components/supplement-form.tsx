"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { submitApplicationSupplement } from "@/app/actions/application";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";

export function SupplementForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [fileStudentCard, setFileStudentCard] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit() {
    setIsSubmitting(true);
    const result = await submitApplicationSupplement(applicationId, {
      fileStudentCard,
    });
    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error || "补件提交失败");
      return;
    }
    toast.success("学籍信息卡已提交，申请已转为待审核");
    router.push(`/application/pending/${applicationId}`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">
          请上传学生学籍信息卡
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          学籍信息卡照片为转学申请必须提交的材料，请尽快提交。
        </p>
        <p className="mt-1 text-xs leading-5 text-warning">
          由原就读学校打印并加盖学校公章，需包含学生姓名、身份证号、学籍号、当前年级、当前班级等信息。
        </p>
        <div className="mt-4">
          <ImageUploader
            value={fileStudentCard}
            onChange={setFileStudentCard}
            maxCount={3}
          />
        </div>
      </div>

      <Button
        type="button"
        className="h-12 w-full gap-2"
        onClick={handleSubmit}
        disabled={isSubmitting || fileStudentCard.length === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            正在提交学籍信息卡...
          </>
        ) : (
          <>
            <UploadCloud className="h-4 w-4" />
            提交学籍信息卡
          </>
        )}
      </Button>
    </div>
  );
}
