"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  applicationSchema,
  applicationSupplementSchema,
  applicationApprovalSchema,
  type ApplicationInput,
  type ApplicationSupplementInput,
  type FileHukouInput,
  type FilePropertyInput,
} from "@/lib/validations/application";
import { signEditToken } from "@/lib/qrcode-token";
import { getCurrentAdmin } from "@/lib/admin-session";
// ✅ 1. 引入生成的数据库模型类型
import {
  Prisma,
  type Application,
  type ApplicationStatus,
} from "@prisma/client";

// ========== 文件序列化/反序列化 ==========

// 辅助函数：安全地将前端的结构化数据转换为 JSON 字符串
const serializeFiles = (data: ApplicationInput) => ({
  ...data,
  fileHukou: JSON.stringify(data.fileHukou),
  fileProperty: JSON.stringify(data.fileProperty || {}),
  fileStudentCard: JSON.stringify(data.fileStudentCard || []),
  fileResidencePermit: JSON.stringify(data.fileResidencePermit || []),
});

// 默认的空户口本结构
const emptyHukou: FileHukouInput = {
  frontPage: "",
  householderPage: "",
  guardianPage: "",
  studentPage: "",
  others: [],
};

// 默认的空住房证明结构
const emptyProperty: FilePropertyInput = {
  propertyDeed: "",
  purchaseContract: "",
  rentalCert: "",
  others: [],
};

// 辅助函数：安全地将数据库的 JSON 字符串还原为结构化对象
const deserializeFiles = <T extends Application>(record: T) => {
  // 解析户口本：兼容旧版扁平数组格式
  let fileHukou: FileHukouInput;
  try {
    const parsed = JSON.parse(record.fileHukou || "{}");
    if (Array.isArray(parsed)) {
      // 旧格式：扁平数组 → 转换为结构化对象
      fileHukou = {
        frontPage: parsed[0] || "",
        householderPage: parsed[1] || "",
        guardianPage: parsed[2] || "",
        studentPage: parsed[3] || "",
        others: parsed.slice(4),
      };
    } else {
      fileHukou = { ...emptyHukou, ...parsed };
    }
  } catch {
    fileHukou = { ...emptyHukou };
  }
  // 解析住房证明：兼容旧版扁平数组格式
  let fileProperty: FilePropertyInput;
  try {
    const parsed = JSON.parse(record.fileProperty || "{}");
    if (Array.isArray(parsed)) {
      // 旧格式：扁平数组 → 转换为结构化对象
      fileProperty = {
        propertyDeed: parsed[0] || "",
        purchaseContract: parsed[1] || "",
        rentalCert: "",
        others: parsed.slice(2),
      };
    } else {
      fileProperty = { ...emptyProperty, ...parsed };
    }
  } catch {
    fileProperty = { ...emptyProperty };
  }
  return {
    ...record,
    fileHukou,
    fileProperty,
    fileStudentCard: JSON.parse(record.fileStudentCard || "[]") as string[],
    fileResidencePermit: JSON.parse(
      record.fileResidencePermit || "[]",
    ) as string[],
    rejectedFields: JSON.parse(record.rejectedFields || "[]") as string[],
  };
};

// 反序列化后的应用类型
export type DeserializedApplication = ReturnType<
  typeof deserializeFiles<Application>
>;

const ALLOWED_ADMIN_STATUS_TRANSITIONS: Partial<
  Record<ApplicationStatus, readonly ApplicationStatus[]>
> = {
  PENDING: ["APPROVED", "REJECTED"],
  SUPPLEMENT: ["REJECTED"],
  EDITING: ["REJECTED"],
};

function canAdminTransition(
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
) {
  return (
    ALLOWED_ADMIN_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) ??
    false
  );
}

