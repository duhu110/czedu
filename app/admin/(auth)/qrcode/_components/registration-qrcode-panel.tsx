"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCcwIcon, QrCodeIcon, ExternalLinkIcon } from "lucide-react";

import { signQrTokenAction } from "../_actions/sign-token";
import { QRCode } from "./qr-code";
import {
  QR_REFRESH_INTERVAL_SECONDS,
  buildRegistrationQrSession,
  getSecondsUntilNextRefresh,
} from "./qrcode-session";
import { formatBeijingTime, getBeijingNow } from "@/lib/china-time";

function formatRefreshTime(date: Date) {
  return formatBeijingTime(date);
}

export function RegistrationQrcodePanel() {
  const [now, setNow] = useState(() => getBeijingNow());
  const [signedUrl, setSignedUrl] = useState("");
  const lastSignedTokenRef = useRef("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(getBeijingNow());
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
  const nextRefreshAt = new Date(
    session.issuedAt.getTime() + QR_REFRESH_INTERVAL_SECONDS * 1000,
  );

  useEffect(() => {
    if (lastSignedTokenRef.current === session.token) return;
    lastSignedTokenRef.current = session.token;

    signQrTokenAction(
      session.token,
      session.expiresAt.toISOString(),
    ).then((sig) => {
      const url = new URL(session.url);
      url.searchParams.set("sig", sig);
      setSignedUrl(url.toString());
    });
  }, [session.token, session.expiresAt, session.url]);

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
              用于演示现场新增登记入口。二维码每 30 秒刷新一次，扫码后 3
              分钟内有效。
            </p>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-white p-5 shadow-sm">
            <div className="size-72 max-w-full md:size-80">
              {signedUrl ? (
                <QRCode data={signedUrl} />
              ) : (
                <div className="flex size-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
                  正在生成二维码...
                </div>
              )}
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
              <p className="text-sm text-muted-foreground">跳转链接</p>
              {signedUrl ? (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  打开申请页面
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">生成中...</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
            <RefreshCcwIcon className="size-4" />
            <span>距离下次刷新还有 {countdown} 秒</span>
            <span>·</span>
            <span>下次刷新时间 {formatRefreshTime(nextRefreshAt)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
