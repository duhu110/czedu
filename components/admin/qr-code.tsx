"use client";

import QR from "qrcode";
import { type HTMLAttributes, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type QRCodeProps = HTMLAttributes<HTMLDivElement> & {
  data: string;
  foreground?: string;
  background?: string;
  robustness?: "L" | "M" | "Q" | "H";
};

export function QRCode({
  data,
  foreground = "#111827",
  background = "#FFFFFF",
  robustness = "M",
  className,
  ...props
}: QRCodeProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function generateQr() {
      const nextSvg = await QR.toString(data, {
        type: "svg",
        color: {
          dark: foreground,
          light: background,
        },
        width: 320,
        errorCorrectionLevel: robustness,
        margin: 1,
      });

      if (active) {
        setSvg(nextSvg);
      }
    }

    generateQr().catch((error: unknown) => {
      console.error("二维码生成失败", error);
      if (active) {
        setSvg(null);
      }
    });

    return () => {
      active = false;
    };
  }, [background, data, foreground, robustness]);

  if (!svg) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground",
          className,
        )}
        {...props}
      >
        正在生成二维码...
      </div>
    );
  }

  return (
    <div
      className={cn("size-full [&_svg]:size-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
      {...props}
    />
  );
}
