"use client";

import { useEffect, useState } from "react";
import { ExternalLinkIcon, QrCodeIcon } from "lucide-react";

import { signEditTokenAction } from "@/app/actions/application";
import { QRCode } from "@/app/admin/(auth)/qrcode/_components/qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditQrcodeDialogProps {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditQrcodeDialog({
  applicationId,
  open,
  onOpenChange,
}: EditQrcodeDialogProps) {
  const [signedUrl, setSignedUrl] = useState("");

  useEffect(() => {
    if (!open) return;

    const origin =
      typeof window === "undefined"
        ? "https://demo.czedu.local"
        : window.location.origin;

    signEditTokenAction(applicationId).then((sig) => {
      const url = new URL(`/application/edit/${applicationId}`, origin);
      url.searchParams.set("token", `EDIT-${applicationId}`);
      url.searchParams.set("sig", sig);
      setSignedUrl(url.toString());
    });
  }, [open, applicationId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCodeIcon className="size-5" />
            编辑二维码
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            请让家长扫描此二维码修改申请信息，修改提交后链接自动失效。
          </p>

          <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
            <div className="size-64">
              {signedUrl ? (
                <QRCode data={signedUrl} />
              ) : (
                <div className="flex size-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
                  正在生成二维码...
                </div>
              )}
            </div>
          </div>

          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              打开编辑页面
              <ExternalLinkIcon className="size-3.5" />
            </a>
          )}

          <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground text-center">
            此二维码无时间限制，在家长提交修改前持续有效。
            <br />
            如需重新生成，可在详情页再次点击生成。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
