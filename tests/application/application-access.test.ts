import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  applicationFindUnique: vi.fn(),
  applicationAccessAttemptFindUnique: vi.fn(),
  applicationAccessAttemptUpsert: vi.fn(),
  setApplicationAccessCookie: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    application: {
      findUnique: mocks.applicationFindUnique,
    },
    applicationAccessAttempt: {
      findUnique: mocks.applicationAccessAttemptFindUnique,
      upsert: mocks.applicationAccessAttemptUpsert,
    },
  },
}));

vi.mock("@/lib/application-access", async () => {
  const actual = await vi.importActual<typeof import("@/lib/application-access")>(
    "@/lib/application-access",
  );

  return {
    ...actual,
    setApplicationAccessCookie: mocks.setApplicationAccessCookie,
  };
});

describe("application access action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts guardian1 last four digits and writes an access cookie", async () => {
    mocks.applicationAccessAttemptFindUnique.mockResolvedValueOnce(null);
    mocks.applicationFindUnique.mockResolvedValueOnce({
      guardian1Phone: "13800001234",
      guardian2Phone: "13900001234",
    });

    const { verifyApplicationAccess } = await import(
      "@/app/actions/application-access"
    );

    await expect(
      verifyApplicationAccess("app-1", "1234"),
    ).resolves.toMatchObject({
      success: true,
      error: null,
    });

    expect(mocks.applicationAccessAttemptUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { applicationId: "app-1" },
        update: expect.objectContaining({
          failedCount: 0,
          lockedUntil: null,
          lastFailedAt: null,
        }),
      }),
    );
    expect(mocks.setApplicationAccessCookie).toHaveBeenCalledWith("app-1");
  });

  it("accepts guardian2 last four digits", async () => {
    mocks.applicationAccessAttemptFindUnique.mockResolvedValueOnce(null);
    mocks.applicationFindUnique.mockResolvedValueOnce({
      guardian1Phone: "13800001234",
      guardian2Phone: "13900005678",
    });

    const { verifyApplicationAccess } = await import(
      "@/app/actions/application-access"
    );

    await expect(
      verifyApplicationAccess("app-2", "5678"),
    ).resolves.toMatchObject({
      success: true,
      error: null,
    });
  });

  it("increments failed attempts and returns remaining tries on mismatch", async () => {
    mocks.applicationAccessAttemptFindUnique.mockResolvedValueOnce({
      applicationId: "app-3",
      failedCount: 1,
      lockedUntil: null,
    });
    mocks.applicationFindUnique.mockResolvedValueOnce({
      guardian1Phone: "13800001234",
      guardian2Phone: null,
    });

    const { verifyApplicationAccess } = await import(
      "@/app/actions/application-access"
    );

    await expect(
      verifyApplicationAccess("app-3", "9999"),
    ).resolves.toMatchObject({
      success: false,
      error: "手机号不正确或无权访问",
      remainingAttempts: 1,
      lockedUntil: null,
    });

    expect(mocks.applicationAccessAttemptUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { applicationId: "app-3" },
        update: expect.objectContaining({
          failedCount: 2,
        }),
      }),
    );
    expect(mocks.setApplicationAccessCookie).not.toHaveBeenCalled();
  });

  it("locks the application for one hour after the third failed attempt", async () => {
    mocks.applicationAccessAttemptFindUnique.mockResolvedValueOnce({
      applicationId: "app-4",
      failedCount: 2,
      lockedUntil: null,
    });
    mocks.applicationFindUnique.mockResolvedValueOnce({
      guardian1Phone: "13800001234",
      guardian2Phone: null,
    });

    const { verifyApplicationAccess } = await import(
      "@/app/actions/application-access"
    );

    const result = await verifyApplicationAccess("app-4", "9999");


    expect(result.success).toBe(false);
    expect(result.remainingAttempts).toBe(0);
    expect(result.lockedUntil).toBeTruthy();
    expect(mocks.applicationAccessAttemptUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          failedCount: 3,
          lockedUntil: expect.any(Date),
        }),
      }),
    );
  });

  it("returns the same generic failure for unknown application ids", async () => {
    mocks.applicationAccessAttemptFindUnique.mockResolvedValueOnce(null);
    mocks.applicationFindUnique.mockResolvedValueOnce(null);

    const { verifyApplicationAccess } = await import(
      "@/app/actions/application-access"
    );

    await expect(verifyApplicationAccess("missing-app", "0000")).resolves.toMatchObject({
      success: false,
      error: "手机号不正确或无权访问",
      remainingAttempts: 2,
    });

    expect(mocks.applicationAccessAttemptUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { applicationId: "missing-app" },
      }),
    );
  });

  it("returns the lock response without checking phones while the application is locked", async () => {
    const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    mocks.applicationAccessAttemptFindUnique.mockResolvedValueOnce({
      applicationId: "app-locked",
      failedCount: 3,
      lockedUntil,
    });

    const { verifyApplicationAccess } = await import(
      "@/app/actions/application-access"
    );

    await expect(
      verifyApplicationAccess("app-locked", "0000"),
    ).resolves.toMatchObject({
      success: false,
      error: "当前申请暂时无法验证，请 1 小时后再试",
      remainingAttempts: 0,
      lockedUntil,
    });

    expect(mocks.applicationFindUnique).not.toHaveBeenCalled();
    expect(mocks.applicationAccessAttemptUpsert).not.toHaveBeenCalled();
  });

  it("rejects inputs that are not exactly four digits", async () => {
    mocks.applicationAccessAttemptFindUnique.mockResolvedValueOnce(null);
    mocks.applicationFindUnique.mockResolvedValueOnce({
      guardian1Phone: "13800001234",
      guardian2Phone: null,
    });

    const { verifyApplicationAccess } = await import(
      "@/app/actions/application-access"
    );

    await expect(
      verifyApplicationAccess("app-5", "123"),
    ).resolves.toMatchObject({
      success: false,
      error: "手机号不正确或无权访问",
      remainingAttempts: 2,
    });
  });
});
