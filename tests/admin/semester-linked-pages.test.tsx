import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getApplications: vi.fn(),
  getAdminSelectedSemester: vi.fn(),
  requireCurrentAdmin: vi.fn(),
  listOperationLogs: vi.fn(),
  adminFindMany: vi.fn(),
  applicationFindMany: vi.fn(),
}));

vi.mock("@/app/actions/application", () => ({
  getApplications: mocks.getApplications,
}));

vi.mock("@/app/actions/operation-log", () => ({
  listOperationLogs: mocks.listOperationLogs,
}));

vi.mock("@/lib/admin-selected-semester", () => ({
  getAdminSelectedSemester: mocks.getAdminSelectedSemester,
}));

vi.mock("@/lib/admin-session", () => ({
  requireCurrentAdmin: mocks.requireCurrentAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    admin: {
      findMany: mocks.adminFindMany,
    },
    application: {
      findMany: mocks.applicationFindMany,
    },
  },
}));

describe("admin pages semester selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSelectedSemester.mockResolvedValue({
      id: "semester-2026-autumn",
      name: "2026年秋季",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-09-01T00:00:00.000Z"),
      isActive: true,
    });
    mocks.getApplications.mockResolvedValue({
      success: true,
      data: [],
      meta: { total: 0, pageCount: 0, currentPage: 1 },
      error: null,
    });
    mocks.requireCurrentAdmin.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      name: "管理员",
    });
    mocks.listOperationLogs.mockResolvedValue({
      success: true,
      data: [],
      error: null,
    });
    mocks.adminFindMany.mockResolvedValue([]);
    mocks.applicationFindMany.mockResolvedValue([]);
  });

  it("filters dashboard data by the selected semester", async () => {
    const { default: AdminDashboardPage } = await import("@/app/admin/(auth)/page");

    await AdminDashboardPage();

    expect(mocks.applicationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { semesterId: "semester-2026-autumn" },
      }),
    );
  });

  it("passes the selected semester into the applications query", async () => {
    const { default: AdminApplicationsPage } = await import(
      "@/app/admin/(auth)/applications/page"
    );

    await AdminApplicationsPage({
      searchParams: Promise.resolve({ page: "1", search: "张三" }),
    });

    expect(mocks.getApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        semesterId: "semester-2026-autumn",
        search: "张三",
      }),
    );
  });

  it("passes the selected semester into the operation log query", async () => {
    const { default: OperationLogsPage } = await import(
      "@/app/admin/(auth)/operation-logs/page"
    );

    await OperationLogsPage({
      searchParams: Promise.resolve({}),
    });

    expect(mocks.listOperationLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        semesterId: "semester-2026-autumn",
      }),
    );
  });
});
