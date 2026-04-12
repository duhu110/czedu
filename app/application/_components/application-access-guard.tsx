"use client";

import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import {
  verifyApplicationAccess,
  type VerifyApplicationAccessResult,
} from "@/app/actions/application-access";
import type { ApplicationAccessPhonePreview } from "@/lib/application-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function toLockDate(value: VerifyApplicationAccessResult["lockedUntil"]) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

function formatLockedUntil(lockedUntil: Date | null) {
  if (!lockedUntil) {
    return null;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(lockedUntil);
}

function OtpDigitInput({
  index,
  value,
  disabled,
  onChange,
  onKeyDown,
  onPaste,
  inputRef,
}: {
  index: number;
  value: string;
  disabled: boolean;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  inputRef: (element: HTMLInputElement | null) => void;
}) {
  return (
    <Input
      ref={inputRef}
      aria-label={`手机号中间第 ${index + 1} 位`}
      className="h-11 w-10 rounded-2xl border border-border bg-background px-0 text-center text-base font-semibold sm:w-11 sm:text-lg"
      inputMode="numeric"
      maxLength={1}
      value={value}
      disabled={disabled}
      onChange={(event) => {
        onChange(index, event.target.value);
      }}
      onKeyDown={(event) => {
        onKeyDown(index, event);
      }}
      onPaste={onPaste}
    />
  );
}

export function ApplicationAccessGuard({
  applicationId,
  phonePreviews = [],
}: {
  applicationId: string;
  phonePreviews?: ApplicationAccessPhonePreview[];
}) {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  );
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isLocked = useMemo(
    () => Boolean(lockedUntil && lockedUntil.getTime() > Date.now()),
    [lockedUntil],
  );

  const lockedUntilLabel = useMemo(
    () => formatLockedUntil(lockedUntil),
    [lockedUntil],
  );
  const phoneMiddleFour = digits.join("");
  const selectedPreview = phonePreviews[activePreviewIndex] ?? phonePreviews[0] ?? null;

  function setDigitAt(index: number, nextValue: string) {
    const cleanedValue = nextValue.replace(/\D/g, "");

    if (!cleanedValue) {
      setDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    if (cleanedValue.length > 1) {
      const nextDigits = [...digits];
      cleanedValue
        .slice(0, 4 - index)
        .split("")
        .forEach((digit, offset) => {
          nextDigits[index + offset] = digit;
        });
      setDigits(nextDigits);
      const nextFocusIndex = Math.min(index + cleanedValue.length, 3);
      inputRefs.current[nextFocusIndex]?.focus();
      return;
    }

    setDigits((current) => {
      const next = [...current];
      next[index] = cleanedValue;
      return next;
    });

    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedValue = event.clipboardData.getData("text").replace(/\D/g, "");

    if (!pastedValue) {
      return;
    }

    event.preventDefault();
    const nextDigits = ["", "", "", ""];
    pastedValue
      .slice(0, 4)
      .split("")
      .forEach((digit, index) => {
        nextDigits[index] = digit;
      });
    setDigits(nextDigits);
    inputRefs.current[Math.min(pastedValue.length, 4) - 1]?.focus();
  }

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      const result = await verifyApplicationAccess(applicationId, phoneMiddleFour);

      if (result.success) {
        router.refresh();
        return;
      }

      setError(result.error);
      setRemainingAttempts(result.remainingAttempts);
      setLockedUntil(toLockDate(result.lockedUntil));
    });
  }

  function handlePreviewChange(nextValue: string) {
    if (!nextValue) {
      return;
    }

    setActivePreviewIndex(Number(nextValue));
    setDigits(["", "", "", ""]);
    setError(null);
    setRemainingAttempts(null);
    setLockedUntil(null);
    inputRefs.current[0]?.focus();
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card data-testid="application-access-shell">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <CardTitle className="mt-3 text-xl">申请信息验证</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
            <p>请输入监护人手机号中间四位后查看申请信息</p>
            <p>验证成功后，本设备对当前申请单 24 小时内免重复验证。</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-lg"
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>申请信息验证</DialogTitle>
            <DialogDescription>
              请输入监护人手机号中间四位后查看申请信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {phonePreviews.length > 1 ? (
              <div className="flex justify-center">
                <ToggleGroup
                  type="single"
                  value={String(activePreviewIndex)}
                  variant="outline"
                  size="sm"
                  onValueChange={handlePreviewChange}
                >
                  {phonePreviews.map((_, index) => (
                    <ToggleGroupItem key={index} value={String(index)}>
                      监护人 {index + 1}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>手机号中间四位</Label>
              <div className="flex items-center justify-center">
                <div className="flex flex-nowrap items-center justify-center gap-2 rounded-2xl bg-muted/40 px-3 py-3 sm:px-4">
                  {selectedPreview ? (
                    <span className="shrink-0 text-sm font-semibold tracking-[0.2em] text-foreground sm:text-base">
                      {selectedPreview.prefix}
                    </span>
                  ) : null}
                  <div className="flex items-center gap-1.5">
                    {digits.map((digit, index) => (
                      <OtpDigitInput
                        key={index}
                        index={index}
                        value={digit}
                        disabled={isPending || isLocked}
                        onChange={setDigitAt}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        inputRef={(element) => {
                          inputRefs.current[index] = element;
                        }}
                      />
                    ))}
                  </div>
                  {selectedPreview ? (
                    <span className="shrink-0 text-sm font-semibold tracking-[0.2em] text-foreground sm:text-base">
                      {selectedPreview.suffix}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                <p>{error}</p>
                {isLocked && lockedUntilLabel ? (
                  <p className="mt-1 flex items-center justify-center gap-1 text-xs">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    解锁时间：{lockedUntilLabel}
                  </p>
                ) : null}
                {!isLocked &&
                typeof remainingAttempts === "number" &&
                remainingAttempts >= 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    还可再尝试 {remainingAttempts} 次
                  </p>
                ) : null}
              </div>
            ) : null}

            <Button
              type="button"
              className="h-11 w-full"
              disabled={
                isPending ||
                isLocked ||
                digits.some((digit) => digit.length !== 1)
              }
              onClick={handleSubmit}
            >
              {isLocked
                ? "暂时不可验证"
                : isPending
                  ? "验证中..."
                  : "验证并查看"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
