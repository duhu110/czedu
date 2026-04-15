import type { ApplicationStatus } from "@prisma/client";

export type MockApplication = {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE";
  ethnicity: string;
  idCard: string;
  studentId: string;
  residencyType: "LOCAL" | "NON_LOCAL";
  propertyType: "PURCHASE" | "RENT";
  guardian1Name: string;
  guardian1Relation: string;
  guardian1Phone: string;
  guardian2Name: string | null;
  guardian2Relation: string | null;
  guardian2Phone: string | null;
  currentSchool: string;
  currentGrade: string;
  targetGrade: string;
  remark: string | null;
  targetSchool: string | null;
  hukouAddress: string;
  livingAddress: string;
  fileHukou: {
    frontPage: string;
    householderPage: string;
    guardianPage: string;
    studentPage: string;
    others: string[];
  };
  fileProperty: {
    propertyDeed: string;
    purchaseContract: string;
    rentalCert: string;
    others: string[];
  };
  fileStudentCard: string[];
  fileResidencePermit: string[];
  rejectedFields: string[];
  status: ApplicationStatus;
  adminRemark: string | null;
  semesterId: string;
  semester: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
};

const baseApplication: MockApplication = {
  id: "app-test-001",
  name: "张三",
  gender: "MALE",
  ethnicity: "汉族",
  idCard: "630103201501010011",
  studentId: "G2026001001",
  residencyType: "LOCAL",
  propertyType: "PURCHASE",
  guardian1Name: "张父",
  guardian1Relation: "父亲",
  guardian1Phone: "13800001234",
  guardian2Name: null,
  guardian2Relation: null,
  guardian2Phone: null,
  currentSchool: "城中区第三小学",
  currentGrade: "四年级",
  targetGrade: "五年级",
  remark: null,
  targetSchool: null,
  hukouAddress: "城中区南关街25号",
  livingAddress: "城中区南关街25号",
  fileHukou: {
    frontPage: "/uploads/hukou-front.png",
    householderPage: "/uploads/hukou-holder.png",
    guardianPage: "/uploads/hukou-guardian.png",
    studentPage: "/uploads/hukou-student.png",
    others: [],
  },
  fileProperty: {
    propertyDeed: "/uploads/property.png",
    purchaseContract: "",
    rentalCert: "",
    others: [],
  },
  fileStudentCard: ["/uploads/student-card.png"],
  fileResidencePermit: [],
  rejectedFields: [],
  status: "PENDING",
  adminRemark: null,
  semesterId: "semester-1",
  semester: { id: "semester-1", name: "2026年春季学期" },
  createdAt: new Date("2026-04-07T12:00:00+08:00"),
  updatedAt: new Date("2026-04-07T12:00:00+08:00"),
};

export function createMockApplication(
  overrides?: Partial<MockApplication>,
): MockApplication {
  return { ...baseApplication, ...overrides };
}

export function createPendingApplication(
  overrides?: Partial<MockApplication>,
): MockApplication {
  return createMockApplication({ status: "PENDING", targetSchool: null, ...overrides });
}

export function createApprovedApplication(
  overrides?: Partial<MockApplication>,
): MockApplication {
  return createMockApplication({
    status: "APPROVED",
    targetSchool: "西关街小学",
    adminRemark: "审核通过",
    updatedAt: new Date("2026-04-08T10:00:00+08:00"),
    ...overrides,
  });
}

export function createRejectedApplication(
  overrides?: Partial<MockApplication>,
): MockApplication {
  return createMockApplication({
    status: "REJECTED",
    adminRemark: "材料不符合要求",
    updatedAt: new Date("2026-04-08T10:00:00+08:00"),
    ...overrides,
  });
}

export function createSupplementApplication(
  overrides?: Partial<MockApplication>,
): MockApplication {
  return createMockApplication({
    status: "SUPPLEMENT",
    fileStudentCard: [],
    adminRemark: "请补充学籍信息卡",
    updatedAt: new Date("2026-04-08T10:00:00+08:00"),
    ...overrides,
  });
}

export function createEditingApplication(
  overrides?: Partial<MockApplication>,
): MockApplication {
  return createMockApplication({
    status: "EDITING",
    rejectedFields: ["name", "idCard"],
    adminRemark: "姓名和身份证号有误，请核实",
    updatedAt: new Date("2026-04-08T10:00:00+08:00"),
    ...overrides,
  });
}
