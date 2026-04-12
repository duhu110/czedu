"use server";

import { type OperationLogAction, Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/admin-session";

type OperationLogFilters = {
  adminId?: string;
  action?: OperationLogAction;
  targetId?: string;
  semesterId?: string;
};

export async function listOperationLogs(filters: OperationLogFilters = {}) {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return { success: false, error: "请先登录管理员账号", data: [] };
  }

  try {
    const trimmedTargetId = filters.targetId?.trim();
    const andFilters: Prisma.OperationLogWhereInput[] = [];
    const where: Prisma.OperationLogWhereInput = {
      adminId: filters.adminId || undefined,
      action: filters.action || undefined,
    };

    if (trimmedTargetId) {
      andFilters.push({
        targetId: { contains: trimmedTargetId },
      });
    }

    if (filters.semesterId) {
      const applications = await prisma.application.findMany({
        where: { semesterId: filters.semesterId },
        select: { id: true },
      });
      const applicationIds = applications.map((application) => application.id);

      if (applicationIds.length === 0) {
        return { success: true, error: null, data: [] };
      }

      andFilters.push({
        targetType: "APPLICATION",
        targetId: { in: applicationIds },
      });
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    const records = await prisma.operationLog.findMany({
      where,
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
