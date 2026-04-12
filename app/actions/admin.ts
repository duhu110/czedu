"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/admin-session";
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from "@/lib/validations/admin";

function revalidateAdminPaths() {
  revalidatePath("/admin/users");
}

async function requireSuperAdminForAction() {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return { ok: false as const, error: "请先登录管理员账号" };
  }

  if (!currentAdmin.isSuperAdmin) {
    return { ok: false as const, error: "仅超级管理员可执行此操作" };
  }

  return { ok: true as const, admin: currentAdmin };
}

export async function listAdminUsers() {
  const currentAdmin = await requireSuperAdminForAction();
  if (!currentAdmin.ok) {
    return { success: false, error: currentAdmin.error, data: [] };
  }

  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        name: true,
        isActive: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, error: null, data: admins };
  } catch (error) {
    console.error("List Admin Users Error:", error);
    return { success: false, error: "获取管理员列表失败", data: [] };
  }
}

export async function createAdminUser(values: CreateAdminUserInput) {
  const currentAdmin = await requireSuperAdminForAction();
  if (!currentAdmin.ok) {
    return { success: false, error: currentAdmin.error };
  }

  const parsed = createAdminUserSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "管理员数据校验失败",
    };
  }

  try {
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    await prisma.admin.create({
      data: {
        username: parsed.data.username,
        password: hashedPassword,
        name: parsed.data.name ?? null,
        isActive: parsed.data.isActive,
        isSuperAdmin: parsed.data.isSuperAdmin,
      },
    });

    revalidateAdminPaths();
    return { success: true, error: null };
  } catch (error) {
    console.error("Create Admin User Error:", error);
    return { success: false, error: "创建管理员失败" };
  }
}

export async function updateAdminUser(
  id: string,
  values: UpdateAdminUserInput,
) {
  const currentAdmin = await requireSuperAdminForAction();
  if (!currentAdmin.ok) {
    return { success: false, error: currentAdmin.error };
  }

  const parsed = updateAdminUserSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "管理员数据校验失败",
    };
  }

  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        isSuperAdmin: true,
      },
    });

    if (!existingAdmin) {
      return { success: false, error: "管理员不存在" };
    }

    if (currentAdmin.admin.id === id && !parsed.data.isActive) {
      return { success: false, error: "不能停用当前登录账号" };
    }

    if (existingAdmin.isSuperAdmin && !parsed.data.isSuperAdmin) {
      const activeSuperAdminCount = await prisma.admin.count({
        where: {
          isSuperAdmin: true,
          isActive: true,
        },
      });

      if (activeSuperAdminCount <= 1) {
        return { success: false, error: "系统至少需要保留一个超级管理员" };
      }
    }

    const data: {
      name: string | null;
      isActive: boolean;
      isSuperAdmin: boolean;
      password?: string;
    } = {
      name: parsed.data.name ?? null,
      isActive: parsed.data.isActive,
      isSuperAdmin: parsed.data.isSuperAdmin,
    };

    if (parsed.data.password?.trim()) {
      data.password = await bcrypt.hash(parsed.data.password, 10);
    }

    await prisma.admin.update({
      where: { id },
      data,
    });

    revalidateAdminPaths();
    return { success: true, error: null };
  } catch (error) {
    console.error("Update Admin User Error:", error);
    return { success: false, error: "更新管理员失败" };
  }
}
