import { describe, expect, it } from "vitest";

import {
  buildRegistrationQrSession,
  getSecondsUntilNextRefresh,
} from "@/lib/admin/qrcode-demo";

describe("qrcode demo session", () => {
  it("keeps the same qr session within the same 30 second window", () => {
    const first = buildRegistrationQrSession(
      new Date("2026-04-06T12:00:05.000Z"),
      "https://demo.czedu.local",
    );
    const second = buildRegistrationQrSession(
      new Date("2026-04-06T12:00:29.000Z"),
      "https://demo.czedu.local",
    );

    expect(first.token).toBe(second.token);
    expect(first.url).toBe(second.url);
  });

  it("rotates the qr session when the next 30 second window starts", () => {
    const first = buildRegistrationQrSession(
      new Date("2026-04-06T12:00:29.000Z"),
      "https://demo.czedu.local",
    );
    const second = buildRegistrationQrSession(
      new Date("2026-04-06T12:00:30.000Z"),
      "https://demo.czedu.local",
    );

    expect(first.token).not.toBe(second.token);
    expect(getSecondsUntilNextRefresh(new Date("2026-04-06T12:00:29.000Z"))).toBe(1);
    expect(getSecondsUntilNextRefresh(new Date("2026-04-06T12:00:30.000Z"))).toBe(30);
  });
});
