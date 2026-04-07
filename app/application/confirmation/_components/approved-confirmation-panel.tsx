"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
} from "lucide-react";

import { approvedNotices, type ApprovedNotice } from "../_data/approved-notices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ApprovedConfirmationPanel() {
  const [currentNotice, setCurrentNotice] = useState<ApprovedNotice | null>(null);
  const [readNotices, setReadNotices] = useState<Set<string>>(new Set());
  const [confirmedNotices, setConfirmedNotices] = useState<string[]>([]);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const requiredNotices = useMemo(
    () => approvedNotices.filter((notice) => notice.required),
    [],
  );
  const canAcknowledge = requiredNotices.every((notice) =>
    confirmedNotices.includes(notice.id),
  );

  function handleCloseDialog() {
    if (currentNotice) {
      setReadNotices((prev) => new Set(prev).add(currentNotice.id));
    }
    setCurrentNotice(null);
  }

  function handleConfirmNotice(noticeId: string, checked: boolean) {
    setHasAcknowledged(false);
    setConfirmedNotices((prev) =>
      checked ? [...prev, noticeId] : prev.filter((id) => id !== noticeId),
    );
  }

  return (
    <>
      <div className="px-4 mt-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">确认须知</h3>
          <span className="text-xs text-muted-foreground">
            （已确认 {confirmedNotices.length}/{approvedNotices.length}）
          </span>
        </div>

        <div className="space-y-3">
          {approvedNotices.map((notice) => {
            const isRead = readNotices.has(notice.id);
            const isConfirmed = confirmedNotices.includes(notice.id);

            return (
              <Card
                key={notice.id}
                className={
                  isConfirmed ? "border-green-200 bg-green-50 transition-colors" : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={notice.id}
                      checked={isConfirmed}
                      onCheckedChange={(checked) =>
                        handleConfirmNotice(notice.id, checked === true)
                      }
                      disabled={!isRead}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor={notice.id}
                          className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
                        >
                          {notice.title}
                          {notice.required ? (
                            <span className="text-xs text-destructive">*必读</span>
                          ) : null}
                        </label>
                        {isConfirmed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isRead ? "已阅读，可勾选确认" : "请先阅读全文后再确认"}
                      </p>
                      <Dialog
                        open={currentNotice?.id === notice.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            handleCloseDialog();
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-2 h-auto p-0 text-primary"
                            onClick={() => setCurrentNotice(notice)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            {isRead ? "再次阅读" : "阅读全文"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] max-w-[90vw] p-0">
                          <DialogHeader className="p-4 pb-0">
                            <DialogTitle className="flex items-center gap-2 text-base">
                              <FileText className="h-4 w-4 text-primary" />
                              {notice.title}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                              阅读并确认 {notice.title}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] px-4">
                            <div className="whitespace-pre-wrap pb-4 text-sm leading-6 text-foreground">
                              {notice.content}
                            </div>
                          </ScrollArea>
                          <div className="p-4 pt-0">
                            <Button onClick={handleCloseDialog} className="w-full">
                              我已阅读
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {!canAcknowledge ? (
        <div className="px-4 mt-4">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    请完成所有必读须知
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    阅读并确认所有标记为“必读”的须知后，才能完成结果页确认。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="px-4 mt-6">
        <Button
          type="button"
          className="w-full h-12"
          disabled={!canAcknowledge}
          onClick={() => setHasAcknowledged(true)}
        >
          确认已阅读
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          请在报到前再次核对学校通知和入学材料。
        </p>
        {hasAcknowledged ? (
          <p className="mt-2 text-center text-xs text-green-700">
            已确认阅读全部必读须知。
          </p>
        ) : null}
      </div>
    </>
  );
}
