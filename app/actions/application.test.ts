import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateMock, revalidatePathMock } = vi.hoisted(() => ({
  updateMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    application: {
      update: updateMock,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { updateApplicationStatus } from "@/app/actions/application";

describe("updateApplicationStatus", () => {
  beforeEach(() => {
    updateMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("rejects approved applications without a target school", async () => {
    const result = await updateApplicationStatus("app-1", "APPROVED", "通过", "");

    expect(result).toEqual({
      success: false,
      error: "通过申请时必须指定目标学校",
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("persists targetSchool when approving an application", async () => {
    updateMock.mockResolvedValue({ id: "app-1" });

    const result = await updateApplicationStatus(
      "app-1",
      "APPROVED",
      "统筹安排",
      "城中区第一小学",
    );

    expect(result).toEqual({ success: true, error: null });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "app-1" },
      data: {
        status: "APPROVED",
        adminRemark: "统筹安排",
        targetSchool: "城中区第一小学",
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/applications");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/applications/app-1");
  });
});