function buildStatusChangeLog(params: {
  admin: NonNullable<Awaited<ReturnType<typeof getCurrentAdmin>>>;
  application: { id: string; name?: string | null };
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  adminRemark?: string | null;
  targetSchool?: string | null;
  rejectedFields?: string[];
}) {
  return {
    admin: {
      connect: { id: params.admin.id },
    },
    action: "APPLICATION_STATUS_CHANGED" as const,
    targetType: "APPLICATION" as const,
    targetId: params.application.id,
    targetLabel: params.application.name ?? null,
    adminUsername: params.admin.username,
    adminName: params.admin.name,
    details: JSON.stringify({
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      adminRemark: params.adminRemark ?? null,
      targetSchool: params.targetSchool ?? null,
      rejectedFields: params.rejectedFields,
    }),
  } satisfies Prisma.OperationLogCreateInput;
}

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
    return { success: false, error: "学籍信息卡提交失败" };
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
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return { success: false, error: "请先登录管理员账号" };
    }

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

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, status: true, name: true },
    });

    if (!application) {
      return { success: false, error: "未找到该申请记录" };
    }

    if (!canAdminTransition(application.status, parsed.data.status)) {
      return { success: false, error: "当前申请状态不允许执行该审核操作" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id },
        data: {
          status: parsed.data.status,
          adminRemark: parsed.data.adminRemark,
          targetSchool:
            parsed.data.status === "APPROVED" ? parsed.data.targetSchool : null,
        },
      });

      await tx.operationLog.create({
        data: buildStatusChangeLog({
          admin: currentAdmin,
          application,
          fromStatus: application.status,
          toStatus: parsed.data.status,
          adminRemark: parsed.data.adminRemark,
          targetSchool:
            parsed.data.status === "APPROVED" ? parsed.data.targetSchool : null,
        }),
      });
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

// ==========================================
// 7. 驳回修改 - 标记问题字段并设置 EDITING 状态
// ==========================================
export async function rejectForEditing(
  id: string,
  rejectedFields: string[],
  adminRemark: string,
) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return { success: false, error: "请先登录管理员账号" };
    }

    const parsed = applicationApprovalSchema.safeParse({
      status: "EDITING",
      adminRemark,
      rejectedFields,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "数据校验失败",
      };
    }

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, status: true, name: true },
    });

    if (!application) {
      return { success: false, error: "未找到该申请记录" };
    }

    if (application.status !== "PENDING") {
      return { success: false, error: "当前申请状态不允许驳回修改" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id },
        data: {
          status: "EDITING",
          adminRemark: parsed.data.adminRemark,
          rejectedFields: JSON.stringify(rejectedFields),
          targetSchool: null,
        },
      });

      await tx.operationLog.create({
        data: buildStatusChangeLog({
          admin: currentAdmin,
          application,
          fromStatus: application.status,
          toStatus: "EDITING",
          adminRemark: parsed.data.adminRemark,
          rejectedFields,
        }),
      });
    });

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${id}`);
    return { success: true, error: null };
  } catch (e) {
    console.error("Reject For Editing Error:", e);
    return { success: false, error: "驳回修改操作失败" };
  }
}

// ==========================================
// 8. 提交编辑 - 家长扫码编辑后提交
// ==========================================
export async function submitApplicationEdit(
  id: string,
  data: ApplicationInput,
) {
  try {
    const parsed = applicationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "数据验证失败，请检查填写内容" };
    }

    // 原子检查状态，防止竞态条件
    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!application) {
      return { success: false, error: "未找到该申请记录" };
    }

    if (application.status !== "EDITING") {
      return { success: false, error: "该申请当前状态不允许编辑" };
    }

    const finalData = serializeFiles(parsed.data);

    await prisma.application.update({
      where: { id },
      data: {
        ...finalData,
        status: "PENDING",
        rejectedFields: "[]",
        adminRemark: null,
        targetSchool: null,
      },
    });

    revalidatePath(`/application/pending/${id}`);
    revalidatePath(`/application/edit/${id}`);
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${id}`);
    return { success: true, error: null };
  } catch (e) {
    console.error("Submit Application Edit Error:", e);
    return { success: false, error: "修改提交失败" };
  }
}

// ==========================================
// 9. 签名编辑 Token - 供管理端生成编辑二维码
// ==========================================
export async function signEditTokenAction(
  applicationId: string,
): Promise<string> {
  return signEditToken(applicationId);
}
