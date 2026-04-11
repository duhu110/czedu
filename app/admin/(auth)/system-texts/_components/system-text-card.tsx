"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { upsertSystemText } from "@/app/actions/system-text";
import type { SystemTextType } from "@/lib/validations/system-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface SystemTextCardProps {
  type: SystemTextType;
  label: string;
  description: string;
  content: string | undefined;
  semesterId: string;
  onSaved: () => void;
}

export function SystemTextCard({
  type,
  label,
  description,
  content,
  semesterId,
  onSaved,
}: SystemTextCardProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(content ?? "");
  const [isPending, startTransition] = useTransition();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setDraft(content ?? "");
    }
    setOpen(isOpen);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await upsertSystemText({
        semesterId,
        type,
        content: draft,
      });
      if (result.success) {
        toast.success("保存成功");
        setOpen(false);
        onSaved();
      } else {
        toast.error(result.error ?? "保存失败");
      }
    });
  };

  const hasContent = !!content;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {label}
          <Badge variant={hasContent ? "default" : "secondary"}>
            {hasContent ? "已配置" : "未配置"}
          </Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                {hasContent ? "编辑" : "配置"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{label}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </DialogHeader>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="请输入文字内容..."
                className="min-h-[300px]"
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  取消
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      {hasContent && (
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground line-clamp-4">
            {content}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
