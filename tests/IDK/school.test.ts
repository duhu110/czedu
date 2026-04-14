import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock, deleteMock, findManyMock, findUniqueMock, revalidatePathMock, updateMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  deleteMock: vi.fn(),
  findManyMock: vi.fn(),
  findUniqueMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    school: {
      create: createMock,
      delete: deleteMock,
      findMany: findManyMock,
      findUnique: findUniqueMock,
      update: updateMock,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import {
  createSchool,
  deleteSchool,
  getSchoolByName,
  getSchools,
  updateSchool,
} from "@/app/actions/school";

describe("school actions", () => {
  beforeEach(() => {
    createMock.mockReset();
    deleteMock.mockReset();
    findManyMock.mockReset();
    findUniqueMock.mockReset();
    revalidatePathMock.mockReset();
    updateMock.mockReset();
  });

  it("returns school rows with parsed district ranges", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "school-1",
        name: "西关街小学",
        districtRange: '["南关街（单号：21-最大号；双号：18-最大号）"]',
        address: "",
        notice: "",
      },
    ]);

    const result = await getSchools();

    expect(result).toEqual({
      success: true,
      error: null,
      data: [
        {
          id: "school-1",
          name: "西关街小学",
          districtRange: ["南关街（单号：21-最大号；双号：18-最大号）"],
          address: "",
          notice: "",
        },
      ],
    });
  });

  it("loads a school by name with parsed district ranges", async () => {
    findUniqueMock.mockResolvedValue({
      id: "school-1",
      name: "西关街小学",
      districtRange: '["南关街（单号：21-最大号；双号：18-最大号）"]',
      address: "城中区南关街88号",
      notice: "请按通知时间到校报到",
    });

    const result = await getSchoolByName("西关街小学");

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { name: "西关街小学" },
    });
    expect(result).toEqual({
      success: true,
      error: null,
      data: {
        id: "school-1",
        name: "西关街小学",
        districtRange: ["南关街（单号：21-最大号；双号：18-最大号）"],
        address: "城中区南关街88号",
        notice: "请按通知时间到校报到",
      },
    });
  });

  it("creates a school and serializes district ranges from text lines", async () => {
    createMock.mockResolvedValue({ id: "school-2" });

    const result = await createSchool({
      name: "新建学校",
      districtRangeText: "规则一\n规则二",
      address: "城中区测试路1号",
      notice: "请按时到校",
    });

    expect(result).toEqual({ success: true, error: null });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: "新建学校",
        districtRange: JSON.stringify(["规则一", "规则二"]),
        address: "城中区测试路1号",
        notice: "请按时到校",
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/schools");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/applications");
  });

  it("updates a school and serializes district ranges from text lines", async () => {
    updateMock.mockResolvedValue({ id: "school-2" });

    const result = await updateSchool("school-2", {
      name: "更新学校",
      districtRangeText: "规则一\n\n规则二",
      address: "城中区测试路2号",
      notice: "更新须知",
    });

    expect(result).toEqual({ success: true, error: null });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "school-2" },
      data: {
        name: "更新学校",
        districtRange: JSON.stringify(["规则一", "规则二"]),
        address: "城中区测试路2号",
        notice: "更新须知",
      },
    });
  });

  it("deletes a school", async () => {
    deleteMock.mockResolvedValue({ id: "school-1" });

    const result = await deleteSchool("school-1");

    expect(result).toEqual({ success: true, error: null });
    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: "school-1" },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/schools");
  });
});
