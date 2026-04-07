"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  applicationSchema,
  applicationSupplementSchema,
  applicationApprovalSchema,
  type ApplicationInput,
  type ApplicationSupplementInput,
} from "@/lib/validations/application";
// ✅ 1. 引入生成的数据库模型类型
import {
  Prisma,
  type Application,
  type ApplicationStatus,
} from "@prisma/client";

// 辅助函数：安全地将前端的数组转换为 JSON 字符串
const serializeFiles = (data: ApplicationInput) => ({
  ...data,
  fileHukou: JSON.stringify(data.fileHukou),
  fileProperty: JSON.stringify(data.fileProperty),
  fileStudentCard: JSON.stringify(data.fileStudentCard || []),
  fileResidencePermit: JSON.stringify(data.fileResidencePermit || []),
});

// 辅助函数：安全地将数据库的 JSON 字符串还原为数组
const deserializeFiles = <T extends Application>(record: T) => ({
  ...record,
  fileHukou: JSON.parse(record.fileHukou || "[]") as string[],
  fileProperty: JSON.parse(record.fileProperty || "[]") as string[],
  fileStudentCard: JSON.parse(record.fileStudentCard || "[]") as string[],
  fileResidencePermit: JSON.parse(
    record.fileResidencePermit || "[]",
  ) as string[],
});

// ==========================================
// 1. Create - 新增申请
// ==========================================
export async function createApplication(data: ApplicationInput) {
  try {
    const parsed = applicationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "数据验证失败，请检查填写内容" };
    }

    const finalData = serializeFiles(parsed.data);
    const initialStatus =
      parsed.data.fileStudentCard && parsed.data.fileStudentCard.length > 0
        ? "PENDING"
        : "SUPPLEMENT";

    await prisma.application.create({
      data: {
        ...finalData,
        status: initialStatus,
      },
    });

    revalidatePath("/admin/applications");
    return { success: true, error: null };
  } catch (e) {
    console.error("Create Application Error:", e);
    return { success: false, error: "系统内部错误，创建申请失败" };
  }
}

// ==========================================
// 1.1 Update - 补传学籍信息卡
// ==========================================
export async function submitApplicationSupplement(
  id: string,
  data: ApplicationSupplementInput,
) {
  try {
    const parsed = applicationSupplementSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "补件数据校验失败",
      };
    }

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!application) {
      return { success: false, error: "未找到该申请记录" };
    }

    if (application.status !== "SUPPLEMENT") {
      return { success: false, error: "当前申请状态不允许补充学籍信息卡" };
    }

    await prisma.application.update({
      where: { id },
      data: {
        fileStudentCard: JSON.stringify(parsed.data.fileStudentCard),
        status: "PENDING",
      },
    });

    revalidatePath(`/application/pending/${id}`);
    revalidatePath(`/application/supplement/${id}`);
    revalidatePath(`/application/confirmation/${id}`);
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${id}`);
    return { success: true, error: null };
  } catch (e) {
    console.error("Submit Application Supplement Error:", e);
    return { success: false, error: "补充资料提交失败" };
  }
}

// ==========================================
// 2. Read - 获取列表 (支持按学期筛选)
// ==========================================
export async function getApplications(params: {
  page?: number;
  pageSize?: number;
  search?: string; // 姓名或身份证号
  status?: ApplicationStatus;
  semesterId?: string;
}) {
  try {
    const { page = 1, pageSize = 10, search, status, semesterId } = params;

    // 构建动态查询条件
    const where: Prisma.ApplicationWhereInput = {
      AND: [
        semesterId ? { semesterId } : {},
        status ? { status } : {},
        search
          ? {
              OR: [
                { name: { contains: search } },
                { idCard: { contains: search } },
              ],
            }
          : {},
      ],
    };

    // 并发查询：总数 + 当前页数据
    const [total, records] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          semester: { select: { name: true } },
        },
      }),
    ]);

    return {
      success: true,
      data: records,
      meta: {
        total,
        pageCount: Math.ceil(total / pageSize),
        currentPage: page,
      },
      error: null,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      data: [],
      meta: { total: 0, pageCount: 0, currentPage: 1 },
      error: "获取数据失败",
    };
  }
}

// ==========================================
// 3. Read - 获取单条详情
// ==========================================
export async function getApplicationById(id: string) {
  try {
    const record = await prisma.application.findUnique({
      where: { id },
      include: { semester: true },
    });

    if (!record) {
      return { success: false, data: null, error: "未找到该申请记录" };
    }

    return { success: true, data: deserializeFiles(record), error: null };
  } catch (e) {
    console.error("Get Application Error:", e);
    return { success: false, data: null, error: "获取详情失败" };
  }
}

// ==========================================
// 4. Update - 更新全部信息 (编辑申请)
// ==========================================
export async function updateApplication(id: string, data: ApplicationInput) {
  try {
    const parsed = applicationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "数据验证失败" };
    }

    const finalData = serializeFiles(parsed.data);

    await prisma.application.update({
      where: { id },
      data: finalData,
    });

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${id}`);
    return { success: true, error: null };
  } catch (e) {
    console.error("Update Application Error:", e);
    return { success: false, error: "更新失败" };
  }
}

// ==========================================
// 5. Update - 仅更新状态 (管理员审核操作)
// ==========================================
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus, // ✅ 直接使用 Prisma 生成的枚举类型
  adminRemark?: string,
  targetSchool?: string,
) {
  try {
    const parsed = applicationApprovalSchema.safeParse({
      status,
      adminRemark,
      targetSchool,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "审核数据校验失败",
      };
    }

    await prisma.application.update({
      where: { id },
      data: {
        status: parsed.data.status,
        adminRemark: parsed.data.adminRemark,
        targetSchool:
          parsed.data.status === "APPROVED" ? parsed.data.targetSchool : null,
      },
    });

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${id}`);
    return { success: true, error: null };
  } catch (e) {
    console.error("Update Status Error:", e);
    return { success: false, error: "状态更新失败" };
  }
}

// ==========================================
// 6. Delete - 删除申请
// ==========================================
export async function deleteApplication(id: string) {
  try {
    await prisma.application.delete({
      where: { id },
    });

    revalidatePath("/admin/applications");
    return { success: true, error: null };
  } catch (e) {
    console.error("Delete Application Error:", e);
    return { success: false, error: "删除失败" };
  }
}
