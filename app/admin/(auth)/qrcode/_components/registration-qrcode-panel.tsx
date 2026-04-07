"use client";

import { useEffect, useState } from "react";
import { RefreshCcwIcon, QrCodeIcon } from "lucide-react";

import { QRCode } from "./qr-code";
import {
  buildRegistrationQrSession,
  getSecondsUntilNextRefresh,
} from "./qrcode-session";

function formatRefreshTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function RegistrationQrcodePanel() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const origin =
    typeof window === "undefined"
      ? "https://demo.czedu.local"
      : window.location.origin;
  const session = buildRegistrationQrSession(now, origin);
  const countdown = getSecondsUntilNextRefresh(now);

  return (
    <section className="flex min-h-full items-center justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-4xl rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm md:p-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-1 text-sm text-muted-foreground">
            <QrCodeIcon className="size-4" />
            新增登记二维码
          </div>

          <div className="space-y-2">
            <h1 className="font-semibold text-3xl tracking-tight">
              扫码进入转学登记 DEMO
            </h1>
            <p className="text-base text-muted-foreground">
              用于演示现场新增登记入口。二维码每 30 秒刷新一次，避免长时间复用同一张码。
            </p>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-white p-5 shadow-sm">
            <div className="size-72 max-w-full md:size-80">
              <QRCode data={session.url} />
            </div>
          </div>

          <div className="grid w-full gap-3 md:grid-cols-2">
            <div className="rounded-2xl border bg-background px-4 py-3 text-left">
              <p className="text-sm text-muted-foreground">当前登记码</p>
              <p className="mt-1 font-medium text-base text-foreground">
                {session.token}
              </p>
            </div>
            <div className="rounded-2xl border bg-background px-4 py-3 text-left">
              <p className="text-sm text-muted-foreground">跳转地址</p>
              <p className="mt-1 break-all font-medium text-sm text-foreground">
                {session.url}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
            <RefreshCcwIcon className="size-4" />
            <span>距离下次刷新还有 {countdown} 秒</span>
            <span>·</span>
            <span>下次刷新时间 {formatRefreshTime(session.expiresAt)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
