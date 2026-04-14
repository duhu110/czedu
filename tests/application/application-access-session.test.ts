import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieState = new Map<string, string>();

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieState.get(name);
      return value ? { name, value } : undefined;
    },
    set: (name: string, value: string) => {
      cookieState.set(name, value);
    },
    delete: (name: string) => {
      cookieState.delete(name);
    },
  })),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

describe("application access session helpers", () => {
  beforeEach(() => {
    cookieState.clear();
    process.env.JWT_SECRET = "test-secret-application-access";
    vi.resetModules();
  });

  it("creates a cookie that can be read for the same application id", async () => {
    const {
      getApplicationAccessCookieName,
      setApplicationAccessCookie,
      readApplicationAccessCookie,
    } = await import("@/lib/application-access");

    await setApplicationAccessCookie("app-1");

    expect(cookieState.has(getApplicationAccessCookieName("app-1"))).toBe(true);
    await expect(readApplicationAccessCookie("app-1")).resolves.toBe(true);
  });

  it("rejects cookies when reused for a different application id", async () => {
    const {
      getApplicationAccessCookieName,
      createApplicationAccessToken,
      readApplicationAccessCookie,
    } = await import("@/lib/application-access");

    cookieState.set(
      getApplicationAccessCookieName("app-2"),
      await createApplicationAccessToken("app-1"),
    );

    await expect(readApplicationAccessCookie("app-2")).resolves.toBe(false);
  });
});

describe("application access phone helpers", () => {
  it("previews a guardian phone without exposing the last four digits", async () => {
    const { getPhonePreview } = await import("@/lib/application-access");

    expect(getPhonePreview("13800001234")).toEqual({
      prefix: "1380000",
      suffix: "",
    });
  });
});
