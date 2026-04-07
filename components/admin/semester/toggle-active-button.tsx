"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { toggleSemesterActive } from "@/app/actions/semester";
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
import { Button } from "@/components/ui/button";

type ToggleActiveButtonProps = {
  id: string;
  name: string;
  isActive: boolean;
};

export function ToggleActiveButton({
  id,
  name,
  isActive,
}: ToggleActiveButtonProps) {
  const [isPending, startTransition] = React.useTransition();
  const nextIsActive = !isActive;
  const actionLabel = nextIsActive ? "启用" : "停用";

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleSemesterActive(id, nextIsActive);

      if (!result?.success) {
        toast.error(result?.error ?? "更新失败，请稍后再试");
        return;
      }

      toast.success(`学期 ${name} 已${actionLabel}`);
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`${actionLabel} ${name}`}
        >
          {actionLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认{actionLabel}学期？</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要{actionLabel}
            <span className="font-bold text-foreground">{name}</span>吗？
            {!nextIsActive ? " 停用后，该学期将不能接受新的报名申请。" : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggle} disabled={isPending}>
            {isPending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
            确认{actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
