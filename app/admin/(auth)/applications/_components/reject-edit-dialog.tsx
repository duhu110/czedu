"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { rejectForEditing } from "@/app/actions/application";
import { REJECTABLE_FIELDS } from "@/lib/validations/application";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface RejectEditDialogProps {
  applicationId: string;
  residencyType: "LOCAL" | "NON_LOCAL";
  currentRemark: string | null;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function RejectEditDialog({
  applicationId,
  residencyType,
  currentRemark,
  onSuccess,
  children,
}: RejectEditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [remark, setRemark] = useState(currentRemark || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // 根据户籍类型过滤可见分组
  const visibleGroups = REJECTABLE_FIELDS.filter((group) => {
    if (!("condition" in group) || !group.condition) return true;
    return group.condition === residencyType;
  });

  const toggleField = (field: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const toggleGroup = (fields: readonly { field: string }[], selectAll: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const f of fields) {
        if (selectAll) {
          next.add(f.field);
        } else {
          next.delete(f.field);
        }
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) {
      toast.error("请至少选择一个需要修改的字段", { position: "top-center" });
      return;
    }
    if (!remark.trim()) {
      toast.error("请填写审核备注告知家长原因", { position: "top-center" });
      return;
    }

    setIsSubmitting(true);
    const res = await rejectForEditing(
      applicationId,
      Array.from(selected),
      remark,
    );
    setIsSubmitting(false);

    if (res.success) {
      toast.success("已标记问题字段，请让家长扫码修改", { position: "top-center" });
      setOpen(false);
      setShowQrCode(true);
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(res.error || "操作失败", { position: "top-center" });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>驳回修改 - 选择需要修改的字段</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {visibleGroups.map((group) => {
              const allSelected = group.fields.every((f) =>
                selected.has(f.field),
              );
              return (
                <div key={group.group} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">
                      {group.group}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => toggleGroup(group.fields, !allSelected)}
                    >
                      {allSelected ? "清除" : "全选"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {group.fields.map((f) => (
                      <label
                        key={f.field}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors has-[data-checked]:border-primary/50 has-[data-checked]:bg-primary/5"
                      >
                        <Checkbox
                          checked={selected.has(f.field)}
                          onCheckedChange={() => toggleField(f.field)}
                        />
                        <span className="text-sm">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="space-y-2 pt-2 border-t">
              <label className="text-sm font-medium">
                审核备注（必填，告知家长修改原因）
              </label>
              <Textarea
                placeholder="例如：户口簿首页照片模糊看不清，身份证号码有误，请核实后重新填写..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="h-24"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              已选 {selected.size} 项问题字段
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={isSubmitting || selected.size === 0}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                确认驳回
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 驳回成功后自动弹出二维码对话框 */}
      {showQrCode && (
        <EditQrcodeDialogLazy
          applicationId={applicationId}
          open={showQrCode}
          onOpenChange={setShowQrCode}
        />
      )}
    </>
  );
}

// 懒加载二维码对话框，避免循环依赖
import { EditQrcodeDialog as EditQrcodeDialogLazy } from "./edit-qrcode-dialog";
