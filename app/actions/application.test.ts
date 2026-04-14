import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createMock,
  updateMock,
  findUniqueMock,
  operationLogCreateMock,
  transactionMock,
  getCurrentAdminMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn(),
  findUniqueMock: vi.fn(),
  operationLogCreateMock: vi.fn(),
  transactionMock: vi.fn(),
  getCurrentAdminMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    application: {
      create: createMock,
      update: updateMock,
      findUnique: findUniqueMock,
    },
    operationLog: {
      create: operationLogCreateMock,
    },
    $transaction: transactionMock,
  },
}));

vi.mock("@/lib/admin-session", () => ({
  getCurrentAdmin: getCurrentAdminMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import {
  createApplication,
  importApplicationsFromRows,
  rejectForEditing,
  submitApplicationSupplement,
  updateApplicationStatus,
} from "@/app/actions/application";

const baseApplicationInput = {
  semesterId: "semester-1",
  residencyType: "LOCAL" as const,
  name: "张三",
  gender: "MALE" as const,
  ethnicity: "汉族",
  idCard: "110101201001011234",
  studentId: "G2024000100001",
  guardian1Name: "李四",
  guardian1Relation: "父亲",
  guardian1Phone: "13800138000",
  guardian2Name: "",
  guardian2Relation: "",
  guardian2Phone: "",
  currentSchool: "城中区实验小学",
  currentGrade: "二年级",
  targetGrade: "三年级",
  hukouAddress: "城中区幸福路100号",
  livingAddress: "城中区幸福路100号2单元301",
  fileHukou: {
    frontPage: "/uploads/hukou-front.png",
    householderPage: "/uploads/hukou-householder.png",
    guardianPage: "/uploads/hukou-guardian.png",
    studentPage: "/uploads/hukou-student.png",
    others: [],
  },
  fileProperty: {
    propertyDeed: "/uploads/property-deed.png",
    purchaseContract: "",
    rentalCert: "",
    others: [],
  },
  fileStudentCard: [] as string[],
  fileResidencePermit: [] as string[],
};

describe("application actions", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateMock.mockReset();
    findUniqueMock.mockReset();
    operationLogCreateMock.mockReset();
    transactionMock.mockReset();
    getCurrentAdminMock.mockReset();
    revalidatePathMock.mockReset();

    transactionMock.mockImplementation(async (callback) =>
      callback({
        application: {
          update: updateMock,
        },
        operationLog: {
          create: operationLogCreateMock,
        },
      }),
    );
    getCurrentAdminMock.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      name: "系统管理员",
      isSuperAdmin: true,
      isActive: true,
    });
  });

  it("creates supplement applications when fileStudentCard is missing", async () => {
    createMock.mockResolvedValue({ id: "app-supplement" });

    const result = await createApplication(baseApplicationInput);

    expect(result).toEqual({ success: true, error: null });
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "SUPPLEMENT",
        fileStudentCard: "[]",
      }),
    });
  });

  it("creates pending applications when fileStudentCard is provided", async () => {
    createMock.mockResolvedValue({ id: "app-pending" });

    const result = await createApplication({
      ...baseApplicationInput,
      fileStudentCard: ["/uploads/student-card-1.png"],
    });

    expect(result).toEqual({ success: true, error: null });
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "PENDING",
        fileStudentCard: JSON.stringify(["/uploads/student-card-1.png"]),
      }),
    });
  });

  it("serializes fileHukou as structured JSON object", async () => {
    createMock.mockResolvedValue({ id: "app-1" });

    await createApplication(baseApplicationInput);

    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fileHukou: JSON.stringify(baseApplicationInput.fileHukou),
      }),
    });
  });

  it("serializes fileProperty as structured JSON object", async () => {
    createMock.mockResolvedValue({ id: "app-1" });

    await createApplication(baseApplicationInput);

    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fileProperty: JSON.stringify(baseApplicationInput.fileProperty),
      }),
    });
  });

  it("rejects NON_LOCAL applications without any housing certificate", async () => {
    const result = await createApplication({
      ...baseApplicationInput,
      residencyType: "NON_LOCAL",
      fileResidencePermit: ["/uploads/residence-permit.png"],
      fileProperty: {
        propertyDeed: "",
        purchaseContract: "",
        rentalCert: "",
        others: [],
      },
    });

    expect(result).toEqual({
      success: false,
      error: "数据验证失败，请检查填写内容",
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("accepts NON_LOCAL applications with a housing certificate and without residence permit", async () => {
    createMock.mockResolvedValue({ id: "app-nonlocal" });

    const result = await createApplication({
      ...baseApplicationInput,
      residencyType: "NON_LOCAL",
    });

    expect(result).toEqual({ success: true, error: null });
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        residencyType: "NON_LOCAL",
        fileProperty: JSON.stringify(baseApplicationInput.fileProperty),
        fileResidencePermit: "[]",
      }),
    });
  });

  it("rejects LOCAL applications without any housing certificate", async () => {
    const result = await createApplication({
      ...baseApplicationInput,
      fileProperty: {
        propertyDeed: "",
        purchaseContract: "",
        rentalCert: "",
        others: [],
      },
    });

    expect(result).toEqual({
      success: false,
      error: "数据验证失败，请检查填写内容",
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects supplement uploads for non-supplement applications", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-approved",
      status: "APPROVED",
      fileStudentCard: "[]",
    });

    const result = await submitApplicationSupplement("app-approved", {
      fileStudentCard: ["/uploads/student-card-1.png"],
    });

    expect(result).toEqual({
      success: false,
      error: "当前申请状态不允许补充学籍信息卡",
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("promotes supplement applications to pending after uploading fileStudentCard", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-supplement",
      status: "SUPPLEMENT",
      fileStudentCard: "[]",
    });
    updateMock.mockResolvedValue({ id: "app-supplement" });

    const result = await submitApplicationSupplement("app-supplement", {
      fileStudentCard: ["/uploads/student-card-1.png"],
    });

    expect(result).toEqual({ success: true, error: null });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "app-supplement" },
      data: {
        fileStudentCard: JSON.stringify(["/uploads/student-card-1.png"]),
        status: "PENDING",
      },
    });
  });

  it("rejects approved applications without a target school", async () => {
    const result = await updateApplicationStatus(
      "app-1",
      "APPROVED",
      "通过",
      "",
    );

    expect(result).toEqual({
      success: false,
      error: "通过申请时必须指定目标学校",
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("persists targetSchool when approving an application", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-1",
      status: "PENDING",
    });
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
    expect(operationLogCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        admin: {
          connect: { id: "admin-1" },
        },
        adminUsername: "admin",
        adminName: "系统管理员",
        action: "APPLICATION_STATUS_CHANGED",
        targetType: "APPLICATION",
        targetId: "app-1",
        details: JSON.stringify({
          fromStatus: "PENDING",
          toStatus: "APPROVED",
          adminRemark: "统筹安排",
          targetSchool: "城中区第一小学",
        }),
      }),
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/applications");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/applications/app-1");
  });

  it("rejects admin status changes when no authenticated admin is present", async () => {
    getCurrentAdminMock.mockResolvedValue(null);

    const result = await updateApplicationStatus(
      "app-1",
      "REJECTED",
      "资料不符合要求",
      "",
    );

    expect(result).toEqual({
      success: false,
      error: "请先登录管理员账号",
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(operationLogCreateMock).not.toHaveBeenCalled();
  });

  it("rejects approving applications from non-pending states", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-1",
      status: "SUPPLEMENT",
    });

    const result = await updateApplicationStatus(
      "app-1",
      "APPROVED",
      "统筹安排",
      "城中区第一小学",
    );

    expect(result).toEqual({
      success: false,
      error: "当前申请状态不允许执行该审核操作",
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects moving pending applications back to supplement status from admin review", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-1",
      status: "PENDING",
    });

    const result = await updateApplicationStatus(
      "app-1",
      "SUPPLEMENT",
      "请补充学籍信息卡",
      "",
    );

    expect(result).toEqual({
      success: false,
      error: "当前申请状态不允许执行该审核操作",
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("allows rejecting an application from supplement status", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-1",
      status: "SUPPLEMENT",
    });
    updateMock.mockResolvedValue({ id: "app-1" });

    const result = await updateApplicationStatus(
      "app-1",
      "REJECTED",
      "逾期未补齐资料",
      "",
    );

    expect(result).toEqual({ success: true, error: null });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "app-1" },
      data: {
        status: "REJECTED",
        adminRemark: "逾期未补齐资料",
        targetSchool: null,
      },
    });
  });

  it("rejects reject-for-editing from non-pending states", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-1",
      status: "EDITING",
    });

    const result = await rejectForEditing(
      "app-1",
      ["name"],
      "请修改姓名",
    );

    expect(result).toEqual({
      success: false,
      error: "当前申请状态不允许驳回修改",
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("writes an operation log when rejecting an application for editing", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-1",
      status: "PENDING",
    });
    updateMock.mockResolvedValue({ id: "app-1" });

    const result = await rejectForEditing(
      "app-1",
      ["name", "guardian1Phone"],
      "请核对姓名和手机号",
    );

    expect(result).toEqual({ success: true, error: null });
    expect(operationLogCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "APPLICATION_STATUS_CHANGED",
        targetId: "app-1",
        admin: {
          connect: { id: "admin-1" },
        },
        details: JSON.stringify({
          fromStatus: "PENDING",
          toStatus: "EDITING",
          adminRemark: "请核对姓名和手机号",
          targetSchool: null,
          rejectedFields: ["name", "guardian1Phone"],
        }),
      }),
    });
  });

  it("only updates targetSchool and status for pending applications whose imported targetSchool changed", async () => {
    findUniqueMock.mockResolvedValue({
      id: "app-1",
      name: "张三",
      semesterId: "semester-1",
      status: "PENDING",
      targetSchool: null,
      adminRemark: null,
    });
    updateMock.mockResolvedValue({ id: "app-1" });

    const result = await importApplicationsFromRows(
      [
        {
          id: "app-1",
          targetSchool: "西关街小学",
          status: "REJECTED",
          adminRemark: "这条备注应被忽略",
        },
      ],
      "semester-1",
    );

    expect(result).toEqual({
      success: true,
      error: null,
      updatedCount: 1,
      skippedCount: 0,
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "app-1" },
      data: {
        status: "APPROVED",
        targetSchool: "西关街小学",
      },
    });
    expect(operationLogCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        targetId: "app-1",
        details: JSON.stringify({
          fromStatus: "PENDING",
          toStatus: "APPROVED",
          adminRemark: null,
          targetSchool: "西关街小学",
        }),
      }),
    });
  });

  it("skips rows whose application is not pending, missing, or targetSchool is unchanged", async () => {
    findUniqueMock
      .mockResolvedValueOnce({
        id: "app-approved",
        name: "李四",
        semesterId: "semester-1",
        status: "APPROVED",
        targetSchool: "西关街小学",
        adminRemark: "已处理",
      })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "app-same-school",
        name: "王五",
        semesterId: "semester-1",
        status: "PENDING",
        targetSchool: "西关街小学",
        adminRemark: null,
      });

    const result = await importApplicationsFromRows(
      [
        {
          id: "app-approved",
          targetSchool: "城中区第一小学",
          status: "PENDING",
          adminRemark: "忽略",
        },
        {
          id: "app-missing",
          targetSchool: "城中区第二小学",
          status: "PENDING",
          adminRemark: "忽略",
        },
        {
          id: "app-same-school",
          targetSchool: "西关街小学",
          status: "PENDING",
          adminRemark: "忽略",
        },
      ],
      "semester-1",
    );

    expect(result).toEqual({
      success: true,
      error: null,
      updatedCount: 0,
      skippedCount: 3,
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(operationLogCreateMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
