import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  semesterFindMany: vi.fn(),
  semesterCreate: vi.fn(),
  semesterUpdate: vi.fn(),
  semesterDelete: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    semester: {
      findMany: mocks.semesterFindMany,
      create: mocks.semesterCreate,
      update: mocks.semesterUpdate,
      delete: mocks.semesterDelete,
    },
  },
}));

import * as semesterActions from "@/app/actions/semester";

describe("semester actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a semester from form values", async () => {
    const values = {
      year: 2026,
      term: "秋季" as const,
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-09-01T00:00:00.000Z"),
      isActive: true,
    };

    mocks.semesterCreate.mockResolvedValueOnce({
      id: "semester-2026-autumn",
    });

    await expect(semesterActions.createSemester(values)).resolves.toEqual({
      success: true,
    });

    expect(mocks.semesterCreate).toHaveBeenCalledWith({
      data: {
        name: "2026年秋季",
        startDate: values.startDate,
        endDate: values.endDate,
        isActive: true,
      },
    });
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/admin/semesters");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/admin");
  });

  it("rejects dates outside the allowed seasonal window with a friendly error", async () => {
    const values = {
      year: 2026,
      term: "春季" as const,
      startDate: new Date("2025-08-31T00:00:00.000Z"),
      endDate: new Date("2026-03-01T00:00:00.000Z"),
      isActive: true,
    };

    await expect(semesterActions.createSemester(values)).resolves.toEqual({
      error: "学期日期超出允许范围",
    });

    expect(mocks.semesterCreate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("falls back to the create-specific generic error when a relation delete error occurs", async () => {
    const values = {
      year: 2026,
      term: "秋季" as const,
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-09-01T00:00:00.000Z"),
      isActive: true,
    };

    mocks.semesterCreate.mockRejectedValueOnce({
      code: "P2003",
    });

    await expect(semesterActions.createSemester(values)).resolves.toEqual({
      error: "创建失败，请稍后再试",
    });

    expect(mocks.semesterCreate).toHaveBeenCalledWith({
      data: {
        name: "2026年秋季",
        startDate: values.startDate,
        endDate: values.endDate,
        isActive: true,
      },
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("updates a semester with the computed name and full form payload", async () => {
    const values = {
      year: 2027,
      term: "春季" as const,
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2027-03-01T00:00:00.000Z"),
      isActive: false,
    };

    mocks.semesterUpdate.mockResolvedValueOnce({
      id: "semester-2027-spring",
    });

    await expect(
      semesterActions.updateSemester("semester-2027-spring", values),
    ).resolves.toEqual({
      success: true,
    });

    expect(mocks.semesterUpdate).toHaveBeenCalledWith({
      where: { id: "semester-2027-spring" },
      data: {
        name: "2027年春季",
        startDate: values.startDate,
        endDate: values.endDate,
        isActive: false,
      },
    });
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/admin/semesters");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/admin");
  });

  it("updates only the active flag when toggling semester status", async () => {
    mocks.semesterUpdate.mockResolvedValueOnce({
      id: "semester-2027-spring",
    });

    await expect(
      semesterActions.toggleSemesterActive("semester-2027-spring", true),
    ).resolves.toEqual({
      success: true,
    });

    expect(mocks.semesterUpdate).toHaveBeenCalledWith({
      where: { id: "semester-2027-spring" },
      data: { isActive: true },
    });
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/admin/semesters");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/admin");
  });

  it("returns a friendly error when deletion fails because related data exists", async () => {
    mocks.semesterDelete.mockRejectedValueOnce({
      code: "P2003",
    });

    await expect(semesterActions.deleteSemester("semester-2026-autumn")).resolves.toEqual(
      {
        error: "该学期存在关联数据，无法删除",
      },
    );

    expect(mocks.semesterDelete).toHaveBeenCalledWith({
      where: { id: "semester-2026-autumn" },
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
