import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  adminCreateMock,
  adminFindManyMock,
  adminFindUniqueMock,
  adminCountMock,
  adminUpdateMock,
  hashMock,
  revalidatePathMock,
  getCurrentAdminMock,
} = vi.hoisted(() => ({
  adminCreateMock: vi.fn(),
  adminFindManyMock: vi.fn(),
  adminFindUniqueMock: vi.fn(),
  adminCountMock: vi.fn(),
  adminUpdateMock: vi.fn(),
  hashMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  getCurrentAdminMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    admin: {
      create: adminCreateMock,
      findMany: adminFindManyMock,
      findUnique: adminFindUniqueMock,
      count: adminCountMock,
      update: adminUpdateMock,
    },
  },
}));

vi.mock("@/lib/admin-session", () => ({
  getCurrentAdmin: getCurrentAdminMock,
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: hashMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { createAdminUser, updateAdminUser } from "@/app/actions/admin";

describe("admin actions", () => {
  beforeEach(() => {
    adminCreateMock.mockReset();
    adminFindManyMock.mockReset();
    adminFindUniqueMock.mockReset();
    adminCountMock.mockReset();
    adminUpdateMock.mockReset();
    hashMock.mockReset();
    revalidatePathMock.mockReset();
    getCurrentAdminMock.mockReset();

    hashMock.mockResolvedValue("hashed-password");
  });

  it("allows only super admins to create admin users", async () => {
    getCurrentAdminMock.mockResolvedValue({
      id: "admin-2",
      username: "editor",
      name: "普通管理员",
      isSuperAdmin: false,
      isActive: true,
    });

    const result = await createAdminUser({
      username: "ops",
      password: "123456",
      name: "运维管理员",
      isActive: true,
      isSuperAdmin: false,
    });

    expect(result).toEqual({
      success: false,
      error: "仅超级管理员可执行此操作",
    });
    expect(adminCreateMock).not.toHaveBeenCalled();
  });

  it("creates admin users with super-admin flag", async () => {
    getCurrentAdminMock.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      name: "超级管理员",
      isSuperAdmin: true,
      isActive: true,
    });
    adminCreateMock.mockResolvedValue({ id: "admin-3" });

    const result = await createAdminUser({
      username: "manager",
      password: "123456",
      name: "审核管理员",
      isActive: true,
      isSuperAdmin: true,
    });

    expect(result).toEqual({ success: true, error: null });
    expect(hashMock).toHaveBeenCalledWith("123456", 10);
    expect(adminCreateMock).toHaveBeenCalledWith({
      data: {
        username: "manager",
        password: "hashed-password",
        name: "审核管理员",
        isActive: true,
        isSuperAdmin: true,
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
  });

  it("prevents removing the last super admin role", async () => {
    getCurrentAdminMock.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      name: "超级管理员",
      isSuperAdmin: true,
      isActive: true,
    });
    adminFindUniqueMock.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      isSuperAdmin: true,
      isActive: true,
    });
    adminCountMock.mockResolvedValue(1);

    const result = await updateAdminUser("admin-1", {
      name: "超级管理员",
      isActive: true,
      isSuperAdmin: false,
      password: "",
    });

    expect(result).toEqual({
      success: false,
      error: "系统至少需要保留一个超级管理员",
    });
    expect(adminUpdateMock).not.toHaveBeenCalled();
  });
});
