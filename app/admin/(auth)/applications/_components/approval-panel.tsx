"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type ApplicationStatus } from "@prisma/client";
import { Loader2, Printer, Trash2 } from "lucide-react";

import {
  updateApplicationStatus,
  deleteApplication,
} from "@/app/actions/application";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RejectEditDialog } from "./reject-edit-dialog";
import { EditQrcodeDialog } from "./edit-qrcode-dialog";
import { SchoolCombobox } from "./school-combobox";
import { usePrintContext } from "./print-context";
import { getRecommendedSchool } from "@/lib/school-matching";

interface ApprovalPanelProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  currentRemark: string | null;
  currentTargetSchool: string | null;
  residencyType: "LOCAL" | "NON_LOCAL";
  updatedAt: Date;
  hukouAddress: string;
  livingAddress: string;
}

export function ApprovalPanel({
  applicationId,
  currentStatus,
  currentRemark,
  currentTargetSchool,
  residencyType,
  updatedAt,
  hukouAddress,
  livingAddress,
}: ApprovalPanelProps) {
  const router = useRouter();
  const { triggerPrint } = usePrintContext();

  // 自动推荐学校（仅 PENDING 且无已选学校时）
  const recommendedSchool = getRecommendedSchool(
    hukouAddress,
    livingAddress,
    residencyType,
  );

  const [remark, setRemark] = useState(currentRemark || "");
  const [targetSchool, setTargetSchool] = useState(
    currentTargetSchool ||
      (currentStatus === "PENDING" && recommendedSchool ? recommendedSchool : ""),
  );
  const [isSubmitting, setIsSubmitting] = useState<ApplicationStatus | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [supplementPrintMode, setSupplementPrintMode] = useState<
    "archive" | "parent" | null
  >(null);

  const handleAction = async (status: ApplicationStatus) => {
    if (status === "APPROVED" && !targetSchool.trim()) {
      toast.error("通过申请时请填写目标学校");
      return;
    }
    if ((status === "REJECTED" || status === "SUPPLEMENT") && !remark.trim()) {
      toast.error("请填写审核备注告知家长原因");
      return;
    }

    setIsSubmitting(status);
    const res = await updateApplicationStatus(
      applicationId,
      status,
      remark,
      targetSchool,
    );
    setIsSubmitting(null);

    if (res.success) {
      toast.success("审核状态已更新");
      router.refresh();
    } else {
      toast.error(res.error || "更新失败");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteApplication(applicationId);
    setIsDeleting(false);

    if (res.success) {
      toast.success("申请已删除");
      router.push("/admin/applications");
    } else {
      toast.error(res.error || "删除失败");
    }
  };

  const handlePrint = (mode: "archive" | "parent") => {
    if (currentStatus === "SUPPLEMENT") {
      setSupplementPrintMode(mode);
    } else {
      triggerPrint(mode);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("zh-CN");
  };

  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-lg">审核操作区</CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* 当前状态描述 */}
        <div className="rounded-md border px-3 py-2 text-sm">
          <span className="text-muted-foreground mr-2">当前状态：</span>
          <span className="font-medium">
            {currentStatus === "PENDING" && "待审核 — 申请已提交，等待管理员审核处理"}
            {currentStatus === "APPROVED" && "已通过 — 申请已审核通过并分配学校"}
            {currentStatus === "REJECTED" && "已驳回 — 申请未通过审核"}
            {currentStatus === "SUPPLEMENT" && "待补充 — 需要家长补充学籍信息卡等材料"}
            {currentStatus === "EDITING" && "修改中 — 已驳回修改，等待家长重新提交"}
          </span>
        </div>

        {/* 目标学校显示/选择 */}
        {currentStatus === "PENDING" ? (
          <div>
            <label className="text-sm font-medium mb-1 block">
              目标学校（通过时必填）
            </label>
            <SchoolCombobox
              value={targetSchool}
              onChange={setTargetSchool}
              recommendedSchool={recommendedSchool}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 py-1 text-sm">
            <span className="text-muted-foreground">分配学校</span>
            <span className="col-span-2 font-medium">
              {currentTargetSchool || "尚未分配"}
            </span>
          </div>
        )}

        {/* 状态相关内容 */}
        {currentStatus === "PENDING" && (
          <>
            <div>
              <label className="text-sm font-medium mb-1 block">
                审核备注（驳回/补充时必填）
              </label>
              <Textarea
                placeholder="例如：户口本照片不清晰，请重新拍摄首页及学生页..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="h-24"
              />
            </div>
          </>
        )}

        {currentStatus === "APPROVED" && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 py-1">
              <span className="text-muted-foreground">通过时间</span>
              <span className="col-span-2">{formatDate(updatedAt)}</span>
            </div>
            {currentRemark && (
              <div className="grid grid-cols-3 py-1">
                <span className="text-muted-foreground">审核备注</span>
                <span className="col-span-2">{currentRemark}</span>
              </div>
            )}
          </div>
        )}

        {currentStatus === "REJECTED" && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 py-1">
              <span className="text-muted-foreground">拒绝时间</span>
              <span className="col-span-2">{formatDate(updatedAt)}</span>
            </div>
            {currentRemark && (
              <div className="grid grid-cols-3 py-1">
                <span className="text-muted-foreground">审核备注</span>
                <span className="col-span-2">{currentRemark}</span>
              </div>
            )}
          </div>
        )}

        {currentStatus === "SUPPLEMENT" && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 py-1">
              <span className="text-muted-foreground">操作时间</span>
              <span className="col-span-2">{formatDate(updatedAt)}</span>
            </div>
            {currentRemark && (
              <div className="grid grid-cols-3 py-1">
                <span className="text-muted-foreground">审核备注</span>
                <span className="col-span-2">{currentRemark}</span>
              </div>
            )}
            <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-orange-700 text-xs">
              请提醒家长补充学籍信息卡
            </div>
          </div>
        )}

        {currentStatus === "EDITING" && (
          <div className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 py-1">
                <span className="text-muted-foreground">操作时间</span>
                <span className="col-span-2">{formatDate(updatedAt)}</span>
              </div>
              {currentRemark && (
                <div className="grid grid-cols-3 py-1">
                  <span className="text-muted-foreground">审核备注</span>
                  <span className="col-span-2">{currentRemark}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 bg-muted/10 pt-4">
        {/* PENDING 状态操作按钮 */}
        {currentStatus === "PENDING" && (
          <div className="flex flex-wrap gap-3 w-full">
            <Button
              variant="default"
              onClick={() => handleAction("APPROVED")}
              disabled={!!isSubmitting || !targetSchool.trim()}
            >
              {isSubmitting === "APPROVED" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              通过申请
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAction("SUPPLEMENT")}
              disabled={!!isSubmitting}
            >
              {isSubmitting === "SUPPLEMENT" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              打回补充
            </Button>

            <RejectEditDialog
              applicationId={applicationId}
              residencyType={residencyType}
              currentRemark={currentRemark}
            >
              <Button
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                disabled={!!isSubmitting}
              >
                驳回修改
              </Button>
            </RejectEditDialog>

            <Button
              variant="destructive"
              onClick={() => handleAction("REJECTED")}
              disabled={!!isSubmitting}
            >
              {isSubmitting === "REJECTED" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              直接驳回
            </Button>
          </div>
        )}

        {/* EDITING 状态操作按钮 */}
        {currentStatus === "EDITING" && (
          <div className="flex flex-wrap gap-3 w-full">
            <RejectEditDialog
              applicationId={applicationId}
              residencyType={residencyType}
              currentRemark={currentRemark}
            >
              <Button
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                驳回修改
              </Button>
            </RejectEditDialog>

            <Button
              variant="outline"
              onClick={() => setShowQrCode(true)}
            >
              重新生成二维码
            </Button>
            <EditQrcodeDialog
              applicationId={applicationId}
              open={showQrCode}
              onOpenChange={setShowQrCode}
            />
          </div>
        )}

        {/* 打印按钮区（EDITING 除外） */}
        {currentStatus !== "EDITING" && (
          <>
            <Separator />
            <div className="flex gap-3 w-full print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrint("archive")}
              >
                <Printer className="mr-2 h-4 w-4" />
                留底页打印
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrint("parent")}
              >
                <Printer className="mr-2 h-4 w-4" />
                家长页打印
              </Button>
            </div>
          </>
        )}

        {/* 删除按钮 */}
        <Separator />
        <div className="w-full print:hidden">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                删除申请
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作不可恢复，将永久删除该学生的转学申请记录。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>

      {/* SUPPLEMENT 打印确认弹窗 */}
      <AlertDialog
        open={supplementPrintMode !== null}
        onOpenChange={(open) => {
          if (!open) setSupplementPrintMode(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>该申请尚需补充资料</AlertDialogTitle>
            <AlertDialogDescription>
              此申请还需要补充学籍信息卡，确认打印当前内容吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (supplementPrintMode) {
                  triggerPrint(supplementPrintMode);
                }
                setSupplementPrintMode(null);
              }}
            >
              确认打印
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
