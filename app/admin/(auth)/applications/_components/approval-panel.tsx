"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type ApplicationStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";

import { updateApplicationStatus } from "@/app/actions/application";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface ApprovalPanelProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  currentRemark: string | null;
}

export function ApprovalPanel({
  applicationId,
  currentStatus,
  currentRemark,
}: ApprovalPanelProps) {
  const router = useRouter();
  const [remark, setRemark] = useState(currentRemark || "");
  const [isSubmitting, setIsSubmitting] = useState<ApplicationStatus | null>(
    null,
  );

  const handleAction = async (status: ApplicationStatus) => {
    // 如果是驳回或要求补充，最好强制要求填备注
    if ((status === "REJECTED" || status === "SUPPLEMENT") && !remark.trim()) {
      toast.error("请填写审核备注告知家长原因");
      return;
    }

    setIsSubmitting(status);
    const res = await updateApplicationStatus(applicationId, status, remark);
    setIsSubmitting(null);

    if (res.success) {
      toast.success("审核状态已更新");
      router.refresh(); // 刷新当前详情页的数据
    } else {
      toast.error(res.error || "更新失败");
    }
  };

  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-lg">审核操作区</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">
            审核备注（必填：针对驳回/补充的情况）
          </label>
          <Textarea
            placeholder="例如：户口本照片不清晰，请重新拍摄首页及学生页..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="h-24"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3 bg-muted/10 pt-4">
        <Button
          variant="default"
          onClick={() => handleAction("APPROVED")}
          disabled={!!isSubmitting || currentStatus === "APPROVED"}
        >
          {isSubmitting === "APPROVED" && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          通过申请
        </Button>

        <Button
          variant="outline"
          onClick={() => handleAction("SUPPLEMENT")}
          disabled={!!isSubmitting || currentStatus === "SUPPLEMENT"}
        >
          {isSubmitting === "SUPPLEMENT" && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          打回补充
        </Button>

        <Button
          variant="destructive"
          onClick={() => handleAction("REJECTED")}
          disabled={!!isSubmitting || currentStatus === "REJECTED"}
        >
          {isSubmitting === "REJECTED" && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          直接驳回
        </Button>
      </CardFooter>
    </Card>
  );
}
