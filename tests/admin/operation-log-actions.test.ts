import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentAdmin: vi.fn(),
  applicationFindMany: vi.fn(),
  operationLogFindMany: vi.fn(),
}));

vi.mock("@/lib/admin-session", () => ({
  getCurrentAdmin: mocks.getCurrentAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    application: {
      findMany: mocks.applicationFindMany,
    },
    operationLog: {
      findMany: mocks.operationLogFindMany,
    },
  },
}));

describe("listOperationLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentAdmin.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      name: "管理员",
    });
    mocks.applicationFindMany.mockResolvedValue([
      { id: "application-1" },
      { id: "application-2" },
    ]);
    mocks.operationLogFindMany.mockResolvedValue([]);
  });

  it("restricts logs to application ids under the selected semester", async () => {
    const { listOperationLogs } = await import("@/app/actions/operation-log");

    await listOperationLogs({ semesterId: "semester-2026-autumn" });

    expect(mocks.applicationFindMany).toHaveBeenCalledWith({
      where: { semesterId: "semester-2026-autumn" },
      select: { id: true },
    });
    expect(mocks.operationLogFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            {
              targetType: "APPLICATION",
              targetId: { in: ["application-1", "application-2"] },
            },
          ]),
        }),
      }),
    );
  });
});
