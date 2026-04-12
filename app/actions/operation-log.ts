"use server";

import type { OperationLogAction } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/admin-session";

type OperationLogFilters = {
  adminId?: string;
  action?: OperationLogAction;
  targetId?: string;
};

export async function listOperationLogs(filters: OperationLogFilters = {}) {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return { success: false, error: "请先登录管理员账号", data: [] };
  }

  try {
    const records = await prisma.operationLog.findMany({
      where: {
        adminId: filters.adminId || undefined,
        action: filters.action || undefined,
        targetId: filters.targetId
          ? { contains: filters.targetId.trim() }
          : undefined,
      },
      include: {
        admin: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return { success: true, error: null, data: records };
  } catch (error) {
    console.error("List Operation Logs Error:", error);
    return { success: false, error: "获取操作记录失败", data: [] };
  }
}
