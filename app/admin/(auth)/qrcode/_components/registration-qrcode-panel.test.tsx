import { describe, expect, it } from "vitest";

import {
  buildRegistrationQrSession,
  getSecondsUntilNextRefresh,
} from "./qrcode-session";

describe("qrcode-session", () => {
  it("builds the rotating session payload for the admin qrcode page", () => {
    const session = buildRegistrationQrSession(
      new Date("2026-04-07T17:40:05+08:00"),
      "https://czedu.local",
    );

    expect(session.token).toBe("REG-20260407094000");
    expect(session.url).toContain("https://czedu.local/application/new");
    expect(session.url).toContain("from=admin-qrcode-demo");
    expect(session.url).toContain("token=REG-20260407094000");
  });

  it("counts down to the next 30-second refresh boundary", () => {
    expect(
      getSecondsUntilNextRefresh(new Date("2026-04-07T17:40:05+08:00")),
    ).toBe(25);
  });
});
