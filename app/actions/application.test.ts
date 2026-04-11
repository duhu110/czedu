import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createMock,
  updateMock,
  findUniqueMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn(),
  findUniqueMock: vi.fn(),
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
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import {
  createApplication,
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
    revalidatePathMock.mockReset();
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

  it("accepts NON_LOCAL applications without fileProperty", async () => {
    createMock.mockResolvedValue({ id: "app-nonlocal" });

    const result = await createApplication({
      ...baseApplicationInput,
      residencyType: "NON_LOCAL",
      fileProperty: undefined,
      fileResidencePermit: ["/uploads/residence-permit.png"],
    });

    expect(result).toEqual({ success: true, error: null });
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
